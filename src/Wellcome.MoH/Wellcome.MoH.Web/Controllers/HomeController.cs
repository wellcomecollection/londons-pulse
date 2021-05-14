using System;
using System.Diagnostics;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Wellcome.MoH.Api;
using Wellcome.MoH.Api.Library;
using Wellcome.MoH.Web.Models;

namespace Wellcome.MoH.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly IServiceApi mohService;
        
        public HomeController(IServiceApi mohService)
        {
            this.mohService = mohService;
        }
        
        public IActionResult Index()
        {
            if (Request.Path == "/moh")
            {
                return Redirect("/moh/");
            }
            return View(new SearchModel());
        }

        public IActionResult Search(SearchModel model)
        {
            model.SetDefaults(50);
            if (!(string.IsNullOrEmpty(model.Terms) && string.IsNullOrEmpty(model.Place)))
            {
                model.ReportsResult = DoSearch(model);
            }
            if (model.ReportsResult != null && model.ReportsResult.HasResults)
            {
                SetDisplayCounts(model.Page, model.PageSize, model.ReportsResult.TotalVisibleResults);
                var currentQueryString = Request.QueryString.ToString();
                SetPagerHtml(currentQueryString, model.Page, model.PageSize, model.ReportsResult.TotalVisibleResults);

                // Provide a URL for the table toggle - again, not very MVC
                var rawQueryString = Regex.Replace(currentQueryString, "&tablesonly=(\\w+)", "", RegexOptions.IgnoreCase);
                ViewData["TableToggleUrl"] = Request.Path + rawQueryString + (model.TablesOnly ? "" : "&tablesOnly=true");
            }

            model.ReportsResult ??= new ReportsResult();
            return View(model);
        }

        private void SetPagerHtml(string currentQueryString, int page, int pageSize, int total)
        {
            // The following is not very MVC!
            // It's a straight port of the wellcomelibrary.org pager control.
            var pager = new StatelessPager();
            ViewData["Pager"] = pager.GetHtml(
                Request.Path,
                page, pageSize, total,
                "page", currentQueryString, true);
        }

        private ReportsResult DoSearch(SearchModel model)
        {
            const int visibleHitsPerReport = 5;
            const int expandoThreshold = 2;
            var reports = mohService.Search(
                model.Place, 
                model.StartYear, model.EndYear, 
                model.Terms, 
                model.Page, model.PageSize,
                model.TablesOnly, 
                true, true, 
                visibleHitsPerReport, expandoThreshold);
            return reports;
        }

        public IActionResult BrowseNormalised(string normalisedPlace, SearchModel model)
        {
            model.SetDefaults(20);
            model.NormalisedPlace = normalisedPlace;
            model.Place = null; // can't have both!
            model.ReportsResult = mohService.BrowseNormalised(
                model.NormalisedPlace, 
                model.StartYear, model.EndYear, 
                model.Page, model.PageSize, 
                model.Ordering);

            ViewData["ZipRoot"] = $"/moh/service/zip?op={normalisedPlace}&useNormalisedPlace=true";
            return BrowseView(model);
        }
        
        public IActionResult Browse(SearchModel model)
        {
            model.SetDefaults(20);
            model.NormalisedPlace = null; // can't have both!
            model.ReportsResult = mohService.BrowseAnyPlace(
                model.Place, 
                model.StartYear, model.EndYear, 
                model.Page, model.PageSize, 
                model.Ordering);

            var op = model.Place;
            if (string.IsNullOrWhiteSpace(op)) op = "years";
            ViewData["ZipRoot"] = $"/moh/service/zip?op={op}&startYear={model.StartYear}&endYear={model.EndYear}";
            return BrowseView(model);
        }
        
        public IActionResult BrowseView(SearchModel model)
        {
            if (model.ReportsResult.HasResults)
            {
                SetDisplayCounts(model.Page, model.PageSize, model.ReportsResult.TotalResults);
            }

            var currentQueryString = Request.QueryString.ToString();
            SetPagerHtml(currentQueryString, model.Page, model.PageSize, model.ReportsResult.TotalResults);
            return View("Browse", model);
        }

        public IActionResult Zip(ZipModel model)
        {
            return NotFound();
        }
        

        private void SetDisplayCounts(int page, int pageSize, int total)
        {
            ViewData["FirstCount"] = (page - 1) * pageSize + 1;
            int end = Math.Min(total, page * pageSize);
            ViewData["LastCount"] = Math.Min(end, total);
        }


        private IActionResult ReportInternal(string id)
        {
            var report = mohService.GetReportWithAllTableSummaries(id);
            if (report == null)
            {
                return NotFound("Invalid B Number");
            }
            
            ViewData["Manifest"] = $"{Constants.Manifest}{id}";
            ViewData["CanvasIndex"] = 0;
            ViewData["UVCssClass"] = "player";
            ViewData["ZipRoot"] = $"/moh/service/zip?op={id}";
            return View(report);
        }
        
        public IActionResult Report(string id, int page = -1)
        {
            // make a canonical URL
            var normalisedBNumber = WellcomeLibraryIdentifiers.GetNormalisedBNumber(id, false);
            if (id != normalisedBNumber)
            {
                var normalisedUrl = $"/moh/report/{normalisedBNumber}";
                if (page >= 0) normalisedUrl += $"/{page}";
                return RedirectPermanent(normalisedUrl);
            }
            
            if (page == -1)
            {
                return ReportInternal(id);
            }

            var reportPage = mohService.GetPage(id, page);
            if (reportPage == null)
            {
                return NotFound("Invalid B Number or page number");
            }
            ViewData["Manifest"] = $"{Constants.Manifest}{id}";
            ViewData["CanvasIndex"] = page;
            ViewData["UVCssClass"] = "player separator";
            return View("Page", reportPage);
        }
        
        public IActionResult About(string detail = null)
        {
            if (!string.IsNullOrWhiteSpace(detail))
            {
                return View(detail.Replace("/", ""));
            }

            return View();
        }
        
        
        public IActionResult BuildSearch()
        {
            // This is not a very MVC way of doing things.
            // It's an intermediate URL-prettifier step before sending a search op to the actual Search action.
            string terms = Request.Form["terms"];
            string place = Request.Form["place"];
            int startYear = Utils.GetIntValue(Request.Form["year-from"], -1);
            int endYear = Utils.GetIntValue(Request.Form["year-to"], -1);
            string orderby = Request.Form["orderby"];

            var sb = new StringBuilder("/moh/");
            bool first = true;
            if (!string.IsNullOrWhiteSpace(terms))
            {
                sb.Append("search/?terms=" + WebUtility.UrlEncode(terms));
                first = false;
            }
            else
            {
                sb.Append("browse/"); 
            }
            if (!string.IsNullOrWhiteSpace(place))
            {
                sb.Append(first ? "?" : "&");
                sb.Append("place=" + WebUtility.UrlEncode(place));
                first = false;
            }
            if (startYear > 0)
            {
                sb.Append(first ? "?" : "&");
                sb.Append("startYear=" + startYear);
                first = false;
            }
            if (endYear > 0)
            {
                sb.Append(first ? "?" : "&");
                sb.Append("endYear=" + endYear);
            }
            if ("title".Equals(orderby))
            {
                sb.Append(first ? "?" : "&");
                sb.Append("orderby=title");
            }

            return Redirect(sb.ToString());
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel {RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier});
        }

    }
}
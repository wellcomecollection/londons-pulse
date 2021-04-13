using System;
using System.Diagnostics;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Wellcome.MoH.Api;
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
            return View(new SearchModel());
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

            var sb = new StringBuilder("/");
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

        public IActionResult Search(SearchModel model)
        {
            model.SetDefaults();
            ReportsResult reports = null;
            if (!(string.IsNullOrEmpty(model.Terms) && string.IsNullOrEmpty(model.Place)))
            {
                reports = DoSearch(model);
            }
            if (reports != null && reports.HasResults)
            {
                ViewData["FirstCount"] = (model.Page - 1) * model.PageSize + 1;
                int end = Math.Min(reports.TotalResults, model.Page * model.PageSize);
                ViewData["LastCount"] = Math.Min(end, reports.TotalVisibleResults);
     
                // The following is not very MVC!
                // It's a straight port of the wellcomelibrary.org pager control.
                var currentQueryString = Request.QueryString.ToString();
                var pager = new StatelessPager();
                ViewData["Pager"] = pager.GetHtml(
                    Request.Path, 
                    model.Page, model.PageSize, reports.TotalVisibleResults, 
                    "page", currentQueryString, true);
                
                // Provide a URL for the table toggle - again, not very MVC
                var rawQueryString = Regex.Replace(currentQueryString, "&tablesonly=(\\w+)", "", RegexOptions.IgnoreCase);
                if (model.TablesOnly)
                {
                    ViewData["TableToggleUrl"] = Request.Path + rawQueryString;
                }
                else
                {
                    ViewData["TableToggleUrl"] = Request.Path + rawQueryString + "&tablesOnly=true";
                }
            }

            model.ReportsResult = reports;
            return View(model);
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

        public IActionResult Report(string id)
        {
            throw new NotImplementedException();
        }
        
        public IActionResult About(string detail = null)
        {
            if (string.IsNullOrWhiteSpace(detail))
            {
                return View();
            }
            var segment = detail.Split('/')[0];
            return segment switch
            {
                "about-the-medical-officer-of-health-reports" => View("AboutTheMoHReports"),
                "the-health-of-the-people" => View("TheHealthOfThePeople"),
                "new-kind-of-medical-professional" => View("NewKindOfMedicalProfessional"),
                "the-changing-face-of-london" => View("TheChangingFaceOfLondon"),
                "using-the-report-data" => View("UsingTheReportData"),
                _ => View()
            };
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel {RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier});
        }

    }
}
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Wellcome.MoH.Api;
using Wellcome.MoH.Api.Library;

namespace Wellcome.MoH.Web.Controllers
{    
    [Route("moh/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceApi mohService;
        private readonly ILogger<ServiceController> logger;

        public ServiceController(
            IServiceApi mohService,
            ILogger<ServiceController> logger)
        {
            this.mohService = mohService;
            this.logger = logger;
        }
        
        /// <summary>
        /// THE browse list of the Moh homepage, typically a list of moder London Boroughs
        /// </summary>
        [Route("normalisednames")]
        public IActionResult NormalisedNames()
        {
            return Ok(mohService.GetNormalisedNames());
        }

        /// <summary>
        /// All the placenames available, derived from MARC
        /// </summary>
        [Route("allplacenames")]
        public IActionResult AllPlaceNames()
        {
            return Ok(mohService.GetAllPlaceNames());
        }
        
        /// <summary>
        /// All the placenames available, derived from MARC, after some data cleansing
        /// </summary>
        [Route("normalisedmohplacenames")]
        public IActionResult NormalisedMoHPlaceNames()
        {
            return Ok(mohService.GetNormalisedMoHPlaceNames());
        }
        
        /// <summary>
        /// Used to autocomplete the "in" box on the homepage search
        /// </summary>
        /// <param name="fragment"></param>
        /// <returns></returns>
        [Route("autocompleteplace")]
        public IActionResult AutoCompletePlace(string fragment)
        {
            return Ok(mohService.AutoCompletePlace(fragment));
        }
        
        /// <summary>
        /// Fetch sparsely populated reports for a normalised place between the years specified (inclusive)
        /// restrict to the normalised place name
        /// </summary>
        /// <param name="normalisedPlace"></param>
        /// <param name="startYear"></param>
        /// <param name="endYear"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="ordering"></param>
        /// <returns></returns>
        [Route("browsenormalised")]
        public IActionResult BrowseNormalised(
            string normalisedPlace = null, 
            int startYear = 1848, int endYear = 2020, 
            int page = 1, int pageSize = 100, 
            Ordering ordering = Ordering.Date)
        {
            return Ok(mohService.BrowseNormalised(normalisedPlace, startYear, endYear, page, pageSize, ordering));
        }
        
        /// <summary> 
        /// Fetch sparsely populated reports for any place between the years specified (inclusive)
        /// </summary>
        /// <param name="place"></param>
        /// <param name="startYear"></param>
        /// <param name="endYear"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="ordering"></param>
        /// <returns></returns>
        [Route("browseanyplace")]
        public IActionResult BrowseAnyPlace(
            string place = null,
            int startYear = 1848, int endYear = 2020,
            int page = 1, int pageSize = 100,
            Ordering ordering = Ordering.Date)
        {
            return Ok(mohService.BrowseAnyPlace(place, startYear, endYear, page, pageSize, ordering));
        }
        
        /// <summary>
        /// For the report home page
        /// </summary>
        /// <param name="bNumber"></param>
        /// <returns></returns>
        [Route("report/{bNumber}")]
        public IActionResult Report(string bNumber)
        {
            return Ok(mohService.GetReportWithAllTableSummaries(bNumber));
        }
        
        /// <summary>
        /// Gets the single page view, with tables
        /// </summary>
        /// <param name="bNumber"></param>
        /// <param name="imageIndex"></param>
        /// <returns></returns>
        [Route("page/{bNumber}/{imageIndex}")]
        public IActionResult Page(string bNumber, int imageIndex)
        {
            return Ok(mohService.GetPage(bNumber, imageIndex));
        }
        
        /// <summary>
        /// Fetch Hit-populated reports for this page
        /// </summary>
        /// <param name="constrainedPlaceName"></param>
        /// <param name="startYear"></param>
        /// <param name="endYear"></param>
        /// <param name="terms"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="tablesOnly"></param>
        /// <param name="groupIntoReports"></param>
        /// <param name="useSpecialGroupingBehaviour"></param>
        /// <param name="visibleHitsPerReport"></param>
        /// <param name="expandoThreshold"></param>
        /// <returns></returns>
        [Route("search")]
        public IActionResult Search(
            string terms,
            string constrainedPlaceName = null,
            int startYear = 1848, int endYear = 2020,
            int page = 1, int pageSize = 100,
            bool tablesOnly = false, bool groupIntoReports = true,
            bool useSpecialGroupingBehaviour = true, int visibleHitsPerReport = 5, int expandoThreshold = 2)
        {
            return Ok(mohService.Search(
                constrainedPlaceName, startYear, endYear, terms,
                page, pageSize, tablesOnly,
                groupIntoReports, useSpecialGroupingBehaviour,
                visibleHitsPerReport, expandoThreshold));
        }
        
        [Route("tables/{tableId}.{fileExt}")]
        public ContentResult Tables(long tableId, string fileExt)
        {
            string c = mohService.GetTableText(tableId, fileExt);
            var cr = new ContentResult {Content = c};
            
            switch (fileExt)
            {
                case "html":
                    cr.ContentType = "text/html";
                    break;
                case "xml":
                    cr.ContentType = "text/xml";
                    break;
                case "csv":
                    // TODO: Can't set this in .NET Core. Test what's happening here.
                    // cr.ContentEncoding = Encoding.Default;
                    cr.ContentType = "text/csv";
                    break;
                default:
                    cr.ContentType = "text/plain";
                    break;
            }
            Response.Headers.Add("content-disposition", "attachment; filename=" + tableId + "." + fileExt);
            return cr;
        }
        
        
        [Route("zip")]
        public IActionResult Zip(string op, string format, int startYear = 0, int endYear = 2020,
                              bool useNormalisedPlace = false)
        {
            // 25200 = 7 days
            Response.Headers.Add("Cache-Control", "public, s-maxage=25200, max-age=25200");
            bool storeZipPermanently = useNormalisedPlace || (op == "years" && mohService.IsKnownDateRange(startYear, endYear));
            string name; 
            if (op.IsBNumber())
            {
                name = mohService.GetZipFileName(op, format);
            }
            else
            {
                if (op == "years") op = null;
                name = mohService.GetZipFileName(op, useNormalisedPlace, startYear, endYear, format);
            }
            var storedFile = new FileInfo(Path.Combine(Path.GetTempPath(), name));
            if (storeZipPermanently)
            {
                const string alternateLocation = "https://s3-eu-west-1.amazonaws.com/moh-reports/zips/";
                // redirect to the same file on AWS                                    
                var alternateFile = alternateLocation + storedFile.Name;
                logger.LogInformation("Redirecting zip request to {0}", alternateFile);
                return Redirect(alternateFile);
            }
            
            // we got here so it's not an existing file
            // DotNetZip doesn't like writing very large files to a MemoryStream, so we will need to create
            // a temp file
            
            var tempFile = Path.GetTempFileName();
            using (var stream = new FileStream(tempFile, FileMode.Create))
            {
                if (op.IsBNumber())
                {
                    mohService.WriteZipFile(op, format, stream);
                }
                else
                {
                    if (op == "years") op = null;
                    mohService.WriteZipFile(op, useNormalisedPlace, startYear, endYear, format, stream);
                }
                return File(tempFile, "application/zip", name);
            }
        }
    }
}
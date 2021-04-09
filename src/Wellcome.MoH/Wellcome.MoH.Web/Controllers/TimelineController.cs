using Microsoft.AspNetCore.Mvc;

namespace Wellcome.MoH.Web.Controllers
{
    public class TimelineController : Controller
    {
        public IActionResult Index()
        {
            ViewData["HideNav"] = true;
            ViewData["Title"] = "Health of London timeline";
            ViewData["Description"] = "Health of London timeline";
            ViewData["Timeline"] = "/timelines/moh.json";
            return View();
        }
        
        public IActionResult Fomg()
        {
            ViewData["HideNav"] = true;
            ViewData["Title"] = "Foundation of Modern Genetics Timeline";
            ViewData["Description"] = "Foundation of Modern Genetics Timeline";
            ViewData["Timeline"] = "/timelines/fomg.json";
            return View("Index");
        }

        public IActionResult Frame()
        {
            return View();
        }
    }
}
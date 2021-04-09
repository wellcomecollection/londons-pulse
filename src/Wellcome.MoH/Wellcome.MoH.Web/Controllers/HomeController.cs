﻿using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Wellcome.MoH.Web.Models;

namespace Wellcome.MoH.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
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
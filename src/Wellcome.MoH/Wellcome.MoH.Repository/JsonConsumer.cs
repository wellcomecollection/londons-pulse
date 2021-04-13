using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using Newtonsoft.Json;
using Wellcome.MoH.Api;

namespace Wellcome.MoH.Repository
{

    public class JsonConsumer : IServiceApi
    {
        public const string PagePathFormat = "{0}/report/{1}/{2}#?asi=0&ai={2}";

        private static readonly string DdsRoot = "https://wellcomelibrary.org";

        public string[] GetNormalisedNames()
        {
            return GetObject<string[]>($"{DdsRoot}/service/moh/NormalisedNames");
        }

        public string[] GetAllPlaceNames()
        {
            return GetObject<string[]>($"{DdsRoot}/service/moh/AllPlaceNames");
        }

        public string[] GetNormalisedMoHPlaceNames()
        {
            return GetObject<string[]>($"{DdsRoot}/service/moh/NormalisedMoHPlaceNames");
        }

        public string[] AutoCompletePlace(string fragment)
        {
            // let's do this here rather than invoke an extra HTTP call
            return GetNormalisedMoHPlaceNames().Where(s => s.Contains(fragment)).ToArray();
            //var url = String.Format("{0}/service/moh/AutoCompletePlace?fragment={1}", DdsRoot, fragment);
            //return GetObject<string[]>(url);
        }

        public ReportsResult BrowseNormalised(string normalisedPlace, int startYear, int endYear, int page, int pageSize, Ordering ordering)
        {
            var qs = GetQueryString(null, "normalisedPlace", normalisedPlace, startYear, endYear, 
                page, pageSize, ordering, null, null);
            return GetObject<ReportsResult>($"{DdsRoot}/service/moh/BrowseNormalised{qs}");
        }

        public ReportsResult BrowseAnyPlace(string anyPlace, int startYear, int endYear, int page, int pageSize, Ordering ordering)
        {
            var qs = GetQueryString(null, "place", anyPlace, startYear, endYear, 
                page, pageSize, ordering, null, null);
            return GetObject<ReportsResult>($"{DdsRoot}/service/moh/BrowseAnyPlace{qs}");
        }

        public Report GetReportWithAllTableSummaries(string bNumber)
        {
            return GetObject<Report>($"{DdsRoot}/service/moh/Report/{bNumber}");
        }

        public Page GetPage(string bNumber, int imageIndex)
        {
            return GetObject<Page>($"{DdsRoot}/service/moh/Page/{bNumber}/{imageIndex}");
        }

        public ReportsResult Search(string constrainedPlaceName, int startYear, int endYear, string terms, 
            int page, int pageSize, bool tablesOnly, bool groupIntoReports,
            bool useSpecialGroupingBehaviour, int visibleHitsPerReport, int expandoThreshold)
        {
            var qs = GetQueryString(terms, "constrainedPlaceName", constrainedPlaceName, startYear, endYear, 
                page, pageSize, Ordering.None, tablesOnly, groupIntoReports);
            qs += $"&useSpecialGroupingBehaviour={useSpecialGroupingBehaviour}&visibleHitsPerReport={visibleHitsPerReport}&expandoThreshold={expandoThreshold}";
            return GetObject<ReportsResult>($"{DdsRoot}/service/moh/Search{qs}");
        }

        public string GetTableText(long tableId, string fileExt)
        {
            throw new NotImplementedException();
        }

        public string GetZipFileName(string bNumber, string format)
        {
            throw new NotImplementedException();
        }

        public string GetZipFileName(string place, bool useNormalisedPlace, int startYear, int endYear, string format)
        {
            throw new NotImplementedException();
        }

        public void WriteZipFile(string bNumber, string format, Stream stream)
        {
            throw new NotImplementedException();
        }

        public void WriteZipFile(string place, bool useNormalisedPlace, int startYear, int endYear, string format, Stream stream)
        {
            throw new NotImplementedException();
        }

        public bool IsKnownDateRange(int startYear, int endYear)
        {
            throw new NotImplementedException();
        }

        private static string GetQueryString(string terms, string placeParameterName, string placeParameterValue,
                                             int startYear, int endYear, int page, int pageSize, Ordering ordering, 
                                            bool? tablesOnly, bool? groupIntoReports)
        {
            int parameterNumber = 0;
            var sb = new StringBuilder();
            if (!string.IsNullOrWhiteSpace(terms))
            {
                sb.Append(parameterNumber++ == 0 ? '?' : '&');
                sb.AppendFormat("{0}={1}", "terms", terms);
            }
            if (!string.IsNullOrWhiteSpace(placeParameterValue))
            {
                sb.Append(parameterNumber++ == 0 ? '?' : '&');
                sb.AppendFormat("{0}={1}", placeParameterName, placeParameterValue);
            }
            if (startYear >= 1848)
            {
                sb.Append(parameterNumber++ == 0 ? '?' : '&');
                sb.AppendFormat("{0}={1}", "startYear", startYear);
            }
            if (endYear >= 1848 && endYear <= 2020)
            {
                sb.Append(parameterNumber++ == 0 ? '?' : '&');
                sb.AppendFormat("{0}={1}", "endYear", endYear);
            }
            if (page > 0)
            {
                sb.Append(parameterNumber++ == 0 ? '?' : '&');
                sb.AppendFormat("{0}={1}", "page", page);
            }
            if (pageSize <= 0) pageSize = 100;
            sb.Append(parameterNumber == 0 ? '?' : '&');
            sb.AppendFormat("{0}={1}", "pageSize", pageSize);
            if (ordering != Ordering.None)
            {
                sb.AppendFormat("&{0}={1}", "ordering", ordering);
            }
            if (tablesOnly.HasValue)
            {
                sb.AppendFormat("&{0}={1}", "tablesOnly", tablesOnly.Value);
            }
            if (groupIntoReports.HasValue)
            {
                sb.AppendFormat("&{0}={1}", "groupIntoReports", groupIntoReports.Value);
            }

            return sb.ToString();
        }


        private static T GetObject<T>(string url)
        {
            using var wc = new WebClient { Encoding = Encoding.UTF8 };
            var json = wc.DownloadString(url);
            return JsonConvert.DeserializeObject<T>(json);
        }
    }
}
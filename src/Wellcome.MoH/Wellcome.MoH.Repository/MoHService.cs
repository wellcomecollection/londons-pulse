using System.IO;
using Wellcome.MoH.Api;

namespace Wellcome.MoH.Repository
{
    public class MoHService : IServiceApi
    {
        public string[] GetNormalisedNames()
        {
            throw new System.NotImplementedException();
        }

        public string[] GetNormalisedMoHPlaceNames()
        {
            throw new System.NotImplementedException();
        }

        public string[] GetAllPlaceNames()
        {
            throw new System.NotImplementedException();
        }

        public string[] AutoCompletePlace(string fragment)
        {
            throw new System.NotImplementedException();
        }

        public ReportsResult BrowseNormalised(string normalisedPlace, int startYear, int endYear, int page, int pageSize,
            Ordering ordering)
        {
            throw new System.NotImplementedException();
        }

        public ReportsResult BrowseAnyPlace(string anyPlace, int startYear, int endYear, int page, int pageSize, Ordering ordering)
        {
            throw new System.NotImplementedException();
        }

        public Report GetReportWithAllTableSummaries(string bNumber)
        {
            throw new System.NotImplementedException();
        }

        public Page GetPage(string bNumber, int imageIndex)
        {
            throw new System.NotImplementedException();
        }

        public ReportsResult Search(string constrainedPlaceName, int startYear, int endYear, string terms, int page, int pageSize,
            bool tablesOnly, bool groupIntoReports, bool useSpecialGroupingBehaviour, int visibleHitsPerReport,
            int expandoThreshold)
        {
            throw new System.NotImplementedException();
        }

        public string GetTableText(long tableId, string fileExt)
        {
            throw new System.NotImplementedException();
        }

        public string GetZipFileName(string bNumber, string format)
        {
            throw new System.NotImplementedException();
        }

        public string GetZipFileName(string place, bool useNormalisedPlace, int startYear, int endYear, string format)
        {
            throw new System.NotImplementedException();
        }

        public void WriteZipFile(string bNumber, string format, Stream stream)
        {
            throw new System.NotImplementedException();
        }

        public void WriteZipFile(string place, bool useNormalisedPlace, int startYear, int endYear, string format, Stream stream)
        {
            throw new System.NotImplementedException();
        }

        public bool IsKnownDateRange(int startYear, int endYear)
        {
            throw new System.NotImplementedException();
        }
    }
}
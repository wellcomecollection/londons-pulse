using System.Collections.Generic;
using System.Linq;

namespace Wellcome.MoH.Api
{
    public class SearchModel
    {
        private static int MinYear = 1848;
        private static int MaxYear = 1972;
        
        public int StartYear { get; set; }
        public int EndYear { get; set; }

        public string Terms { get; }
        
        public string Place { get; }
        
        public bool TablesOnly { get; }

        public int Page { get; }
        public int PageSize { get; }

        public SearchModel()
        {
            ConstrainYears();
        }

        public SearchModel(
            int startYear, int endYear,
            string terms, string place,
            int page = 1, int pageSize = 50,
            bool tablesOnly = false)
        {
            StartYear = startYear;
            EndYear = endYear;
            Terms = terms;
            Place = place;
            TablesOnly = tablesOnly;
            Page = page;
            PageSize = pageSize;

            if (!string.IsNullOrWhiteSpace(Place) && Place.Trim().StartsWith("(unset"))
            {
                Place = null;
            } 
            ConstrainYears();
        }

        private void ConstrainYears()
        {
            if (EndYear < MinYear) EndYear = MaxYear;
            if (StartYear < MinYear) StartYear = MinYear;
            if (EndYear > MaxYear) EndYear = MaxYear;
            if (StartYear > EndYear) StartYear = EndYear;
        }

        public IEnumerable<int> GetYears()
        {
            return Enumerable.Range(MinYear, MaxYear + 1 - MinYear);
        }
    }
}
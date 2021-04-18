using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Wellcome.MoH.Api;

namespace Wellcome.MoH.Web.Models
{
    [BindProperties(SupportsGet = true)]
    public class SearchModel
    {
        private static int MinYear = 1848;
        private static int MaxYear = 1972;
        
        [FromQuery]
        public int StartYear { get; set; }
        
        [FromQuery]
        public int EndYear { get; set; }
        
        [FromQuery]
        public string Terms { get; set; }
        
        [FromQuery]
        public string Place { get; set; }
        
        [FromQuery]
        public string NormalisedPlace { get; set; }

        [FromQuery]
        public bool TablesOnly { get; set; }
        
        [FromQuery]
        public int Page { get; set; }

        [FromQuery]
        public int PageSize { get; set; }
        
        [FromQuery]
        public string OrderBy { get; set; }

        public ReportsResult ReportsResult { get; set; }
        
        public Ordering Ordering { get; set; }
        

        public void SetDefaults(int pageSize)
        {
            if (EndYear < MinYear) EndYear = MaxYear;
            if (StartYear < MinYear) StartYear = MinYear;
            if (EndYear > MaxYear) EndYear = MaxYear;
            if (StartYear > EndYear) StartYear = EndYear;
            if (!string.IsNullOrWhiteSpace(Place) && Place.Trim().StartsWith("(unset"))
            {
                Place = null;
            }

            if (Page <= 0) Page = 1;
            if (PageSize <= 0) PageSize = pageSize;
            Ordering = OrderBy=="title" ? Ordering.DisplayName :  Ordering.Date;
        }

        public IEnumerable<int> GetYears()
        {
            return Enumerable.Range(MinYear, MaxYear + 1 - MinYear);
        }
    }
}
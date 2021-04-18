using System;

namespace Wellcome.MoH.Api
{
    [Serializable]
    public class ReportsResult
    {
        public Report[] PageOfReports { get; set; }
        public int TotalResults { get; set; } // used in browse (and search?)
        public int TotalReports { get; set; } // only used in search
        public int TotalVisibleResults { get; set; } // only used in search, and for special paging behaviour
        public bool PreCanned { get; set; }


        public bool HasResults => TotalResults > 0 || TotalReports > 0;
    }
}
using System;

namespace Wellcome.MoH.Api
{
    [Serializable]
    public class Report
    {
        // basic, required for URI construction
        public int ShortBNumber { get; set; }
        public string BNumber { get; set; }

        // required for browsing
        public string NormalisedPlace { get; set; }
        public string DisplayPlace { get; set; }
        public string Thumbnail { get; set; }
        public string Title { get; set; }
        public int Year { get; set; }
        public string YearString { get; set; }
        public string Author { get; set; }
        public int PageCount { get; set; }
        public int TableCount { get; set; }
        public int PublicationYear { get; set; }

        // additionally required for searching
        public TableSummary[] TableSummaries { get; set; } // also used for report cover (browse whole report)
        public TextHit[] TextHits { get; set; }
    }
}
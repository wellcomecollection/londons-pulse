using System;

namespace Wellcome.MoH.Api
{
    [Serializable]
    public class Page
    {
        // populated only with what is required..
        public Report Report { get; set; }

        public long Id { get; set; }
        public int Index { get; set; }
        public string OrderLabel { get; set; }
        public string Thumbnail { get; set; }
        public string PreviewImage { get; set; } // used for testing

        // The raw text, which we will use for display.
        public string RawText { get; set; }
        public Table[] Tables { get; set; }

    }
}
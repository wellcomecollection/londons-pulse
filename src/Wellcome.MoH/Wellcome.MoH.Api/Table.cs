using System;

namespace Wellcome.MoH.Api
{
    [Serializable]
    public class Table
    {
        public long Id { get; set; }
        public string Caption { get; set; }
        public int TableIndex { get; set; }
        public string Html { get; set; }

        // These are positions in ReportPage.RawText, not in the normalised full text, which we don't have here
        public int RawTextStart { get; set; }
        public int RawTextEnd { get; set; }

        // this is the position of the start word in the normalised text, i.e., the key in Text.Words dictionary
        public int StartWordPosition { get; set; }

        // the player might wish to use these
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        // for diagnostics:
        public string MatchMethod { get; set; }
        public string SourceFile { get; set; }
    }
}
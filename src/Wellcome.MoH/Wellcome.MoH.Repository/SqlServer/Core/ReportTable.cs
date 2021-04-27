using System;

namespace Wellcome.MoH.Repository.SqlServer.Core
{

    public class ReportTable
    {
        public long Id { get; set; }
        // fk
        public int ShortBNumber { get; set; }
        public int ImageIndex { get; set; }
        public string OrderLabel { get; set; }
        public string Caption { get; set; }
        public int TableIndex { get; set; }
        public string Xml { get; set; }
        public string Csv { get; set; }
        public string Html { get; set; }
        public string TableCaptionAndText { get; set; }


        // additions for production

        // the path of the source file, from PlanMan, that this table was parsed from
        public string SourceFile { get; set; }

        public string HeaderSummary { get; set; }

        // These are positions in ReportPage.RawText, not in the normalised full text, which we don't have here
        public int RawTextStart { get; set; }
        public int RawTextEnd { get; set; }

        // this is the position of the start word in the normalised text, i.e., the key in Text.Words dictionary
        public int StartWordPosition { get; set; }

        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        public string MatchMethod { get; set; }
        public Guid? ImageId { get; set; }

        // does the ALTO for this table's page contain a ComposedBlock element?
        public bool? HasComposedBlock { get; set; }
    }
}
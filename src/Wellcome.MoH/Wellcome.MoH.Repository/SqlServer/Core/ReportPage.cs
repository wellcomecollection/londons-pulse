using System;

namespace Wellcome.MoH.Repository.SqlServer.Core
{
    public class ReportPage
    {
        // PK
        public long Id { get; set; }
        public int ShortBNumber { get; set; }
        public int ImageIndex { get; set; }

        // The raw text, which we will use for display.
        public string RawText { get; set; }

        public Guid ImageId { get; set; }
        public string OrderLabel { get; set; }


        // positions of tables etc are given for the book as a whole, but we don't have access to that on a single page.
        // We only have the raw text for that page, in the Text property above. So when finding positions of tables
        // we need to subtract this offset

        // do we need this?
        //public int NormalisedTextOffset { get; set; }
        //public int NormalisedRawOffset { get; set; }
    }
}
using System;

namespace Wellcome.MoH.Api
{
    [Serializable]
    public class TableSummary : Hit
    {
        public string Caption { get; set; }
        public string HeaderSummary { get; set; }
        public int TableIndex { get; set; }
        public long TableId { get; set; }
    }
}
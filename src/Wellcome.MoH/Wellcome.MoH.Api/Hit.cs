using System;

namespace Wellcome.MoH.Api
{
    [Serializable]
    public class Hit
    {
        public int Rank { get; set; }
        public int PageIndex { get; set; }
        public string OrderLabel { get; set; }
    }
}
using Microsoft.AspNetCore.Mvc;

namespace Wellcome.MoH.Web.Models
{
    public class ZipModel
    {
        [FromQuery]
        public string Op { get; set; }
        [FromQuery]
        public bool UseNormalisedPlace { get; set; }
        [FromQuery]
        public int StartYear { get; set; }
        [FromQuery]
        public int EndYear { get; set; }
        [FromQuery]
        public string Format { get; set; }
    }
}
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Wellcome.MoH.Repository.SqlServer.Core
{
    public class PlaceMapping
    {
        [Key]
        public int Id { get; set; }
        public string MoHPlace { get; set; } // the value from the Planman XML, or from a MARC tag
        public int? GazetteerPlace { get; set; }
        public string MatchType { get; set; }

        // additional
        public string NormalisedMoHPlace { get; set; }
        public int MarcSource { get; set; } // 0 for Planman, 110 or 651 for MARC
        public string NormalisedPlace { get; set; } // should we put these in to a separate table? no
        public string SecondaryNormalisedPlace { get; set; }
        // public virtual ICollection<MoHReport> MoHReports { get; set; } 
        
        public ICollection<MoHReportPlaceMapping> MoHReportPlaceMappings { get; set; }
    }
}
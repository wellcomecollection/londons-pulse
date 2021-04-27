using System;
using System.ComponentModel.DataAnnotations;

namespace Wellcome.MoH.Repository.SqlServer.Core
{
    public class GazetteerPlace
    {
        [Key]
        public int SEQ { get; set; }
        public string KM_REF { get; set; }
        public string DEF_NAM { get; set; }
        public string TILE_REF { get; set; }
        public Int16 LAT_DEG { get; set; }
        public float LAT_MIN { get; set; }
        public Int16 LONG_DEG { get; set; }
        public float LONG_MIN { get; set; }
        public int NORTH { get; set; }
        public int EAST { get; set; }
        public string GMT { get; set; }
        public string CO_CODE { get; set; }
        public string COUNTY { get; set; }
        public string FULL_COUNTY { get; set; }
        public string F_CODE { get; set; }
        public DateTime? E_DATE { get; set; }
        public string UPDATE_CO { get; set; }
        public Int16 SHEET_1 { get; set; }
        public Int16 SHEET_2 { get; set; }
        public Int16 SHEET_3 { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace Wellcome.MoH.Repository.SqlServer.Core
{
    public class MissingPlanmanTable
    {
        [Key]
        public int Id { get; set; }
        public int ShortBNumber { get; set; }
        public int ImageIndex { get; set; }
        public int TableIndex { get; set; }
    }
}
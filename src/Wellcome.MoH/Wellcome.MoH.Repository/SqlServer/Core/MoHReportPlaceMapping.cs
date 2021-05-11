namespace Wellcome.MoH.Repository.SqlServer.Core
{
    public class MoHReportPlaceMapping
    {
        public int ShortBNumber { get; set; }
        public int PlaceMappingId { get; set; }
        public MoHReport MoHReport { get; set; }
        public PlaceMapping PlaceMapping { get; set; }
    }
}
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Wellcome.MoH.Repository.SqlServer.Core;

namespace Wellcome.MoH.Repository.SqlServer
{
    public class MoHContext : DbContext
    {
        public DbSet<MoHReport> MoHReports { get; set; }
        public DbSet<ReportPage> ReportPages { get; set; }
        public DbSet<ReportTable> ReportTables { get; set; }
        public DbSet<ReportParseError> ReportParseErrors { get; set; }
        public DbSet<GazetteerPlace> GazetteerPlaces { get; set; }
        public DbSet<PlaceMapping> PlaceMappings { get; set; }
        public DbSet<MissingPlanmanTable> MissingPlanmanTables { get; set; }
        
        
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MoHReport>()
                .HasKey(e => e.ShortBNumber)
                .Property(p => p.ShortBNumber)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
            modelBuilder.Entity<ReportPage>()
                .HasKey(e => e.Id)
                .Property(p => p.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
            modelBuilder.Entity<ReportTable>()
                .HasKey(e => e.Id)
                .Property(p => p.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
            modelBuilder.Entity<GazetteerPlace>()
                .HasKey(p => p.SEQ)
                .Property(p => p.SEQ)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
        
            modelBuilder.Entity<MoHReport>()
                .HasMany(report => report.PlaceMappings)
                .WithMany(placeMapping => placeMapping.MoHReports)
                .Map(m =>
                {
                    m.ToTable("MoHReportPlaceMapping");
                    m.MapLeftKey("ShortBNumber");
                    m.MapRightKey("PlaceMappingId"); 
                });
        }
    }
}
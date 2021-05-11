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
        public DbSet<PlaceMapping> PlaceMappings { get; set; }
        public DbSet<MoHReportPlaceMapping> MoHReportPlaceMappings { get; set; }

        public MoHContext(DbContextOptions<MoHContext> options) : base(options)
        { }

        public MoHContext()
        { }
        
        // Not used in public facing MOH site
        // public DbSet<GazetteerPlace> GazetteerPlaces { get; set; }
        // public DbSet<MissingPlanmanTable> MissingPlanmanTables { get; set; }
        
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MoHReport>()
                    .HasKey(e => e.ShortBNumber);
                // .Property(p => p.ShortBNumber)
                // .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
                modelBuilder.Entity<ReportPage>()
                    .HasKey(e => e.Id);
                // .Property(p => p.Id)
                // .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
                modelBuilder.Entity<ReportTable>()
                    .HasKey(e => e.Id);
                // .Property(p => p.Id)
                // .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
                modelBuilder.Entity<GazetteerPlace>()
                    .HasKey(p => p.SEQ);
                // .Property(p => p.SEQ)
                // .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

                
                modelBuilder.Entity<MoHReportPlaceMapping>(
                    e =>
                    {
                        e.ToTable("MoHReportPlaceMapping");
                        e.HasKey(x => new {x.ShortBNumber, x.PlaceMappingId});
                    });
                // modelBuilder.Entity<MoHReportPlaceMapping>()
                //     .HasKey(x => new { x.ShortBNumber, x.PlaceMappingId });  
                modelBuilder.Entity<MoHReportPlaceMapping>()
                    .HasOne(x => x.MoHReport)
                    .WithMany(x => x.MoHReportPlaceMappings)
                    .HasForeignKey(x => x.ShortBNumber);  
                modelBuilder.Entity<MoHReportPlaceMapping>()
                    .HasOne(x => x.PlaceMapping)
                    .WithMany(x => x.MoHReportPlaceMappings)
                    .HasForeignKey(x => x.PlaceMappingId);
                
                

                //
                // modelBuilder.Entity<MoHReport>()
                //     .HasMany(report => report.PlaceMappings)
                //     .WithMany(placeMapping => placeMapping.MoHReports)
                //     .UsingEntity(j => j.ToTable("MoHReportPlaceMapping"));
                // see https://stackoverflow.com/questions/42337911/ef-core-many-to-many-configuration-not-working-with-fluent-api
                
                // .Map(m =>
                // {
                //     m.ToTable("MoHReportPlaceMapping");
                //     m.MapLeftKey("ShortBNumber");
                //     m.MapRightKey("PlaceMappingId"); 
                // });
                
                        
        }
    }
}
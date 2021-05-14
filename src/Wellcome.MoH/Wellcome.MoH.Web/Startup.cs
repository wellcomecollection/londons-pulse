using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Wellcome.MoH.Api;
using Wellcome.MoH.Repository;
using Wellcome.MoH.Repository.SqlServer;

namespace Wellcome.MoH.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        private IConfiguration Configuration { get; }
        private IWebHostEnvironment Environment { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            var builder = services.AddControllersWithViews();
            if (Environment.IsDevelopment())
            {
                builder.AddRazorRuntimeCompilation();
            }

            services.AddHealthChecks().AddDbContextCheck<MoHContext>();
            
            services.AddDbContext<MoHContext>(opts =>
            {
                opts.UseSqlServer(Configuration.GetConnectionString("Moh"));
            });

            
            services.AddDefaultAWSOptions(Configuration.GetAWSOptions());
            services.AddAWSService<IAmazonS3>();
            services.AddScoped<IServiceApi, MoHService>();
        }

        public void Configure(IApplicationBuilder app)
        {
            if (Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapControllerRoute(
                    name: "about",
                    pattern: "moh/about-the-reports/{*detail}",
                    defaults: new {controller = "Home", action = "About"});
                endpoints.MapControllerRoute(
                    name: "browse-normalised",
                    pattern: "moh/browse-normalised/{normalisedPlace}",
                    defaults: new {controller = "Home", action = "BrowseNormalised"});
                endpoints.MapControllerRoute(
                    name: "timeline",
                    pattern: "moh/timeline/{action=Index}",
                    defaults: new {controller = "Timeline" });
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "moh/{action=Index}/{id?}/{page?}",
                    defaults: new {controller = "Home" });
                endpoints.MapHealthChecks("/management/healthcheck");
            });
        }
    }
}
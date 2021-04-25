using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Wellcome.MoH.Api;
using Wellcome.MoH.Repository;

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
            // TODO - use the straight-to-DB version
            services.AddSingleton<IServiceApi, JsonConsumer>();
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
            });
        }
    }
}
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Wellcome.MoH.Web.TagHelpers
{
    public class NavlinkTagHelper : TagHelper
    {
        public string Href { get; set; }
        
        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "a";
            var pagePath = ViewContext.HttpContext.Request.Path;
            if (Href == pagePath || Href != "/" && pagePath.StartsWithSegments(Href))
            {
                output.Attributes.Add("class", "current");
            }
            output.Attributes.Add("href", Href);
        }
        
        [ViewContext]
        public ViewContext ViewContext { get; set; }
    }
}
using System;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Primitives;

namespace Wellcome.MoH.Web.Models
{
    public static class Utils
    {
        public static string HtmlSummaryAsText(this string markup)
        {
            return TextOnlyWithSpaces(markup.Replace("\n", " "));
        }
        
        public static string TextOnlyWithSpaces(string markup)
        {
            if (markup != null)
            {
                string s = Regex.Replace(markup, "<(.|\\n)*?>", " ");
                return NormaliseSpaces(s);
            }
            return null;
        }
        
        public static string NormaliseSpaces(this string s)
        {
            if (!string.IsNullOrWhiteSpace(s))
            {
                while (s.IndexOf("  ", StringComparison.Ordinal) != -1)
                {
                    s = s.Replace("  ", " ");
                }
                s = s.Trim();
            }
            return s;
        }

        public static int GetIntValue(string s, int defaultValue)
        {
            return int.TryParse(s, out var result) ? result : default;
        }
    }
}
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

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

        public static string GetCaption(string s)
        {
            if (!string.IsNullOrWhiteSpace(s))
            {
                var s2 = TextOnlyWithSpaces(s);
                if (!string.IsNullOrWhiteSpace(s2))
                {
                    return s2.Replace("\n", " ");
                }
            }
            return String.Empty;
        }
        
   
        public static bool IsJustPageNumber(string plainText)
        {
            int test;
            if (Int32.TryParse(plainText, out test))
            {
                if (plainText.Trim().ToAlphanumeric().Trim() == test.ToString(CultureInfo.InvariantCulture))
                {
                    return true;
                }
            }
            return false;
        }
        
        
        /// <summary>
        /// Strips out any character that is not a letter or a digit.
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public static string ToAlphanumeric(this string s)
        {
            var sb = new StringBuilder();
            foreach (char c in s)
            {
                if(Char.IsLetterOrDigit(c))
                {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }
        
        /// <summary>
        /// remove leading and trailing characters that are not alphanumeric
        /// TODO - imporve this, not very efficient
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public static string TrimNonAlphaNumeric(this string s)
        {
            var sb = new StringBuilder();
            bool inAlphas = false;
            foreach (char c in s)
            {
                if (inAlphas || Char.IsLetterOrDigit(c))
                {
                    sb.Append(c);
                    inAlphas = true;
                }
            }
            // we now have a string with alphas on the end
            var sr = sb.ToString().Reverse();
            var sbr = new StringBuilder();
            foreach (char c in sr)
            {
                if (Char.IsLetterOrDigit(c))
                {
                    sbr.Append(c);
                }
            }
            var array = sbr.ToString().ToCharArray();
            Array.Reverse(array);
            return new String(array);
        }
        
        /// <summary>
        /// Takes a plain string (i.e., not HTML) and inserts break tags
        /// at every new line, so that the line breaks appear when the text is rendered in the browser.
        /// 
        /// This is for text that probably hasn't come from a markup field - which will already contain
        /// p or br tags. This is for plain text, e.g., from a string field or config file.
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public static string AddBreakTags(string s)
        {
            var lines = s.Split('\n');
            if (lines.Length == 0) return s;

            var sb = new StringBuilder();
            bool first = true;
            foreach (string line in lines)
            {
                if (!first)
                    sb.Append("<br/>");
                sb.AppendLine(line);
                first = false;
            }
            return sb.ToString();
        }
        
        /// <summary>
        /// Removes all tags from a string of HTML, leaving just the text content.
        /// 
        /// Text inside tag bodies is preserved.
        /// </summary>
        /// <param name="markup"></param>
        /// <returns></returns>
        public static string TextOnly(string markup)
        {
            if (markup != null)
            {
                return Regex.Replace(markup, "<(.|\\n)*?>", "");
            }
            return String.Empty;
        }

        public static string StripObjectIdAndLabel(string tableHtml)
        {
            return Regex.Replace(tableHtml, "<object-id>.*</object-id><label>.*</label>", "");
        }
        
        /// <summary>
        /// Clean up search term input for feeding into Morello search (and ultimately into SQL Server full text search).
        /// We strip out quotes but remember the fact that the supplied terms were quoted, so we can do an exact match search
        /// if necessary.
        /// </summary>
        /// <param name="terms"></param>
        /// <param name="wasEnclosedInQuotes"></param>
        /// <returns></returns>
        public static string NormaliseQuotes(string terms, out bool wasEnclosedInQuotes)
        {
            wasEnclosedInQuotes = false;
            terms = terms.Trim();
            if ((terms.StartsWith("\"") && terms.EndsWith("\"")) || (terms.StartsWith("'") && terms.EndsWith("'")))
            {
                wasEnclosedInQuotes = true;
                terms = terms.RemoveStart("'");
                terms = terms.Chomp("'");
            }
            terms = terms.Replace("\"", "");
            return terms;
        }
        
        /// <summary> 
        /// Removes separator from the start of str if it's there, otherwise leave it alone.
        /// 
        /// "something", "thing" => "something"
        /// "something", "some" => "thing"
        /// 
        /// </summary>
        /// <param name="str"></param>
        /// <param name="start"></param>
        /// <returns></returns>
        public static string RemoveStart(this string str, string start)
        {
            if (str == null) return null;
            if (str == String.Empty) return String.Empty;
            if(str.StartsWith(start) && str.Length > start.Length)
            {
                return str.Substring(start.Length);
            }
            return str;
        }
        
        /// <summary>
        /// Removes separator from the end of str if it's there, otherwise leave it alone.
        /// 
        /// "something/", "/" => "something"
        /// "something", "thing" => "some"
        /// "something", "some" => "something"
        /// 
        /// </summary>
        /// <param name="str"></param>
        /// <param name="separator"></param>
        /// <returns></returns>
        public static string Chomp(this string str, string separator)
        {
            if (str == null) return null;
            if (str == String.Empty) return String.Empty;
            if(str.EndsWith(separator))
            {
                return str.Substring(0, str.LastIndexOf(separator, StringComparison.Ordinal));
            }
            return str;
        }
        
        /// <summary>
        /// Splits a string into a sequence of strings using the supplied delimiter.
        /// Each string in the returned sequence is TRIMMED.
        /// </summary>
        /// <param name="source"></param>
        /// <param name="delimiter"></param>
        /// <returns></returns>
        public static IEnumerable<string> SplitByDelimiter(this string source, char delimiter)
        {
            if (!String.IsNullOrEmpty(source))
            {
                // this trims whitespace by default - implement another one if required
                var strings = source.Split(new[] {delimiter});
                return strings.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim());
            }
            return null;
        }
        
        /// <summary>
        /// 
        /// Splits a newline-separated string into a sequence of strings
        /// 
        /// "a
        /// b
        /// c" => { "a", "b", "c" }
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public static IEnumerable<string> SplitByLines(this string s)
        {
            if (s != null)
            {
                return s.SplitByDelimiter('\n');
            }
            return null;
        }
        
        /// <summary>
        /// Strips out any character that is not a letter or a digit or an underscore "_".
        /// This is useful when constructing a simple name for a content item you are creating 
        /// programmatically (e.g., in migration) as it ensures it will be permitted in a URL
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public static string ToAlphanumericOrUnderscore(this string s)
        {
            var sb = new StringBuilder();
            foreach (char c in s)
            {
                if (Char.IsLetterOrDigit(c) || c == '_')
                {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }
    }
}
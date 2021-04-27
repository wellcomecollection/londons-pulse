using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Wellcome.MoH.Api.Library
{
    public static class Csv
    {
        // http://stackoverflow.com/questions/4685705/good-csv-writer-for-c?lq=1
        public static string Escape(string s)
        {
            if (s.Contains(QUOTE))
                s = s.Replace(QUOTE, ESCAPED_QUOTE);

            if (s.IndexOfAny(CHARACTERS_THAT_MUST_BE_QUOTED) > -1)
                s = QUOTE + s + QUOTE;

            return s;
        }

        public static string Unescape(string s)
        {
            if (s.StartsWith(QUOTE) && s.EndsWith(QUOTE))
            {
                s = s.Substring(1, s.Length - 2);

                if (s.Contains(ESCAPED_QUOTE))
                    s = s.Replace(ESCAPED_QUOTE, QUOTE);
            }

            return s;
        }

        public static void AppendFormatLine(this StringBuilder sb, string fmt, params object[] args)
        {
            sb.AppendFormat(fmt, args);
            sb.AppendLine();
        }

        public static string GetFileName(this string s)
        {
            var parts = s.Split(new [] {'/', '\\'});
            return parts.LastOrDefault();
        }

        public static string GetFileExtension(this string s)
        {
            var fn = GetFileName(s);
            var idx = fn.LastIndexOf('.');
            if (idx != -1 && fn.Length > idx)
            {
                return fn.Substring(idx + 1);
            }
            return String.Empty;
        }

        public static string ToHumanReadableString(this TimeSpan t)
        {
            // from http://stackoverflow.com/a/36191436
            if (t.TotalSeconds <= 1)
            {
                return string.Format(@"{0:s\.ff} seconds", t);
            }
            if (t.TotalMinutes <= 1)
            {
                return string.Format(@"{0:%s} seconds", t);
            }
            if (t.TotalHours <= 1)
            {
                return string.Format(@"{0:%m} minutes", t);
            }
            if (t.TotalDays <= 1)
            {
                return string.Format(@"{0:%h} hours", t);
            }

            return string.Format(@"{0:%d} days", t);
        }

        public static string ReplaceFromDictionary(this string s, Dictionary<string, string> dict)
        {
            // https://stackoverflow.com/a/14033595
            return dict.Aggregate(s, (current, kvp) => current.Replace(kvp.Key, kvp.Value));
        }
        public static string ReplaceFromDictionary(this string s, Dictionary<string, string> dict, string template)
        {
            // https://stackoverflow.com/a/14033595
            return dict.Aggregate(s, (current, kvp) => current.Replace(kvp.Key, string.Format(template, kvp.Key, kvp.Value)));
        }



        private const string QUOTE = "\"";
        private const string ESCAPED_QUOTE = "\"\"";
        private static char[] CHARACTERS_THAT_MUST_BE_QUOTED = { ',', '"', '\n' };
    }
}
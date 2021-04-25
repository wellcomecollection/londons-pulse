using System;
using System.Globalization;
using System.Text;
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
        
        private static readonly Regex VariantsOf7DigitBNumber = new Regex(@".?b?([0-9]{7})(\w?)");
        
        public static string GetNormalisedBNumber(string bNumber, bool errorOnInvalidChecksum)
        {
            string normalisedBNumber = null;
            var m = VariantsOf7DigitBNumber.Match(bNumber);
            if (m.Success && m.Groups[1].Success)
            {
                string recordNumber = m.Groups[1].Value;
                char expectedCheckDigit = GetExpectedBNumberCheckDigit(recordNumber);
                normalisedBNumber = "b" + recordNumber + expectedCheckDigit;
                if (m.Groups[2].Success && !String.IsNullOrWhiteSpace(m.Groups[2].Value))
                {
                    char suppliedCheckDigit = m.Groups[2].Value[0];
                    // we could throw an exception if a checksum digit was supplied that DOES NOT MATCH
                    if (errorOnInvalidChecksum && suppliedCheckDigit != 'a' && suppliedCheckDigit != expectedCheckDigit)
                    {
                        throw new ArgumentException(
                            $"Supplied check digit '{suppliedCheckDigit}' does not match expected check digit '{expectedCheckDigit}'", 
                            nameof(bNumber));
                    }
                }
            }
            return normalisedBNumber;
        }

        private static char GetExpectedBNumberCheckDigit(string s)
        {
            if (s == null || s.Length != 7)
            {
                throw new ArgumentException("string must be 7 characters", nameof(s));
            }

            int total = 0;
            int multiplier = 2;
            
            for (int i = 6; i >= 0; i--)
            {
                int digit = int.Parse(s[i].ToString(CultureInfo.InvariantCulture));
                total += digit * multiplier;
                multiplier++;
            }

            int remainder = total % 11;
            if (remainder == 10)
            {
                return 'x';
            }

            return remainder.ToString(CultureInfo.InvariantCulture)[0];
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
    }
}
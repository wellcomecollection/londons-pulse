using System;
using System.Globalization;
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

    }
}
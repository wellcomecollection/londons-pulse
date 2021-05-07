using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Iveonik.Stemmers;
using PluralizeService.Core;
using Wellcome.MoH.Web.Models;

namespace Wellcome.MoH.Api.Library
{

    public static class SearchUtils
    {
        private static IStemmer _stemmer;

        public static string GetExtract(string hitText, string terms, int size, string beforeHighlight, string afterHighlight)
        {
            // TODO from params, and move to Digirati.util
            size = size/2;
            var positionScores = new Dictionary<int, int>();

            var stemmed = hitText
                .Replace('\r', ' ')
                .Replace('\n', ' ')
                .Replace('\t', ' ')
                .NormaliseSpaces()
                .SplitByDelimiter(' ')
                .Select(word => new ExtractWord
                {
                    Stemmed = StemAndClean(word),
                    Original = word
                })
                .ToList();

            var debugtext = String.Join(" ", stemmed.Select(w => w.Stemmed));
            var stemmedTerms = terms
                .NormaliseSpaces()
                .SplitByDelimiter(' ')
                .Select(StemAndClean)
                .Except(StopWords)
                .ToList();
            var totalWords = stemmed.Count;
            for (int wordIdx = 0; wordIdx < totalWords; wordIdx++)
            {
                int score = 0, pos;
                //var word = stemmed[wordIdx];
                // work backwards
                // how far away is pos from wordIdx? The nearer it is, the higher the score.
                for (pos = wordIdx; pos >= 0; pos--)
                {
                    if (stemmedTerms.Contains(stemmed[pos].Stemmed))
                    {
                        var dist = wordIdx - pos;
                        score += GetScorePart(dist, totalWords);
                    }
                }
                // work forwards
                for (pos = wordIdx + 1; pos < totalWords; pos++)
                {
                    if (stemmedTerms.Contains(stemmed[pos].Stemmed))
                    {
                        var dist = pos - wordIdx;
                        score += GetScorePart(dist, totalWords);
                    }
                }
                positionScores.Add(wordIdx, score);
            }

            var hottestWord = positionScores.OrderByDescending(kvp => kvp.Value).First();
            int len = 0, k = hottestWord.Key;
            var summary = new List<ExtractWord>();
            while (len < size && k >= 0)
            {
                summary.Insert(0, stemmed[k]);
                len += stemmed[k].Original.Length;
                k--;
            }
            len = 0;
            k = hottestWord.Key + 1;
            while (len < size && k < stemmed.Count)
            {
                summary.Add(stemmed[k]);
                len += stemmed[k].Original.Length;
                k++;
            }
            var sb = new StringBuilder();
            foreach (var word in summary)
            {
                if (stemmedTerms.Contains(word.Stemmed))
                {
                    sb.AppendFormat("{0}{1}{2} ", beforeHighlight, word.Original, afterHighlight);
                }
                else
                {
                    sb.AppendFormat("{0} ", word.Original);
                }
            }
            return sb.ToString();
        }

        private static int GetScorePart(int dist, int totalWords)
        {
            var scorePart = (dist == 0 ? totalWords : totalWords - (int) Math.Pow(dist, 1.6));
            return scorePart > 0 ? scorePart : 0;
        }

        public static string StemAndClean(string s)
        {
            // NB: The PluralizationService is not available in .NET Core.
            // https://docs.microsoft.com/en-us/dotnet/api/system.data.entity.design.pluralizationservices.pluralizationservice.isplural?view=netframework-4.8&viewFallbackFrom=netcore-3.1
            // It would be nice to use this:
            // https://github.com/Humanizr/Humanizer
            // but I'm going to use this for maximum similarity:
            // https://github.com/kanisimoff/PluralizeService.Core
            if (_stemmer == null) _stemmer = new EnglishStemmer();
            var stemmed = _stemmer.Stem(s.TrimNonAlphaNumeric());
            if (PluralizationProvider.IsPlural(stemmed))
                stemmed = PluralizationProvider.Singularize(stemmed);
            return stemmed;
        }

        public static readonly string[] StopWords = new[]
            {
                "a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost",
                "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst",
                "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are",
                "around", "as", "at", "back", "be", "became", "because", "become", "becomes", "becoming", "been",
                "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill",
                "both", "bottom", "but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry",
                "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either",
                "eleven", "else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone",
                "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five",
                "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give"
                , "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein",
                "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in",
                "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly",
                "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more",
                "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither",
                "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now"
                , "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others",
                "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps", "please", "put"
                , "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she",
                "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone",
                "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than",
                "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby",
                "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those",
                "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward",
                "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was",
                "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas"
                , "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who",
                "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you",
                "your", "yours", "yourself", "yourselves", "the"
            };
    }

    class ExtractWord
    {
        public override string ToString()
        {
            return String.Format("[{0} -> {1}]", Original, Stemmed);
        }
        public string Stemmed { get; set; }
        public string Original { get; set; }
    }
}
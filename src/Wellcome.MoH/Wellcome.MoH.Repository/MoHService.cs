using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Wellcome.MoH.Api;
using Wellcome.MoH.Api.Library;
using Wellcome.MoH.Repository.SqlServer;
using Wellcome.MoH.Repository.SqlServer.Core;
using Wellcome.MoH.Web.Models;

namespace Wellcome.MoH.Repository
{
    public class MoHService : IServiceApi
    {
        // private const string ThumbTemplate = "/thumbs/{0}/{1}/{2}.jpg";
        private static readonly string ThumbTemplate = "https://iiif.wellcomecollection.org/thumb/{0}";
        private static readonly List<Tuple<int, int>> DateRangePairs;

        private readonly ILogger<MoHService> logger;
        private readonly MoHContext mohContext;
        private readonly IAmazonS3 amazonS3;

        public MoHService(
            ILogger<MoHService> logger,
            MoHContext mohContext,
            IAmazonS3 amazonS3)
        {
            this.logger = logger;
            this.mohContext = mohContext;
            this.amazonS3 = amazonS3;
        }

        static MoHService()
        {
            DateRangePairs = new List<Tuple<int, int>>
                {
                    new(1848, 1859),
                    new(1860, 1869),
                    new(1870, 1879),
                    new(1880, 1889),
                    new(1890, 1899),
                    new(1900, 1909),
                    new(1910, 1919),
                    new(1920, 1929),
                    new(1930, 1939),
                    new(1940, 1949),
                    new(1950, 1959),
                    new(1960, 1972)
                };
        }

        public string[] GetNormalisedNames()
        {
            // TODO: check that EF actually executes the sensible query here
            var names = mohContext.MoHReports.Select(r => r.NormalisedPlace).Distinct().ToList();
            names.Sort();
            return names.Where(n => !string.IsNullOrWhiteSpace(n)).ToArray();
        }

        public string[] GetNormalisedMoHPlaceNames()
        {
            var names = mohContext.PlaceMappings.Select(pm => pm.NormalisedMoHPlace).Distinct().ToList();
            names.Sort();
            return names.Where(n => !string.IsNullOrWhiteSpace(n) && !n.StartsWith("(unset")).ToArray();
        }

        public string[] GetAllPlaceNames()
        {
            var names = mohContext.PlaceMappings.Select(pm => pm.MoHPlace).Distinct().ToList();
            names.Sort();
            return names.Where(n => !string.IsNullOrWhiteSpace(n)).ToArray();
        }

        public string[] AutoCompletePlace(string fragment)
        {
            throw new NotImplementedException();
        }

        public ReportsResult BrowseNormalised(string normalisedPlace, int startYear, int endYear, int page,
            int pageSize, Ordering ordering)
        {
            var reports = mohContext.MoHReports.Where(r =>
                r.NormalisedPlace == normalisedPlace &&
                r.Year >= startYear &&
                r.Year <= endYear &&
                r.PageCount > 0);
            var results = PagedBrowseReports(reports, page, pageSize, ordering);
            results.PreCanned = true;
            return results;
        }


        public ReportsResult BrowseAnyPlace(string anyPlace, int startYear, int endYear, int page, int pageSize, Ordering ordering)
        {
            var reports = mohContext.MoHReports.Where(r => 
                r.Year >= startYear &&
                r.Year <= endYear &&
                r.PageCount > 0);
            bool preCanned = false;
            if (!string.IsNullOrWhiteSpace(anyPlace))
            {
                reports = reports.Where(r => r.MoHReportPlaceMappings.Any(
                    pm => pm.PlaceMapping.NormalisedMoHPlace == anyPlace));
            }
            else if (IsKnownDateRange(startYear, endYear))
            {
                preCanned = true;
            }
            var results = PagedBrowseReports(reports, page, pageSize, ordering);
            results.PreCanned = preCanned;
            return results;
        }

        private ReportsResult PagedBrowseReports(IQueryable<MoHReport> reports, int page, int pageSize, Ordering ordering)
        {
            IQueryable<MoHReport> ordered;
            switch (ordering)
            {
                case Ordering.DisplayName:
                    ordered = reports.OrderBy(r => r.NormalisedMoHPlace);
                    break;
                default:
                    ordered = reports.OrderBy(r => r.Year);
                    break;
            }

            var freeze = ordered.ToList();
            int total = freeze.Count;
            var paged = freeze.Select(e => e).Skip((page - 1)*pageSize).Take(pageSize);
            // http://stackoverflow.com/questions/7767409/better-way-to-query-a-page-of-data-and-get-total-count-in-entity-framework-4-1
            //var thisPage = paged.GroupBy (p => new { Total = total }).First(); 
            var apiReports = paged.Select(GetBrowseReport);
            return new ReportsResult {PageOfReports = apiReports.ToArray(), TotalResults = total};
        }

        private string FormatThumbnail(string bNumber)
        {
            // London MOH reports tend to have a capital X check digit
            // bNumber = bNumber.Replace("x", "X");
            return String.Format(ThumbTemplate, bNumber);
        }

        private Report GetBrowseReport(MoHReport moHReport)
        {
            var bNumber = moHReport.ShortBNumber.ToBNumber();
            var report = new Report
                {
                    ShortBNumber = moHReport.ShortBNumber,
                    BNumber = bNumber,
                    NormalisedPlace = moHReport.NormalisedPlace,
                    DisplayPlace = moHReport.NormalisedMoHPlace,
                    Thumbnail = FormatThumbnail(bNumber), // bNumber),  0, moHReport.CoverImageId),
                    Title = moHReport.MarcTitle,
                    Year = moHReport.Year,
                    YearString = moHReport.YearString,
                    Author = moHReport.Author,
                    PageCount = moHReport.PageCount.GetValueOrDefault(),
                    TableCount = moHReport.TableCount.GetValueOrDefault(),
                    PublicationYear = moHReport.PublicationYear.GetValueOrDefault()
                };
            return report;
        }


        public Report GetReportWithAllTableSummaries(string bNumber)
        {
            var bnum = bNumber.ToShortBNumber();
            var dbRreport = mohContext.MoHReports.SingleOrDefault(r => r.ShortBNumber == bnum);
            if (dbRreport == null)
            {
                return null;
            }
            var report = GetBrowseReport(dbRreport);
            var dbTables = mohContext.ReportTables.Where(t => t.ShortBNumber == bnum);
            report.TableSummaries = dbTables.OrderBy(t => t.Id).Select(GetTableSummary).ToArray();
            return report;
        }

        private TableSummary GetTableSummary(ReportTable reportTable)
        {
            var ts = new TableSummary
                {
                    PageIndex = reportTable.ImageIndex,
                    OrderLabel = reportTable.OrderLabel,
                    Caption = reportTable.Caption,
                    HeaderSummary = GetHeaderSummary(reportTable.Html),
                    TableIndex = reportTable.TableIndex,
                    TableId = reportTable.Id
                };
            return ts;
        }

        private string GetHeaderSummary(string html)
        {
            try
            {
                var xml = XDocument.Parse(html);
                var thead = xml.Descendants("thead").FirstOrDefault();
                if (thead != null)
                {
                    using (var reader = thead.CreateReader())
                    {
                        reader.MoveToContent();
                        return reader.ReadOuterXml();
                    }
                }
            }
            catch
            {
                //Log.Error("Could not extract table summary", ex);
            }
            return String.Empty;
        }

        public Page GetPage(string bNumber, int imageIndex)
        {
            var bnum = bNumber.ToShortBNumber();
            var dbPage = mohContext.ReportPages.Single(p => p.ShortBNumber == bnum && p.ImageIndex == imageIndex);
            var page = GetBrowsePage(dbPage);
            var dbRreport = mohContext.MoHReports.Single(r => r.ShortBNumber == bnum);
            page.Report = GetBrowseReport(dbRreport);
            var dbTables = mohContext.ReportTables.Where(t => t.ShortBNumber == bnum && t.ImageIndex == imageIndex);
            page.Tables = dbTables.OrderBy(t => t.TableIndex).Select(GetBrowseTable).ToArray();
            return page;
        }

        private Table GetBrowseTable(ReportTable reportTable)
        {
            var table = new Table
                {
                    Id = reportTable.Id,
                    Caption = reportTable.Caption,
                    TableIndex = reportTable.TableIndex,
                    Html = reportTable.Html,
                    RawTextStart = reportTable.RawTextStart,
                    RawTextEnd = reportTable.RawTextEnd,
                    StartWordPosition = reportTable.StartWordPosition,
                    X = reportTable.X,
                    Y = reportTable.Y,
                    Width = reportTable.Width,
                    Height = reportTable.Height,
                    MatchMethod = reportTable.MatchMethod,
                    SourceFile = reportTable.SourceFile
                };
            return table;
        }

        public Page GetBrowsePage(ReportPage reportPage)
        {
            var bnum = reportPage.ShortBNumber.ToBNumber();
            var thumbnail = FormatThumbnail(bnum);
            var page = new Page
                {
                    Id = reportPage.Id,
                    Index = reportPage.ImageIndex,
                    OrderLabel = reportPage.OrderLabel,
                    Thumbnail = thumbnail,
                    PreviewImage = thumbnail, // this used to be a /confine IIPImage op but is not used on front end
                    RawText = reportPage.RawText
                };
            return page;
        }

        public string GetTableText(long tableId, string fileExt)
        {
            switch (fileExt.ToLowerInvariant())
            {
                case "html":
                    return mohContext.ReportTables.Single(t => t.Id == tableId).Html;
                case "xml":
                    return mohContext.ReportTables.Single(t => t.Id == tableId).Xml;
                case "csv":
                    return PipeToCsv(mohContext.ReportTables.Single(t => t.Id == tableId).Csv);
                default:
                    return mohContext.ReportTables.Single(t => t.Id == tableId).Csv;
            }
        }

        public static string PipeToCsv(string pipeDelimited)
        {
            if (string.IsNullOrWhiteSpace(pipeDelimited))
            {
                return String.Empty;
            }
            // v1 assume pipe is always a delimiter
            var sb = new StringBuilder();
            foreach (var line in pipeDelimited.SplitByLines())
            {
                sb.AppendLine(String.Join(",", line.Trim().SplitByDelimiter('|').Select(Csv.Escape)));
            }
            return sb.ToString();
        }
        
        public ReportsResult Search(string constrainedPlaceName, int startYear, int endYear, 
            string terms, int page, int pageSize, bool tablesOnly, bool groupIntoReports,
            bool useSpecialGroupingBehaviour, int visibleHitsPerReport, int expandoThreshold)
        {
            logger.LogInformation("Beginning MOH search for '{0}' [{1}-{2}], {3}, page {4} (x{5})",
                terms, startYear, endYear, tablesOnly ? "Tables" : "Tables and text", page, pageSize);
            bool useContainsTable;
            terms = Utils.NormaliseQuotes(terms, out useContainsTable);
            // now re-quote:
            if (useContainsTable)
            {
                terms = "\"" + terms + "\"";
            }

            var groupInDatabase = useSpecialGroupingBehaviour ? false : groupIntoReports;
            bool placeHasText = !string.IsNullOrWhiteSpace(constrainedPlaceName);
            var sqlString = BuildSearchSql(placeHasText, tablesOnly, groupInDatabase, useContainsTable);

            var hitCount = 400; // page* pageSize; // assume 1 based, yes?

            var termsParam = new SqlParameter("@Terms", SqlDbType.NVarChar, 250) { Value = terms };
            var startYearParam = new SqlParameter("@StartYear", SqlDbType.Int) { Value = startYear };
            var endYearParam = new SqlParameter("@EndYear", SqlDbType.Int) { Value = endYear };


            var sqlParams = new List<SqlParameter> {termsParam, startYearParam, endYearParam};
            if (!string.IsNullOrWhiteSpace(constrainedPlaceName))
            {
                var normalisedMoHPlaceParam = new SqlParameter("@NormalisedMoHPlace", SqlDbType.NVarChar, 250) { Value = constrainedPlaceName };
                sqlParams.Add(normalisedMoHPlaceParam);
            }
            if (!tablesOnly)
            {
                var pageRankThresholdParam = new SqlParameter("@PageRankThreshold", SqlDbType.Int) { Value = 10 };
                sqlParams.Add(pageRankThresholdParam);
            }
            var tableRankThresholdParam = new SqlParameter("@TableRankThreshold", SqlDbType.Int) { Value = 10 };
            sqlParams.Add(tableRankThresholdParam);
            var topParam = new SqlParameter("@TopHits", SqlDbType.Int) { Value = hitCount };
            sqlParams.Add(topParam);

            try
            {
                var rows = mohContext.Database
                    .MapRawSql<SqlSearchRow>(sqlString, sqlParams, dr => new SqlSearchRow(dr), 60)
                    //.Skip((page - 1)*pageSize)
                    //.Take(pageSize);
                    .ToList();
                logger.LogInformation("SQL Server returned {0} rows", rows.Count);
                var result = new ReportsResult
                {
                    TotalResults = rows.Count,
                    TotalReports = rows.Select(r => r.ShortB).Distinct().Count()
                };
                if (useSpecialGroupingBehaviour)
                {
                    // this means that only VISIBLE results count towards paging totals. 
                    // Results that the user has to expand don't count.
                    // This means that the results per page can exceed pageCount significantly.
                    int currentPage = 1;
                    int visibleHitsOnPage = 0;
                    int currentReportBNumber = -1;
                    int hitsForCurrentReport = 0;
                    var hitsForResultPage = new List<SqlSearchRow>();
                    foreach (var hit in rows.GroupBy(r => r.ShortB).SelectMany(g => g))
                    {
                        if (hit.ShortB != currentReportBNumber)
                        {
                            if (hitsForCurrentReport <= visibleHitsPerReport + expandoThreshold)
                            {
                                int numberOfHiddenHits = hitsForCurrentReport - visibleHitsPerReport;
                                if (numberOfHiddenHits > 0 && numberOfHiddenHits <= expandoThreshold)
                                {
                                    visibleHitsOnPage += numberOfHiddenHits;
                                    result.TotalVisibleResults += numberOfHiddenHits;
                                }
                            }
                            currentReportBNumber = hit.ShortB;
                            hitsForCurrentReport = 0;
                        }
                        if (visibleHitsOnPage >= pageSize && hitsForCurrentReport == 0)
                        {
                            currentPage++;
                            visibleHitsOnPage = 0;
                        }
                        if (currentPage > page)
                        {
                            // break; - no, we need to know how many pages there are
                        }

                        hitsForCurrentReport++;
                        if (hitsForCurrentReport <= visibleHitsPerReport)
                        {
                            visibleHitsOnPage++;
                            result.TotalVisibleResults++;
                        }

                        if (currentPage == page)
                        {
                            hitsForResultPage.Add(hit);
                        }
                    }
                    if (hitsForCurrentReport <= visibleHitsPerReport + expandoThreshold)
                    {
                        int numberOfHiddenHits = hitsForCurrentReport - visibleHitsPerReport;
                        if (numberOfHiddenHits > 0 && numberOfHiddenHits <= expandoThreshold)
                        {
                            result.TotalVisibleResults++;
                        }
                    }
                    result.PageOfReports = ConvertToReports(hitsForResultPage, terms);
                }
                else
                {
                    result.PageOfReports = ConvertToReports(rows.Skip((page - 1)*pageSize).Take(pageSize), terms);
                    result.TotalVisibleResults = result.TotalResults;
                }
                logger.LogInformation("Page of results converted to ReportsResult object");
                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Could not conduct free text search");    
                throw;
            }
        }

        private Report[] ConvertToReports(IEnumerable<SqlSearchRow> rows, string terms)
        {
            var reports = new List<Report>();
            Report current = null;
            var currentTableSummaries = new List<TableSummary>();
            var currentTextHits = new List<TextHit>();
            foreach (var sqlSearchRow in rows)
            {
                if (current == null || current.ShortBNumber != sqlSearchRow.ShortB)
                {
                    if (current != null)
                    {
                        // finish previous
                        current.TableSummaries = currentTableSummaries.ToArray();
                        current.TextHits = currentTextHits.ToArray();
                        reports.Add(current);
                    }
                    var bNumber = sqlSearchRow.ShortB.ToBNumber();
                    current = new Report
                        {
                            ShortBNumber = sqlSearchRow.ShortB,
                            BNumber = bNumber,
                            DisplayPlace = sqlSearchRow.NormalisedMoHPlace,
                            Thumbnail = FormatThumbnail(bNumber), // bNumber), 0, moHReport.CoverImageId),
                            Year = sqlSearchRow.Year
                        };
                    currentTableSummaries = new List<TableSummary>();
                    currentTextHits = new List<TextHit>();
                }
                Hit hit = null;
                if (sqlSearchRow.HitType == "Table")
                {
                    hit = new TableSummary
                        {
                            Caption = sqlSearchRow.HitText,
                            HeaderSummary = GetHeaderSummary(sqlSearchRow.Html)
                        };
                    currentTableSummaries.Add(hit as TableSummary);
                }
                else if (sqlSearchRow.HitType == "Page")
                {
                    const int size = 200;
                    const string beforeHighlight = "<mark>";
                    const string afterHighlight = "</mark>";
                    hit = new TextHit { Extract = SearchUtils.GetExtract(sqlSearchRow.HitText, terms, size, beforeHighlight, afterHighlight) };
                    currentTextHits.Add(hit as TextHit);
                }
                if (hit != null)
                {
                    hit.Rank = sqlSearchRow.RvRank;
                    hit.PageIndex = sqlSearchRow.ImageIndex;
                    hit.OrderLabel = sqlSearchRow.OrderLabel;
                }
            }
            // finish previous
            if (current != null)
            {
                current.TableSummaries = currentTableSummaries.ToArray();
                current.TextHits = currentTextHits.ToArray();
                reports.Add(current);
            }

            return reports.ToArray();
        }




        private static string BuildSearchSql(bool withPlace, bool tablesOnly, bool groupIntoReports, bool useContainsTable)
        {
            var sql = new StringBuilder("WITH UnionOfResults as (");
            sql.AppendLine();
            if (!tablesOnly)
            {
                const string pagePart = @"	
SELECT 'Page' as HitType, FT_TBL.ShortBNumber as ShortB, Marc110aPlace, NormalisedMoHPlace, [Year], 
	ImageIndex, OrderLabel, RawText as HitText, '' as Html, ImageId, 
	CoverImageId, KEY_TBL.RANK as RvRank
	FROM ReportPages AS FT_TBL 
	INNER JOIN
	   FREETEXTTABLE (reportpages, rawtext, @Terms) AS KEY_TBL
	   ON FT_TBL.Id = KEY_TBL.[KEY]
	INNER JOIN 
	   MoHReports ON MoHReports.ShortBNumber=FT_TBL.ShortBNumber
	WHERE 
		MoHReports.Year >= @StartYear AND MoHReports.Year <= @EndYear 
		-- (place) AND MoHReports.ShortBNumber IN (SELECT ShortBNumber FROM MoHReportPlaceMapping WHERE PlaceMappingId IN (SELECT Id FROM PlaceMappings WHERE NormalisedMoHPlace=@NormalisedMoHPlace))
		AND KEY_TBL.RANK > @PageRankThreshold
UNION
";
                sql.AppendLine(withPlace ? pagePart.Replace("-- (place) ", "") : pagePart);
            }

            const string tablePart = @"           

	SELECT 'Table' as HitType, FT_TBL.ShortBNumber as ShortB, Marc110aPlace, NormalisedMoHPlace, [Year], 
	ImageIndex, OrderLabel, Caption as HitText, Html, ImageId, 
	CoverImageId, KEY_TBL.RANK as RvRank
	FROM ReportTables AS FT_TBL
	INNER JOIN
	   FREETEXTTABLE (ReportTables, TableCaptionAndText, @Terms) AS KEY_TBL
	   ON FT_TBL.Id = KEY_TBL.[KEY]
	INNER JOIN 
	   MoHReports ON MoHReports.ShortBNumber=FT_TBL.ShortBNumber 
	WHERE 
		MoHReports.Year >= @StartYear AND MoHReports.Year <= @EndYear 
		-- (place) AND MoHReports.ShortBNumber IN (SELECT ShortBNumber FROM MoHReportPlaceMapping WHERE PlaceMappingId IN (SELECT Id FROM PlaceMappings WHERE NormalisedMoHPlace=@NormalisedMoHPlace))
		AND KEY_TBL.RANK > @TableRankThreshold
)";
            sql.AppendLine(withPlace ? tablePart.Replace("-- (place) ", "") : tablePart);

            if (!groupIntoReports)
            {
                const string pureRanked = @"
-- NOT GROUPED INTO REPORTS:
select TOP(@TopHits) * from UnionOfResults order by RvRank Desc
";
                sql.AppendLine(pureRanked);
            }
            else
            {
                const string groupedRank = @"
-- GROUPED INTO REPORTS:
-- see http://stackoverflow.com/questions/12923483/sql-server-group-by-guid-but-order-entire-query-by-most-recent-in-group?rq=1
select TOP(@TopHits) 
y.HitType, y.ShortB, y.Marc110aPlace, y.NormalisedMoHPlace, y.[Year], y.ImageIndex, y.OrderLabel, y.HitText, 
y.Html, y.ImageId, y.CoverImageId, y.RvRank
from 
 (select MAX(a.RvRank) as RvRank, a.ShortB
    from UnionOfResults a
    group by a.ShortB)x,
 (select HitType, ShortB, Marc110aPlace, NormalisedMoHPlace, [Year], ImageIndex, 
		OrderLabel, HitText, Html, ImageId, CoverImageId, RvRank, 
    ROW_NUMBER() over(partition by ShortB order by ShortB) as rn
    from UnionOfResults)y
    where x.ShortB=y.ShortB
    order by x.RvRank desc, y.RvRank desc
";
                sql.AppendLine(groupedRank);
            }
            var sqlString = sql.ToString();
            if (useContainsTable)
            {
                sqlString = sqlString.Replace("FREETEXTTABLE", "CONTAINSTABLE");
            }
            return sqlString;
        }

        public string GetZipFileName(string bNumber, string format)
        {
            int shortB = bNumber.ToShortBNumber();
            var report = mohContext.MoHReports.SingleOrDefault(r => r.ShortBNumber == shortB);
            return GetReportZipName(report, format) + ".zip";
        }

        public string GetZipFileName(string place, bool useNormalisedPlace, int startYear, int endYear, string format)
        {
            if (useNormalisedPlace)
            {
                return String.Format("{0}.All_Tables.{1}.zip", place.ToAlphanumericOrUnderscore(), format);
            }
            if (!string.IsNullOrWhiteSpace(place))
            {
                return String.Format("{0}-{1}.{2}.{3}.zip", startYear, endYear, place, format);
            }
            return String.Format("{0}-{1}.All_Tables.{2}.zip", startYear, endYear, format);
        }

        
        public void WriteZipFile(string bNumber, string format, Stream stream)
        {
            MoHReport report;
            int shortB = bNumber.ToShortBNumber();
            using (var ctx = new MoHContext())
            {
                report = ctx.MoHReports.SingleOrDefault(r => r.ShortBNumber == shortB);
            }
            if (report != null)
            {
                using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, false))
                {
                    AddReportToZip(report, format, false, zip);
                    //zip.Save(stream);
                }
            }
        }

        public void WriteZipFile(string place, bool useNormalisedPlace, int startYear, int endYear, string format, Stream stream)
        {
            //string name;
            List<MoHReport> fReports;

            IQueryable<MoHReport> reports;
            if (useNormalisedPlace)
            {
                reports = mohContext.MoHReports.Where(r => r.NormalisedPlace == place);
                //name = String.Format("{0}.All_Tables.{1}.zip", place.ToAlphanumericOrUnderscore(), format);
            }
            else if (!string.IsNullOrWhiteSpace(place))
            {
                reports = mohContext.MoHReports.Where(r => r.MoHReportPlaceMappings.Any(
                    pm => pm.PlaceMapping.NormalisedMoHPlace == place));
                //name = String.Format("{0}-{1}.{2}.{3}.zip", startYear, endYear, place, format);
            }
            else
            {
                reports = mohContext.MoHReports;
                //name = String.Format("{0}-{1}.All_Tables.{2}.zip", startYear, endYear, format);
            }
            fReports = reports.Where(r => r.Year >= startYear && r.Year <= endYear).ToList();
            
            const int maxAllowed = 100;
            if (fReports.Count > maxAllowed)
            {
                throw new NotSupportedException("Attempt to create a dynamic zip with " + fReports.Count 
                    + " reports, maximum allowed is " + maxAllowed + ".");
            }
            
            using (var zip = new ZipArchive(stream))
            {
                foreach (var report in fReports)
                {
                    if (!String.IsNullOrWhiteSpace(report.NormalisedMoHPlace))
                    {
                        AddReportToZip(report, format, true, zip);
                    }
                }
                // zip.Save(stream);
            }
            //return name;
        }

        private void AddReportToZip(MoHReport report, string format, bool createFolder, ZipArchive zip)
        {
            format = format.ToLowerInvariant();
            var entryFolder = (createFolder ? GetReportZipName(report, format) + "/" : "");
            using (var ctx = new MoHContext())
            {
                var tables = ctx.ReportTables.Where(t => t.ShortBNumber == report.ShortBNumber);
                foreach (var table in tables)
                {
                    var entryPath = String.Format("{0}{1}.{2}", entryFolder, table.Id, format);
                    var entry = zip.CreateEntry(entryPath);
                    string content;
                    switch (format)
                    {
                        case "html":
                            content = table.Html;
                            break;
                        case "xml":
                            content = table.Xml;
                            break;
                        case "csv":
                            content = PipeToCsv(table.Csv);
                            break;
                        default:
                            content = table.Csv;
                            break;
                    }
                    using var writer = new StreamWriter(entry.Open());
                    writer.Write(content);
                }
            }
            try
            {
                // now add the full text, created from the harvest
                // TODO - some duplication of Harvester2 Program here
                var fullTextFileName = GetReportZipName(report, "txt"); // what the Harvester Program saves the full text as
                var fullTextEntryPath = entryFolder + GetReportZipName(report, "fulltext.txt"); // what we want it called in the zip
                
                var getObjectRequest = new GetObjectRequest
                {
                    BucketName = "wellcomecollection-moh-text",
                    Key = fullTextFileName
                };
                try
                {
                    // get rid of the await... put back in later
                    var getResponse = amazonS3.GetObjectAsync(getObjectRequest).Result;
                    var textEntry = zip.CreateEntry(fullTextEntryPath);
                
                    using var writer = new StreamWriter(textEntry.Open());
                    writer.Write(getResponse.ResponseStream);
                }
                catch (AmazonS3Exception e)
                {
                    logger.LogWarning(e, "Could not copy S3 Stream for {S3ObjectRequest}; {StatusCode}",
                        getObjectRequest, e.StatusCode);
                }
            }
            catch
            {
                // unable to add full text - log
            }
        }

        private static string GetReportZipName(MoHReport report, string format)
        {
            // folder is called Normalised_Marc_placename.Year.bNumber.Format
            var name = String.Format("{0}.{1}.{2}.{3}",
                                       report.NormalisedMoHPlace.ToAlphanumericOrUnderscore(), report.Year,
                                       report.ShortBNumber.ToBNumber(), format);
            return name;
        }


        public bool IsKnownDateRange(int startYear, int endYear)
        {
            return DateRangePairs.Any(pair => startYear == pair.Item1 && endYear == pair.Item2);
        }
    }


    class SqlSearchRow
    {
        public SqlSearchRow(DbDataReader dr)
        {
            // Yes, use dapper, but only this mapper is needed.
            
            if (!dr.IsDBNull("HitType"))
            {
                HitType = dr.GetString("HitType");
            }

            if (!dr.IsDBNull("ShortB"))
            {
                ShortB = dr.GetInt32("ShortB");
            }
            
            if (!dr.IsDBNull("Marc110aPlace"))
            {
                Marc110aPlace = dr.GetString("Marc110aPlace");
            }
            
            if (!dr.IsDBNull("NormalisedMoHPlace"))
            {
                NormalisedMoHPlace = dr.GetString("NormalisedMoHPlace");
            }
            
            if (!dr.IsDBNull("Year"))
            {
                Year = dr.GetInt32("Year");
            }
            
            if (!dr.IsDBNull("ImageIndex"))
            {
                ImageIndex = dr.GetInt32("ImageIndex");
            }
            
            if (!dr.IsDBNull("OrderLabel"))
            {
                OrderLabel = dr.GetString("OrderLabel");
            }
            
            if (!dr.IsDBNull("HitText"))
            {
                HitText = dr.GetString("HitText");
            }
            
            if (!dr.IsDBNull("Html"))
            {
                Html = dr.GetString("Html");
            }
            
            if (!dr.IsDBNull("RvRank"))
            {
                RvRank = dr.GetInt32("RvRank");
            }
        }

        public string HitType { get; set; }
        public int ShortB { get; set; }
        public string Marc110aPlace { get; set; }
        public string NormalisedMoHPlace { get; set; }
        public int Year { get; set; }
        public int ImageIndex { get; set; }
        public string OrderLabel { get; set; }
        public string HitText { get; set; }
        public string Html { get; set; }
        //public string HeaderSummary { get; set; }
        public Guid? ImageId { get; set; }
        public Guid? CoverImageId { get; set; }
        public int RvRank { get; set; }
    }
}
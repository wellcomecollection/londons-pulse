DECLARE @Terms NVARCHAR(250)
DECLARE @StartYear INT
DECLARE @EndYear INT
DECLARE @PageRankThreshold INT
DECLARE @TableRankThreshold INT
DECLARE @TopHits INT
DECLARE @NormalisedMoHPlace NVARCHAR(250) -- "Any" place name needs to have been normalised to this before calling search

set @Terms='"unsatisfactory"';
set @StartYear=1848;
set @EndYear=1979;
set @PageRankThreshold=1;
set @TableRankThreshold=1;
set @TopHits=500;
set @NormalisedMoHPlace='Bethnal Green';

with UnionOfResults as
(
-- do not include this block to select just tables
	SELECT 'Page' as HitType, FT_TBL.ShortBNumber as ShortB, Marc110aPlace, NormalisedMoHPlace, [Year], 
	ImageIndex, OrderLabel, RawText as HitText, '' as HeaderSummary, ImageId, 
	CoverImageId, KEY_TBL.RANK as RvRank
	FROM ReportPages AS FT_TBL 
	INNER JOIN
	   CONTAINSTABLE (reportpages, rawtext, @Terms) AS KEY_TBL
	   ON FT_TBL.Id = KEY_TBL.[KEY]
	INNER JOIN 
	   MoHReports ON MoHReports.ShortBNumber=FT_TBL.ShortBNumber
	WHERE 
		MoHReports.Year >= @StartYear AND MoHReports.Year <= @EndYear 
		AND MoHReports.ShortBNumber IN (SELECT ShortBNumber FROM MoHReportPlaceMapping WHERE PlaceMappingId IN (SELECT Id FROM PlaceMappings WHERE NormalisedMoHPlace=@NormalisedMoHPlace))
		AND KEY_TBL.RANK > @PageRankThreshold
UNION
--- end do not include for tables
	SELECT 'Table' as HitType, FT_TBL.ShortBNumber as ShortB, Marc110aPlace, NormalisedMoHPlace, [Year], 
	ImageIndex, OrderLabel, Caption as HitText, HeaderSummary, ImageId, 
	CoverImageId, KEY_TBL.RANK as RvRank
	FROM ReportTables AS FT_TBL
	INNER JOIN
	   CONTAINSTABLE (ReportTables, TableCaptionAndText, @Terms) AS KEY_TBL
	   ON FT_TBL.Id = KEY_TBL.[KEY]
	INNER JOIN 
	   MoHReports ON MoHReports.ShortBNumber=FT_TBL.ShortBNumber 
	WHERE 
		MoHReports.Year >= @StartYear AND MoHReports.Year <= @EndYear 
		AND MoHReports.ShortBNumber IN (SELECT ShortBNumber FROM MoHReportPlaceMapping WHERE PlaceMappingId IN (SELECT Id FROM PlaceMappings WHERE NormalisedMoHPlace=@NormalisedMoHPlace))
		AND KEY_TBL.RANK > @TableRankThreshold
)
-- NOT GROUPED INTO REPORTS:
-- select TOP(@TopHits) * from UnionOfResults order by RvRank Desc

-- GROUPED INTO REPORTS:
-- see http://stackoverflow.com/questions/12923483/sql-server-group-by-guid-but-order-entire-query-by-most-recent-in-group?rq=1
select TOP(@TopHits) 
y.HitType, y.ShortB, y.Marc110aPlace, y.NormalisedMoHPlace, y.[Year], y.ImageIndex, y.OrderLabel, y.HitText, 
y.HeaderSummary, y.ImageId, y.CoverImageId, y.RvRank
from 
 (select MAX(a.RvRank) as RvRank, a.ShortB
    from UnionOfResults a
    group by a.ShortB)x,
 (select HitType, ShortB, Marc110aPlace, NormalisedMoHPlace, [Year], ImageIndex, 
		OrderLabel, HitText, HeaderSummary, ImageId, CoverImageId, RvRank, 
    ROW_NUMBER() over(partition by ShortB order by ShortB) as rn
    from UnionOfResults)y
    where x.ShortB=y.ShortB
    order by x.RvRank desc, y.RvRank desc



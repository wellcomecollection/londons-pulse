using System.IO;

namespace Wellcome.MoH.Api
{
   public interface IServiceApi
    {
        /// <summary>
        /// THE browse list of the Moh homepage, typically a list of moder London Boroughs. This is the most coarse-grained normalisation.
        /// </summary>
        string[] GetNormalisedNames();


        /// <summary>
        /// THE drop down/autocomplete list of placenames used to constrain a search. More fine-grained than boroughs.
        /// These are normalised versions of the MARC place names (and also some derived form Planman data).
        /// 
        /// The MoHReport.NormalisedMoHPlace property will be one of these, but a report may have others from other MARC fields
        /// </summary>
        string[] GetNormalisedMoHPlaceNames();

        /// <summary>
        /// aLl the placenames available, derived from MARC and Planman. these should not be shown to the user as they are too dirty, full of dupes etc
        /// </summary>
        /// <returns></returns>
        string[] GetAllPlaceNames();

        /// <summary>
        /// Used to autocomplete the "in" box on the homepage search
        /// </summary>
        /// <param name="fragment"></param>
        /// <returns></returns>
        string[] AutoCompletePlace(string fragment);

        /// <summary>
        /// Fetch sparsely populated reports for a normalised place between the years specified (inclusive)
        /// restrict to the normalised place name - the coarse grained version (borough)
        /// </summary>
        /// <param name="normalisedPlace"></param>
        /// <param name="startYear"></param>
        /// <param name="endYear"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="ordering"></param>
        /// <returns></returns>
        ReportsResult BrowseNormalised(string normalisedPlace, int startYear, int endYear, int page, int pageSize, Ordering ordering);

        /// <summary> 
        /// Fetch sparsely populated reports for any place between the years specified (inclusive)
        /// </summary>
        /// <param name="anyPlace"></param>
        /// <param name="startYear"></param>
        /// <param name="endYear"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="ordering"></param>
        /// <returns></returns>
        ReportsResult BrowseAnyPlace(string anyPlace, int startYear, int endYear, int page, int pageSize, Ordering ordering);

        /// <summary>
        /// FOr the report home page
        /// </summary>
        /// <param name="bNumber"></param>
        /// <returns></returns>
        Report GetReportWithAllTableSummaries(string bNumber);

        /// <summary>
        /// Ges the single page view, with tables
        /// </summary>
        /// <param name="bNumber"></param>
        /// <param name="imageIndex"></param>
        /// <returns></returns>
        Page GetPage(string bNumber, int imageIndex);


        /// <summary>
        /// Fetch Hit-populated reports for this page
        /// </summary>
        /// <param name="constrainedPlaceName"></param>
        /// <param name="startYear"></param>
        /// <param name="endYear"></param>
        /// <param name="terms"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="tablesOnly"></param>
        /// <param name="groupIntoReports"></param>
        /// <returns></returns>
        ReportsResult Search(string constrainedPlaceName, int startYear, int endYear,
            string terms, int page, int pageSize, bool tablesOnly, bool groupIntoReports,
            bool useSpecialGroupingBehaviour, int visibleHitsPerReport, int expandoThreshold);

        /// <summary>
        /// Get a text version of the table for download
        /// </summary>
        /// <param name="tableId"></param>
        /// <param name="fileExt"></param>
        /// <returns></returns>
        string GetTableText(long tableId, string fileExt);

        string GetZipFileName(string bNumber, string format);
        string GetZipFileName(string place, bool useNormalisedPlace, int startYear, int endYear, string format);
        void WriteZipFile(string bNumber, string format, Stream stream);
        void WriteZipFile(string place, bool useNormalisedPlace, int startYear, int endYear, string format, Stream stream);

        bool IsKnownDateRange(int startYear, int endYear);
    }

}
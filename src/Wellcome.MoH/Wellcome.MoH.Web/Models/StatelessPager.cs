using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Wellcome.MoH.Web.Models
{

    public class StatelessPager
    {
        private const int NumberOfPagesToShow = 10;
        private const string Ellipsis = "...";
        
        private static string GetQueryString(string currentQueryString, string pageParamName, int page)
        {
            string newQueryString; 
            if (!currentQueryString.StartsWith("?"))
            {
                currentQueryString = "?" + currentQueryString;
            }
            int paramPos = currentQueryString.IndexOf(pageParamName + "=", StringComparison.Ordinal);
            if (paramPos == -1)
            {
                newQueryString = AppendQueryStringParam(currentQueryString, pageParamName, page);
            }
            else
            {

                string firstPart = currentQueryString.Substring(0, paramPos - 1);
                string lastPart = "";
                int nextParamPos = currentQueryString.IndexOf("&", paramPos + 1, StringComparison.Ordinal);
                if (nextParamPos != -1)
                {
                    lastPart = currentQueryString.Substring(nextParamPos);
                }
                newQueryString = AppendQueryStringParam(firstPart, pageParamName, page) + lastPart;
            }
            if (newQueryString[0] != '?')
            {
                // happens when the paging param is the only part of the query string
                newQueryString = "?" + newQueryString;
            }
            return newQueryString;
        }

        private static string AppendQueryStringParam(string currentQueryString, string pageParamName, int page)
        {
            if (currentQueryString.Length > 1)
            {
                return currentQueryString + "&" + pageParamName + "=" + page;
            }
            return currentQueryString + pageParamName + "=" + page;
        }

        public string GetHtml(int currentPage, int itemsPerPage, int totalItems, string pageParamName, string currentQueryString, bool includeHeading)
        {
            return GetHtml("", currentPage, itemsPerPage, totalItems, pageParamName, currentQueryString, includeHeading);
        }

        public string GetHtml(string currentPagePath, int currentPage, int itemsPerPage, int totalItems, string pageParamName, string currentQueryString, bool includeHeading)
        {
            if (itemsPerPage <= 0) throw new ArgumentException("itemsPerPage must be a positive number");
            int totalPages = (totalItems / itemsPerPage) + ((totalItems % itemsPerPage) == 0 ? 0 : 1);
            int firstItem = ((currentPage - 1) * itemsPerPage) + 1;
            if (totalItems == 0) firstItem = 0;

            var sb = new StringBuilder();
            BuildPagedMarkup(currentPagePath, itemsPerPage, totalItems, currentPage, sb, firstItem, currentQueryString, pageParamName, totalPages, includeHeading);
            return sb.ToString();
        }

        private int GetLastItem(int firstItem, int itemsPerPage, int totalItems)
        {

            int lastItem = firstItem + (itemsPerPage - 1);
            if (lastItem > totalItems)
            {
                lastItem = totalItems;
            }
            return lastItem;
        }

        private void BuildPagedMarkup(string currentPagePath, int itemsPerPage, int totalItems, int currentPage, StringBuilder sb, int firstItem, string currentQueryString, string pageParamName, int totalPages, bool includeHeading)
        {
            int lastItem = GetLastItem(firstItem, itemsPerPage, totalItems);
            if(includeHeading)
            {
                sb.AppendFormat("<h4 class=\"separator\">Results {0}-{1} of {2}</h4>", firstItem, lastItem, totalItems);
                sb.AppendLine();
            }
            sb.AppendLine("<ul class=\"pagination site-search-pagination\">");

            if (currentPage > 1)
            {
                string qs = GetQueryString(currentQueryString, pageParamName, currentPage - 1);
                sb.AppendFormat("<li class=\"prev\"><a href=\"{0}\">Back<!-- previous {1} --></a></li>", currentPagePath + qs, itemsPerPage);
                sb.AppendLine();
            }
            else
            {
                sb.AppendLine("<li class=\"prev\">Back</li>");
            }
            if (currentPage < totalPages)
            {
                string qs = GetQueryString(currentQueryString, pageParamName, currentPage + 1);
                sb.AppendFormat("<li class=\"next\"><a href=\"{0}\">Next<!-- next {1} --></a></li>", currentPagePath + qs, itemsPerPage);
                sb.AppendLine();
            }
            else
            {
                sb.AppendLine("<li class=\"next\">Next</li>");
            }

            sb.AppendLine("<ol>");
            foreach (string pageString in GetPagesToDisplay(currentPage, totalPages))
            {
                if (pageString == currentPage.ToString(CultureInfo.InvariantCulture))
                {
                    sb.AppendFormat("<li class=\"current\">{0}</li>", pageString);
                    sb.AppendLine();
                }
                else if (pageString == Ellipsis)
                {
                    sb.AppendFormat("<li class=\"ellipsis\">{0}</li>", pageString);
                    sb.AppendLine();
                }
                else
                {
                    string qs = GetQueryString(currentQueryString, pageParamName, int.Parse(pageString));
                    sb.AppendFormat("<li><a href=\"{0}\">{1}</a></li>", currentPagePath + qs, pageString);
                    sb.AppendLine();
                }
            }
            sb.AppendLine("</ol>");
            sb.AppendLine("</ul>");

        }

        private IEnumerable<string> GetPagesToDisplay(int page, int pages)
        {
            var pageList = new List<String>();

            // if we will show all pages....
            if (pages < NumberOfPagesToShow)
            {
                for (int i = 1; i <= pages; i++)
                {
                    pageList.Add(i.ToString(CultureInfo.InvariantCulture));
                }
            }
            // we are only going to show SOME pages...
            else
            {
                int pagesToAdd = NumberOfPagesToShow - 2; // doesn't include first or last page

                // state
                int lowPointer = page;
                int highPointer = page;
                bool lowEndReached = false;
                bool highEndReached = false;

                // add current page if it isn't the first or last page
                if (page != 1 && page != pages)
                {
                    pageList.Add(page.ToString(CultureInfo.InvariantCulture));
                    pagesToAdd--;
                }

                // main loop
                while (pagesToAdd > 0 && !(highEndReached && lowEndReached))
                {
                    if (!lowEndReached)
                    {
                        lowPointer--;
                        if (lowPointer <= 1)
                        {
                            // the first page will be added later
                            lowEndReached = true;
                        }
                        else
                        {
                            // insert a page at the beginning of the list
                            pageList.Insert(0, lowPointer.ToString(CultureInfo.InvariantCulture));
                            pagesToAdd--;
                        }

                    }
                    if (pagesToAdd != 0 && !highEndReached)
                    {
                        highPointer++;
                        if (highPointer >= pages)
                        {
                            // the last page will be added later
                            highEndReached = true;
                        }
                        else
                        {
                            // insert a page at the end of the list
                            pageList.Add(highPointer.ToString(CultureInfo.InvariantCulture));
                            pagesToAdd--;
                        }
                    }
                }

                // if we haven't added pages back to page one then insert "..."
                if (!lowEndReached && --lowPointer != 1)
                {
                    pageList.Insert(0, Ellipsis);
                }
                // add the first page
                pageList.Insert(0, "1");

                // if we haven't added pages up to the last page then insert "..."
                if (!highEndReached && ++highPointer != pages)
                {
                    pageList.Add(Ellipsis);
                }
                // add the last page
                pageList.Add(pages.ToString(CultureInfo.InvariantCulture));
            }
            return pageList;
        }

    }
}
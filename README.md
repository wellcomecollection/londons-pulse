# London's Pulse

_Medical Officer of Health reports 1848-1972_

## Introduction

This is a standalone version of London's Pulse, which used to be part of the wellcomelibrary.org site. That site was content-managed (using Alterian CM7) and was based on ASP.NET Web Forms.
The new version doesn't use a CMS (see _Editing content_ below) and is built on ASP.NET Core (.NET Core v5).

MoH always used a custom database in addition to any CMS content; this is now an RDS instance of SQL Server 2019 on AWS, rather than SQL Server 2008 inside Wellcome's network.

The previous app consumed a JSON API for MOH (part of the former DDS), which in turn talked to the database. This has been simplified somewhat: the public facing web application, `Wellcome.MoH.Web`, now talks directly to SQL Server. The JSON API is still present, for external use of MOH data, but it is now delivered by the same web app. There is now only one deployable service, which is pushed to Fargate from a Jenkins build.

The JSON API has also been "moved" - it used to be at paths under wellcomelibrary.org/service/moh/, this has been changed to paths under wellcomelibrary.org/moh/service, to keep the API contained within the same path as the MOH functionality.

## Paths handled

This application should receive all requests for `wellcomelibrary.org/xxx/`, where `xxx` is any of:

* `moh` - the web application and service API
* `spas` - single page web applications - in this case, the Universal Viewer. This keeps the same wellcomelibrary.org address as before, which means any embdedded UV instances will keep running.
* `assets` - page furniture used by the wellcomelibrary.org site (CSS, fonts, icons and images)
* `plugins` - mainly the timeline - also embeddable, therfore also preserving its wellcomelibrary.org path
* `scripts` - JavaScript used by the wellcomelibrary.org site
* `timelines` - The timeline JSON data

All other requests for wellcomelibrary.org paths are handled elsewhere; redirected to either wellcomecollection.org or iiif.wellcomecollection.org.

## Editing content

Timeline data is now in standalone JSON files, and can be edited here:

https://github.com/wellcomecollection/londons-pulse/blob/main/src/Wellcome.MoH/Wellcome.MoH.Web/wwwroot/timelines/moh.json

The web pages are standard ASP.NET MVC. All public facing templates except the timeline use this template:

https://github.com/wellcomecollection/londons-pulse/blob/main/src/Wellcome.MoH/Wellcome.MoH.Web/Views/Shared/_Layout.cshtml

This provides the page header and footer.

Individual pages on the site have their own MVC _views_, including the more static-like editorial pages.

https://github.com/wellcomecollection/londons-pulse/tree/main/src/Wellcome.MoH/Wellcome.MoH.Web/Views/Home

So if you need to edit text or change a link, the straightforward HTML in the above `.cshtml` files shoul dbe all you need to edit.

## The JSON API

The following API is public, but not _publicised_. It was built to drive the MOH site and predates IIIF. (A future phase of MOH should use annotations on IIIF resources to provide the data resources).

Firstly, some lists of the place names used:

http://wellcomelibrary.org/moh/service/normalisednames - used to group reports into modern place names

http://wellcomelibrary.org/moh/service/allplacenames - all the place names used in catalogue data for the reports

http://wellcomelibrary.org/moh/service/NormalisedMoHPlaceNames - an attempt to normalise the previous list



All 5823 of the reports (summary form)

http://wellcomelibrary.org/moh/service/browseanyplace?pageSize=6000



A single report:

http://wellcomelibrary.org/moh/service/report/b18250294



The full text of a report, and normalised

(superseded by iiif.wellcomecollection.org text services)


A page of a report:

http://wellcomelibrary.org/moh/service/page/b18250294/10


A page with a table:

http://wellcomelibrary.org/moh/service/page/b18250294/21

…and what this looks like on the site: http://wellcomelibrary.org/moh/report/b18250294/21

The full text includes the table content, but the /page/ JSON splits out the table XHTML from the raw text – although not all the time. There was a lot of bad data in this project and it wasn’t always possible to exclude table content from the page raw text.


## Building

```bash
# build
docker build -t moh:local .

# run
docker run --rm -it -p 5080:80 --name moh moh:local
```


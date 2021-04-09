"""
A tool for extracting the timeline assets from Alterian.
"""
import requests
import json
import os
import mimetypes
from time import sleep

assets = {}
filenames = set()


def fetch_image(host, path, asset_dir):
    if not path:
        print("No path supplied, skipping")
        return path
    downloaded = assets.get(path, None)
    print(f"checking {path}")
    if downloaded is None:
        r = requests.get(f"{host}{path}")
        filename = path.split('/')[-1]
        (name, ext) = os.path.splitext(filename)
        if ext:
            print(f"found a file extension of {ext}")
        else:
            ext = mimetypes.guess_extension(r.headers["content-type"], strict=False)[1:]
            print(f"GUESSED a file extension of {ext}")
            filename = f"{filename}.{ext}"
        while filename in filenames:
            print("A file with the same name, at a different path")
            filename = f"-{filename}"  # this is a dumb impl but it's OK for this
        filenames.add(filename)
        downloaded = os.path.join(asset_dir, filename)
        print(f"downloading to {downloaded}")
        with open(downloaded, 'wb') as f:
            f.write(r.content)
        if downloaded.startswith(".."):
            downloaded = downloaded[2:]
        assets[path] = downloaded
    print(f"New path is {downloaded}")
    sleep(0.5)
    return downloaded


def make_timeline(host, old_timeline, new_timeline, asset_dir):
    timeline = requests.get(f"{host}{old_timeline}").json()
    timeline["FeatureImagePath"] = fetch_image(host, timeline["FeatureImagePath"], asset_dir)
    timeline["Body"] = timeline["Body"].replace("http://wellcomelibrary.org/moh/", "/")
    for tl_event in timeline["Events"]:
        tl_event["ThumbnailPath"] = fetch_image(host, tl_event["ThumbnailPath"], asset_dir)
        tl_event["FeatureImagePath"] = fetch_image(host, tl_event["FeatureImagePath"], asset_dir)
        tl_event["PromoImagePath"] = fetch_image(host, tl_event["PromoImagePath"], asset_dir)
        tl_event["Body"] = tl_event["Body"].replace("http://wellcomelibrary.org/moh/", "/")
        tl_event["LinkTarget"] = tl_event["LinkTarget"].replace("http://wellcomelibrary.org/moh/", "/")
    with open(new_timeline, 'w') as json_file:
        json.dump(timeline, json_file, indent=4)


if __name__ == "__main__":
    make_timeline("https://wellcomelibrary.org",
                  "/content/timelines/medical-officer-of-health-reports-timeline/",
                  "moh.json",
                  "../assets/timelines/moh")

    # Might as well pull this one out for posterity, too
    make_timeline("https://wellcomelibrary.org",
                  "/content/timelines/history-of-genetics-timeline/",
                  "fomg.json",
                  "../assets/timelines/fomg")
    
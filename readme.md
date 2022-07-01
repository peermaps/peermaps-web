# peermaps-web

> Map web application for peermaps

[![Node.js CI](https://github.com/peermaps/peermaps-web/actions/workflows/node.js.yml/badge.svg)](https://github.com/peermaps/peermaps-web/actions/workflows/node.js.yml)

![image](image.png)

## usage

Get the code, install and run:

```
$ git clone https://github.com/peermaps/peermaps-web.git
$ cd peermaps-web
$ npm install
$ npm start
```

Open the browser at `http://localhost:9966`.

## build

Running `npm run build` will result in a `public/` folder with static content that you can serve with a web server of your choice.

## settings

### via `config.json`

Settings can be configured by providing a `config.json` file with the following default values taken from `config.default.json`:

```json
{
  "bbox": [7.56,47.55,7.58,47.56],
  "style": {
    "url": "style.png"
  },
  "settings": {
    "storage": {
      "storages": [
        {
          "url": "https://peermaps.linkping.org/data",
          "description": "Peermaps data hosted by linkping.org",
          "zoom": [1, 21],
          "active": true
        },
        {
          "url": "https://ipfs.io/ipfs/QmVCYUK51Miz4jEjJxCq3bA6dfq5FXD6s2EYp6LjHQhGmh",
          "description": "Dataset on ipfs",
          "zoom": [1, 21],
          "active": false
        },
        {
          "url": "http://localhost:8000",
          "description": "Data from local machine",
          "zoom": [1, 21],
          "active": false
        }
      ]
    }
  }
}
```

If you want to run your own version of `peermaps-web` with a different configuration, you can copy `config.default.json` to `config.json` before running `npm run build` or `npm start`.

### via url search parameters

The following settings can be set via url search parameters:

* `data` (string) url to data source, defaults to `https://peermaps.linkping.org/data` (taken from the first active url in `settings.storages` matching the current zoom level)
* `bbox` (comma separated string `'minx,miny,maxx,maxy'`) view bounding box, defaults to `'7.56,47.55,7.58,47.56'` (taken from `settings.bbox`)
* `style` (string) url to shader style png, defaults to `style.png` (taken from `settings.style.url`)

**Example** `http://localhost:9966/#data=http://localhost:8000` would set the `data` source to `http://localhost:8000`.

## webxdc

**NOTE** This is very much a work in progress and mostly for trying things out and getting to some form of proof of concept. Main questions we want to ask right now are:

* can we run `peermaps-web` as a `.xdc` app at all?
* how big is the resulting `.xdc` file?
* how do we get map data? bundle it? how will that affect the application size?
* alternatives to bundling data?

The short answer, is that we have managed to build a `.xdc` file and launch it inside Delta Chat on Android. Some takeaways are:

* the application size without map data is about `280k`, so when it comes to code logic we have a quite a bit more we can use up, this is also due to the use of `tinyify`
* the application size goes up to over a megabyte when the map data is bundled, so this is not a good long term solution, or maybe incentive to try and minimize the map data as much as possible
* there are issues with webgl extensions (webgl in itself seems fine), different webviews have different support for this, you might need to manually disable some of them in `app.js`

You can bundle a webxdc app yourself with the following basic steps:

* first open peermaps in the browser, optionally modify the `bbox` url parameter for your target location
* type `console.log(window.serializeMapCache())` in the browser console and you'll get the cached map data as a string
* copy paste this string into the `storage/web-cache.js` file
* run `npm run build:webxdc`
* take the resulting `peermaps.xdc` and attach it to a message in `DeltaChat`


## license

bsd

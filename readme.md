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

Configuration can be provided in a `config.json` file. There's a `config.default.json` file with default values. The following properties can be configured:

* `bbox` (array of floats): the starting viewbox for the map
* `style` (object)
  * `style.url` (string) file name for styling
* `fonts` (object)
  * `fonts.endpoints` (array of objects)
    * `fonts.endpoints[].url` (string) data source url
    * `fonts.endpoints[].description` (string) font description
    * `fonts.endpoints[].active` (boolean) true if the data source is active, otherwise false
* `swarmOpts` (object) configuration for `hyperswarm-web`
  * `swarmOpts.bootstrap` (array of strings)
    * `swarmOpts.bootstrap[]` (string) url to websocket server (e.g. `ws://` or `wss://` url)
* `settings` (object)
  * `settings.storage` (object) configuration for the storage tab in the settings dialog
    * `settings.storage.endpoints` (array of objects)
      * `settings.storage.endpoints[].url` (string) data source url
      * `settings.storage.endpoints[].description` (string) data source description
      * `settings.storage.endpoints[].zoom` (array of integers) zoom range for this data source
      * `settings.storage.endpoints[].active` (boolean) true if data source is active, otherwise false
  * `settings.ui` (object)
    * `settings.ui.locale` (string) default locale
  * `settings.search` (object)
    * `settings.search.retryLimit` (number) how many times to retry fetching search results, default is `-1`, which is retry indefinitely
    * `settings.search.endpoints` (array of objects)
      * `settings.search.endpoints[].url` (string) data source url
      * `settings.search.endpoints[].description` (string) data source description
      * `settings.search.endpoints[].type` (string) type of data source, currently only supporting `'sparse-geonames'`
      * `settings.search.endpoints[].active` (boolean) true if data source is active, otherwise false

If you want to run your own version of `peermaps-web` with a different configuration, you can copy `config.default.json` to `config.json` before running `npm run build` or `npm start`.

### via url search parameters

The following settings can be set via url search parameters:

* `data` (string) url to data source, defaults to `https://peermaps.linkping.org/data` (taken from the first active url in `config.settings.storage.endpoints` matching the current zoom level)
* `bbox` (comma separated string `'minx,miny,maxx,maxy'`) view bounding box, defaults to `'7.56,47.55,7.58,47.56'` (taken from `config.bbox`)
* `lonlat` (comma separated string `'lon,lat'`) map center position, temporary url parameter that will generate a suitable value for `bbox`
* `style` (string) url to shader style png, defaults to `style.png` (taken from `config.style.url`)

**Example** `http://localhost:9966/#data=http://localhost:8000` would set the `data` source to `http://localhost:8000`.

## localization

To add a new language you need to do the following:

* add the locale to the `locales` array in `lib/i18n.js`
* add translations to the corresponding locale object

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

* `npm install`
* `npm run build:webxdc`
* attach the resulting `peermaps.xdc` to a chat

**NOTE** currently this only works on a modified version of `deltachat-desktop`, where `ipfs cat` calls are made to the local ipfs daemon and funneled back when a `fetch()` call is made to `ipfs://${CIDv1}` urls. This is done in a streaming fashion.

To get this modified version you can do e.g.:

```sh
cd $(mktemp -d) && git clone https://github.com/deltachat/deltachat-desktop.git -b ipfs-experimental && cd deltachat-desktop && npm i && npm run dev
```

How do we take it further from here? Some questions:

* can we get rid of the webgl extensions altogether? at least the most problematic ones? `->` this would make it easier to run the app on different systems and webviews
* there's also the webxdc api that we haven't touched on yet to interact between different instances for a different user experience, maybe sharing POIs and whatnot

## license

bsd

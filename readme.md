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

Configuration can be provided in a `config.json` file with the following default values taken from `config.default.json`:

```json
{
  "bbox": [7.56,47.55,7.58,47.56],
  "style": {
    "url": "style.png"
  },
  "fonts": {
    "endpoints": [
      {
        "url": "https://ipfs.io/ipfs/QmNQCPGV3XZrtNdQyMbZhSJcGisg4xCFyxeHs1tacrdETm/DejaVuSans.qbzf",
        "description": "DejaVuSans on ipfs",
        "active": true
      },
      {
        "url": "hyper://126065f6b93924f976034b84ce74d9d570a44903ce9d110069a7aa65ddccd507/DejaVuSans.qbzf",
        "description": "DejaVuSans on hyperdrive",
        "active": false
      }
    ]
  },
  "swarmOpts": {
    "bootstrap": [
      "wss://hyperswarm.linkping.org",
      "wss://swarm.cblgh.org"
    ]
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
          "url": "hyper://3dd1656d6408a718fae1117b5283fb18cb1f9139b892ce0f8cacbb6737ec1d67",
          "description": "Peermaps data via hyperswarm-web",
          "zoom": [15, 21],
          "active": false
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
    "search": {
      "endpoints": [
        {
          "url": "https://ipfs.io/ipfs/QmcWEeF9UGuo1VUw8N97uEH5rjcXvoay2fJusDvajHfmNN",
          "description": "cities500 ipfs",
          "type": "sparse-geonames",
          "active": true
        },
        {
          "url": "hyper://c1fed4a7be3d36e437fec0fba04d40fee7565ccf756c4801ffcea2f0ae1eecc9",
          "description": "cities500 hyperdrive",
          "type": "sparse-geonames",
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

* `data` (string) url to data source, defaults to `https://peermaps.linkping.org/data` (taken from the first active url in `config.settings.storage.storages` matching the current zoom level)
* `bbox` (comma separated string `'minx,miny,maxx,maxy'`) view bounding box, defaults to `'7.56,47.55,7.58,47.56'` (taken from `config.bbox`)
* `lonlat` (comma separated string `'lon,lat'`) map center position, temporary url parameter that will generate a suitable value for `bbox`
* `style` (string) url to shader style png, defaults to `style.png` (taken from `config.style.url`)

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

* `npm install`
* `npm run build:webxdc`
* attach the resulting `peermaps.xdc` to a chat

**NOTE** currently this only works on a modified version of `deltachat-desktop`, where `ipfs cat` calls are made to the local ipfs daemon and funneled back when a `fetch()` call is made to `ipfs://${CIDv1}` urls. This is done in a streaming fashion.

To get this modified version you can do e.g.:

```sh
cd $(mktemp -d) && git clone https://github.com/ralphtheninja/deltachat-desktop.git -b ipfs-experimental && cd deltachat-desktop && npm i && npm run dev
```

How do we take it further from here? Some questions:

* can we get rid of the webgl extensions altogether? at least the most problematic ones? `->` this would make it easier to run the app on different systems and webviews
* there's also the webxdc api that we haven't touched on yet to interact between different instances for a different user experience, maybe sharing POIs and whatnot

## license

bsd

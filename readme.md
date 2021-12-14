# peermaps-web

> Map web application for peermaps

![image](image.png)

# usage

Get the code, install and run:

```
$ git clone https://github.com/peermaps/peermaps-web.git
$ cd peermaps-web
$ npm install
$ npm start
```

Open the browser at `http://localhost:9966`.

# settings

The following settings can be set via url search parameters:

* `data` (string) url to data source, defaults to `https://ipfs.io/ipfs/QmVCYUK51Miz4jEjJxCq3bA6dfq5FXD6s2EYp6LjHQhGmh`
* `bbox` (comma separated string) view bounding box, defaults to `'7.56,47.55,7.58,47.56'` (minx, miny, maxx, maxy)
* `style` (string) url to shader style png, defaults to `style.png`

**Example** `http://localhost:9966/#data=http://localhost:8000` would set the `data` source to `http://localhost:8000`.

# license

bsd

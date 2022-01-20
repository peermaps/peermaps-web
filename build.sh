#!/bin/bash

echo '<!DOCTYPE html><html lang="en" dir="ltr"><head><title>peermaps</title><meta charset="utf-8"></head><body><script src="app.js"></script></body></html>' > public/index.html
browserify app.js > public/app.js

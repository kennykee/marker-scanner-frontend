var cacheName = 'ais-4';
var filesToCache = [
  './assets/css/common.css',
  './assets/css/fonts.css',
  './assets/fonts/Avenir-Black.ttf',
  './assets/fonts/Avenir-BlackOblique.ttf',
  './assets/fonts/Avenir-Book.ttf',
  './assets/fonts/Avenir-BookOblique.ttf',
  './assets/fonts/Avenir-Heavy.ttf',
  './assets/fonts/Avenir-HeavyOblique.ttf',
  './assets/fonts/Avenir-Light.ttf',
  './assets/fonts/Avenir-LightOblique.ttf',
  './assets/fonts/Avenir-Medium.ttf',
  './assets/fonts/Avenir-MediumOblique.ttf',
  './assets/fonts/Avenir-Oblique.ttf',
  './assets/fonts/Avenir-Roman.ttf',
  './assets/fonts/BRLNSDB.ttf',
  './assets/fonts/GOTHIC.ttf',
  './assets/fonts/GOTHICB.ttf',
  './assets/fonts/GOTHICBI.ttf',
  './assets/images/Close-Button.png',
  './assets/images/Footer-Leaves.png',
  './assets/images/Icon128.png',
  './assets/images/Icon144.png',
  './assets/images/Icon152.png',
  './assets/images/Icon192.png',
  './assets/images/Icon256.png',
  './assets/images/Icon512.png',
  './assets/images/Marker.jpg',
  './assets/images/content/butterfly-garden.png',
  './assets/images/content/desalinated.png',
  './assets/images/content/flood-control.jpg',
  './assets/images/content/hortpark.png',
  './assets/images/content/imported-water.png',
  './assets/images/content/incineration-1.png',
  './assets/images/content/incineration-2.png',
  './assets/images/content/incineration-3.png',
  './assets/images/content/lifestyle-attraction.jpg',
  './assets/images/content/newater.png',
  './assets/images/content/percentage.png',
  './assets/images/content/recycle-bin.png',
  './assets/images/content/recycle-glass-header.png',
  './assets/images/content/recycle-glass.png',
  './assets/images/content/recycle-metal-header.png',
  './assets/images/content/recycle-metal.png',
  './assets/images/content/recycle-others-header.png',
  './assets/images/content/recycle-others.png',
  './assets/images/content/recycle-paper-header.png',
  './assets/images/content/recycle-paper.png',
  './assets/images/content/recycle-plastic-header.png',
  './assets/images/content/recycle-plastic.png',
  './assets/images/content/water-cachement.png',
  './assets/images/favicon.png',
  './assets/images/markers-preview/abc.jpg',
  './assets/images/markers-preview/butterfly-garden.jpg',
  './assets/images/markers-preview/catchment-water.jpg',
  './assets/images/markers-preview/coral.jpg',
  './assets/images/markers-preview/desalinated.jpg',
  './assets/images/markers-preview/eco-link.jpg',
  './assets/images/markers-preview/hortpark.jpg',
  './assets/images/markers-preview/hydroponics.jpg',
  './assets/images/markers-preview/imported-water.jpg',
  './assets/images/markers-preview/incineration-1.jpg',
  './assets/images/markers-preview/incineration-2.jpg',
  './assets/images/markers-preview/incineration-3.jpg',
  './assets/images/markers-preview/mangrove.jpg',
  './assets/images/markers-preview/marina-flood-control.jpg',
  './assets/images/markers-preview/marina-lifestyle.jpg',
  './assets/images/markers-preview/newater.jpg',
  './assets/images/markers-preview/percentage.jpg',
  './assets/images/markers-preview/recycle.jpg',
  './assets/images/markers-preview/species-conservation.jpg',
  './assets/images/markers-preview/turtle.jpg',
  './assets/js/common.js',
  './assets/js/dataset.js',
  './assets/js/detection.js',
  './assets/js/jquery-3.6.0.min.js',
  './assets/js/localforage.min.js',
  './assets/js/numjs.js',
  './assets/js/numjs.min.js',
  './index.html',
  './loopfiles.php',
  './manifest.json',
  './service-worker.js',
  './views/abc.html',
  './views/butterfly-garden.html',
  './views/catchment-water.html',
  './views/coral.html',
  './views/desalinated.html',
  './views/eco-link.html',
  './views/hortpark.html',
  './views/hydroponics.html',
  './views/imported-water.html',
  './views/incineration-1.html',
  './views/incineration-2.html',
  './views/incineration-3.html',
  './views/mangrove.html',
  './views/marina-flood-control.html',
  './views/marina-lifestyle.html',
  './views/newater.html',
  './views/percentage.html',
  './views/recycle-bin.html',
  './views/recycle-glass.html',
  './views/recycle-metal.html',
  './views/recycle-others.html',
  './views/recycle-paper.html',
  './views/recycle-plastic.html',
  './views/recycle.html',
  './views/species-conservation.html',
  './views/turtle.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        }));
      })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
});
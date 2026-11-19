/* Service Worker - Gestor de Ensayos Agricolas v0.3
   Estrategia: cache primero para los archivos de la app (funciona sin conexion).
   Los datos del usuario viven en localStorage, no pasan por este archivo. */
var CACHE = "gestor-ensayos-v0.3";
var ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon-180.png"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ARCHIVOS); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit) {
      if (hit) return hit;
      return fetch(e.request).then(function(resp) {
        if (resp && resp.ok && new URL(e.request.url).origin === self.location.origin) {
          var copia = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, copia); });
        }
        return resp;
      }).catch(function() {
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});

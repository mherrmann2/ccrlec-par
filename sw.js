/* CCRLEC SWAT — Post-Activation Report
   Offline shell.

   Bump SHELL only when you ADD or REMOVE a file from ASSETS.
   Editing index.html does NOT require a bump: the fetch handler revalidates in
   the background, so a pushed change lands on the next launch on its own.        */

const SHELL  = "ccrlec-par-shell-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL)
      /* individually, so one 404 can't fail the whole install */
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.open(SHELL).then(cache =>
      cache.match(req).then(hit => {
        /* refresh the cache in the background — never blocks the response */
        const fresh = fetch(req)
          .then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => null);

        if (hit) return hit;                     // offline-first: cached wins
        return fresh.then(res =>
          res || (req.mode === "navigate" ? cache.match("./index.html") : undefined)
        );
      })
    )
  );
});

/* lets the page force an immediate takeover after an update */
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });

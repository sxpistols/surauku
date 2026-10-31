// Only this module may register the app-shell service worker.
export function refuseOfflineWorker(host: string, production: boolean, inFrame: boolean, disabled: boolean): boolean {
  const hostname = host.toLowerCase();
  const platformDomain = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(hostname);
  const firstLabel = hostname.split(".")[0] ?? "";
  return !production || inFrame || disabled
    || (platformDomain && /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(firstLabel))
    || (platformDomain && firstLabel === "project--556d9f94-2058-4d82-8889-3d5d2718e292-dev")
    || /(^|\.)lovableproject(?:-dev)?\.com$/.test(hostname)
    || /(^|\.)beta\.lovable\.dev$/.test(hostname);
}

export async function initializeOffline(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const refused = refuseOfflineWorker(window.location.hostname, import.meta.env.PROD, window.self !== window.top, new URLSearchParams(window.location.search).get("sw") === "off");
  if (refused) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter((r) => [r.active, r.waiting, r.installing].some((w) => w && new URL(w.scriptURL).pathname === "/sw.js")).map((r) => r.unregister()));
    return;
  }
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  // Prime the NetworkFirst navigation cache during the first online visit.
  // Navigations themselves always try the network before this saved HTML.
  if (navigator.onLine) {
    const response = await fetch("/", { cache: "reload", credentials: "same-origin" });
    if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
      const cache = await caches.open("arrazqa-pages");
      await cache.put(new Request(new URL("/", window.location.origin)), response);
    }
  }
}
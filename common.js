// Zajedničke funkcije za sve tri stranice. Učitava se posle config.js.
"use strict";

const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Svaki tekst koji ide u HTML string prolazi kroz ovo. */
function esc(s) {
  return s == null ? "" : String(s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
}

// sr-Latn-RS umesto sr-RS: sr-RS u browserima daje ćirilične nazive meseci,
// a interfejs je na latinici.
const DATE_FMT = new Intl.DateTimeFormat("sr-Latn-RS", { day: "2-digit", month: "short", year: "numeric" });

function fmtDate(ts) {
  const d = new Date(ts);
  return Number.isFinite(d.getTime()) ? DATE_FMT.format(d) : "";
}

/** Srpska množina: 1 zadatak, 2 zadatka, 5 zadataka, 11 zadataka, 21 zadatak. */
function plural(n, one, few, many) {
  const d = n % 10, h = n % 100;
  const word = d === 1 && h !== 11 ? one : d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
  return n + " " + word;
}

/** Za pretragu: bez razlike u velikim i malim slovima i bez kvačica ("cas" nalazi "čas"). */
function norm(s) {
  return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const GITHUB_ICON =
  '<svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

function mountGithubLink() {
  const box = document.querySelector(".head-actions");
  if (!box) return;
  const a = document.createElement("a");
  a.className = "icon-link";
  a.href = SITE.profileUrl;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "GitHub profil");
  a.innerHTML = GITHUB_ICON;
  box.prepend(a);
}

/**
 * Učitava JSON indeks sa Pages. 404 znači "nema zadataka", ne grešku.
 * Vraća samo validne zapise, najnovije prvo.
 */
async function loadIndex(path, isValid) {
  const res = await fetch(path + "?t=" + Date.now(), { cache: "no-store" });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(path + " nije niz");
  return data.filter(isValid).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

const isValidEntry = (e) => Boolean(e && e.imagePath && e.title);

function loadEntries() {
  return loadIndex("entries.json", isValidEntry);
}

/** Fajlovi zadatka. Podržava i stari format sa jednim fajlom (fileName/filePath). */
function codeFiles(e) {
  if (Array.isArray(e.files)) return e.files.filter((f) => f && f.path);
  return e.filePath ? [{ name: e.fileName || e.filePath.split("/").pop(), path: e.filePath }] : [];
}

const isValidCode = (e) => Boolean(e && e.title && codeFiles(e).length);

function loadCode() {
  return loadIndex("kod.json", isValidCode);
}

import assert from "node:assert/strict";
import test from "node:test";
import { createAutosaveQueue, type SaveStatus } from "./autosave-queue";

const albumUrl = "https://open.spotify.com/album/1vFBbcOrnLrUvqxniNWIpG?si=1U8XMOFAR9GNzvUS9Ueekg&utm_source=copy-link&nd=1&dlsi=8b3441b2d2a74679";
const oldUrl = "https://https//open.spotify.com/artist/3fprSiDV5zFMRCtSyg9ioQ?si=--ZEeWsAS3CxMUtHSfoXIg&utm_source=copy-link";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

test("a slow old write finishes before the newest URL is saved, preserving every query parameter", async () => {
  const oldWrite = deferred();
  const started = deferred();
  const writes: Record<string, unknown>[] = [];
  let stored = { url: oldUrl, label: "Spotify", tag: "Stream" };
  let active = 0;
  let maxActive = 0;
  let status: SaveStatus = { pending: false, error: "" };
  const queue = createAutosaveQueue(async (_key, patch) => {
    active++;
    maxActive = Math.max(maxActive, active);
    writes.push(patch);
    if (writes.length === 1) { started.resolve(); await oldWrite.promise; }
    stored = { ...stored, ...patch };
    active--;
    return { ...stored };
  }, (next) => { status = next; });

  queue.enqueue("/api/links/spotify", { url: oldUrl });
  const saving = queue.flush();
  await started.promise;
  queue.enqueue("/api/links/spotify", { url: albumUrl });
  queue.enqueue("/api/links/spotify", { label: "New album" });
  queue.enqueue("/api/links/spotify", { tag: "Listen" });
  assert.equal(writes.length, 1);
  oldWrite.resolve();
  await saving;

  assert.equal(maxActive, 1);
  assert.equal(writes.length, 2);
  assert.deepEqual(stored, { url: albumUrl, label: "New album", tag: "Listen" });
  assert.deepEqual(status, { pending: false, error: "" });
});

test("rapid typing coalesces unsent patches without mixing rows or menu entries", async () => {
  const writes: [string, Record<string, unknown>][] = [];
  const queue = createAutosaveQueue(async (key, patch) => { writes.push([key, patch]); }, () => {});
  queue.enqueue("link-one", { url: "https://o" });
  queue.enqueue("link-two", { label: "Other link" });
  queue.enqueue("link-one", { url: albumUrl });
  queue.enqueue("menu-one", { url: "/blog" });
  await queue.flush();
  assert.deepEqual(writes, [["link-one", { url: albumUrl }], ["link-two", { label: "Other link" }], ["menu-one", { url: "/blog" }]]);
});

test("failed writes retain all fields and newer edits win on retry", async () => {
  const started = deferred();
  const fail = deferred();
  const writes: Record<string, unknown>[] = [];
  let status: SaveStatus = { pending: false, error: "" };
  const queue = createAutosaveQueue(async (_key, patch) => {
    writes.push(patch);
    if (writes.length === 1) { started.resolve(); await fail.promise; throw new Error("Network unavailable"); }
  }, (next) => { status = next; });
  queue.enqueue("spotify", { url: oldUrl, label: "New album" });
  const saving = queue.flush();
  await started.promise;
  queue.enqueue("spotify", { url: albumUrl });
  fail.resolve();
  await assert.rejects(saving, /Network unavailable/);
  assert.deepEqual(status, { pending: true, error: "Network unavailable" });
  await queue.flush();
  assert.deepEqual(writes[1], { url: albumUrl, label: "New album" });
  assert.deepEqual(status, { pending: false, error: "" });
});

test("flushing pending edits completes before a following move or delete", async () => {
  const saved = deferred();
  const events: string[] = [];
  const queue = createAutosaveQueue(async () => { await saved.promise; events.push("saved"); }, () => {});
  queue.enqueue("link", { url: albumUrl });
  const operation = queue.flush().then(() => { events.push("moved"); });
  assert.deepEqual(events, []);
  saved.resolve();
  await operation;
  assert.deepEqual(events, ["saved", "moved"]);
});

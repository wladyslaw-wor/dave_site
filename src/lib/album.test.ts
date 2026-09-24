import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_ALBUM, parseAlbum, youtubeEmbedUrl } from "./album";

test("YouTube links normalize to privacy-enhanced embeds", () => {
  for (const url of [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=12",
    "https://youtu.be/dQw4w9WgXcQ?si=share",
    "https://m.youtube.com/shorts/dQw4w9WgXcQ",
    "https://youtube.com/live/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  ]) assert.equal(youtubeEmbedUrl(url), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
});

test("YouTube embeds reject unsafe protocols, lookalike hosts and invalid IDs", () => {
  for (const url of [
    "javascript:alert(1)", "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ", "https://youtu.be/invalid",
    "https://youtube.com/playlist?list=dQw4w9WgXcQ", "<iframe src='https://youtube.com'></iframe>",
  ]) assert.equal(youtubeEmbedUrl(url), null);
});

test("album keeps list order, multiline text, title-only singles and uploaded photos", () => {
  const result = parseAlbum({
    ...EMPTY_ALBUM, title: " Album ", text: " First paragraph\n\nSecond paragraph ",
    singles: [{ id: "second", title: "Second", url: "" }, { id: "first", title: "First", url: "https://example.com/single" }],
    photos: [{ id: "photo", title: "Studio", url: "/api/uploads/album/test.jpg" }],
  });
  assert.equal(result.title, "Album");
  assert.equal(result.text, "First paragraph\n\nSecond paragraph");
  assert.deepEqual(result.singles.map((item) => item.id), ["second", "first"]);
  assert.equal(result.photos[0].url, "/api/uploads/album/test.jpg");
  assert.deepEqual(parseAlbum(EMPTY_ALBUM), EMPTY_ALBUM);
});

test("invalid album writes are rejected before persistence", () => {
  const item = { id: "one", title: "Title", url: "https://example.com" };
  for (const value of [
    null, [], { ...EMPTY_ALBUM, title: 1 }, { ...EMPTY_ALBUM, photos: {} },
    { ...EMPTY_ALBUM, singles: [item, item] },
    { ...EMPTY_ALBUM, platforms: [{ ...item, url: "javascript:alert(1)" }] },
    { ...EMPTY_ALBUM, photos: [{ ...item, url: "//evil.test/image.jpg" }] },
    { ...EMPTY_ALBUM, videos: [item] },
    { ...EMPTY_ALBUM, singles: Array.from({ length: 101 }, (_, i) => ({ ...item, id: String(i) })) },
  ]) assert.throws(() => parseAlbum(value));
});

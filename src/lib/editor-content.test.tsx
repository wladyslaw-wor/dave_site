import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogPostContent, MediaDisplay } from "../components/site/EditorialContent";
import { inlineText, parseArchive, parseBlog, publishedBlog, videoSource, type BlogPost } from "./editor-content";

const post: BlogPost = {
  id: "story", title: "A studio note", date: "2026-09-24", published: true,
  blocks: [
    { id: "intro", type: "text", text: "First line\nSecond line [Visit](https://example.com)" },
    { id: "photo", type: "image", url: "/api/uploads/blog/photo.jpg", caption: "In the studio" },
    { id: "video", type: "video", url: "https://youtu.be/dQw4w9WgXcQ", caption: "A session" },
    { id: "outro", type: "text", text: "After the video" },
  ],
};

test("blog preserves interleaved content, date, links and manual post order", () => {
  const blog = { posts: [post, { ...post, id: "draft", published: false }] };
  assert.deepEqual(parseBlog(blog), blog);
  assert.deepEqual(publishedBlog(blog), { posts: [post] });
  assert.deepEqual(parseBlog({ posts: [] }), { posts: [] });
  assert.deepEqual(parseBlog({ posts: [{ ...post, title: "", blocks: [], published: false }] }).posts[0].blocks, []);
});

test("invalid writes cannot persist unsafe URLs, invalid dates or duplicate IDs", () => {
  for (const value of [null, [], { posts: [post, post] }, { posts: [{ ...post, published: "true" }] },
    { posts: [{ ...post, date: "2026-02-30" }] }, { posts: [{ ...post, title: "" }] },
    { posts: [{ ...post, blocks: [] }] }, { posts: [{ ...post, blocks: [post.blocks[0], post.blocks[0]] }] },
    { posts: [{ ...post, blocks: [{ id: "x", type: "html", text: "<script>" }] }] },
    { posts: Array.from({ length: 101 }, (_, i) => ({ ...post, id: String(i) })) },
  ]) assert.throws(() => parseBlog(value));
  for (const url of ["javascript:alert(1)", "data:text/html,hi", "//example.com/x", "/api/uploads/../../secret.jpg", "https://user:secret@example.com/x", ""]) {
    assert.throws(() => parseArchive({ items: [{ id: "x", type: "image", caption: "", url }] }));
  }
});

test("archive accepts uploaded files, remote photos and video links in chosen order", () => {
  const items = [
    { id: "v", type: "video", url: "/api/uploads/video/clip.mp4", caption: "Live" },
    { id: "p", type: "image", url: "https://example.com/photo.jpg", caption: "Backstage" },
    { id: "l", type: "video", url: "https://example.com/watch/123", caption: "Interview" },
  ];
  assert.deepEqual(parseArchive({ items }).items, items);
  assert.equal(videoSource(items[0].url)?.type, "file");
  assert.equal(videoSource("https://example.com/clip.webm?token=abc")?.type, "file");
  assert.equal(videoSource("https://youtu.be/dQw4w9WgXcQ")?.type, "embed");
  assert.equal(videoSource(items[2].url)?.type, "link");
  assert.equal(videoSource("javascript:alert(1)"), null);
});

test("blog escapes HTML and only renders safe inline links in a new tab", () => {
  const html = renderToStaticMarkup(<BlogPostContent post={{ ...post, blocks: [
    { id: "text", type: "text", text: '<script>alert(1)</script> [Visit](https://example.com) [bad](javascript:alert(1))' },
  ] }} />);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes('href="javascript:'));
  assert.match(html, /href="https:\/\/example.com" target="_blank" rel="noopener noreferrer"/);
  assert.deepEqual(inlineText("[one](https://one.example) then [two](https://two.example)").filter((part) => part.href).map((part) => part.href), ["https://one.example", "https://two.example"]);
});

test("media render uses controlled players and external fallback links", () => {
  const file = renderToStaticMarkup(<MediaDisplay item={{ id: "v", type: "video", url: "/api/uploads/video/x.mp4", caption: "Live" }} />);
  assert.match(file, /<video[^>]*controls=""[^>]*playsInline=""[^>]*preload="metadata"/);
  const other = renderToStaticMarkup(<MediaDisplay item={{ id: "v", type: "video", url: "https://example.com/watch", caption: "Interview" }} />);
  assert.ok(!other.includes("<iframe"));
  assert.ok(other.includes('target="_blank" rel="noopener noreferrer"'));
});

"use client";

import { useState } from "react";
import { parseBlog, type BlogBlock, type BlogData, type BlogPost } from "@/lib/editor-content";
import { BlogPostContent } from "@/components/site/EditorialContent";
import { EditorSave, ItemControls, MediaEditor, TextEditor, moveItem, useContentEditor } from "../editor/EditorTools";

function AddBlock({ disabled, onAdd }: { disabled: boolean; onAdd: (type: BlogBlock["type"]) => void }) {
  return <div className="admin-btn-row editor-insert" aria-label="Insert content here">
    <button type="button" className="admin-btn" disabled={disabled} onClick={() => onAdd("text")}>+ Text</button>
    <button type="button" className="admin-btn" disabled={disabled} onClick={() => onAdd("image")}>+ Photo</button>
    <button type="button" className="admin-btn" disabled={disabled} onClick={() => onAdd("video")}>+ Video</button>
  </div>;
}

export function BlogTab({ initialBlog }: { initialBlog: BlogData }) {
  const editor = useContentEditor(initialBlog, "/api/blog", parseBlog);
  const { data: blog, setData, uploads, saving, onBusyChange } = editor;
  const [preview, setPreview] = useState<string | null>(null);

  function updatePost(id: string, patch: Partial<BlogPost>) {
    setData((prev) => ({ posts: prev.posts.map((post) => post.id === id ? { ...post, ...patch } : post) }));
  }

  function updateBlock(postId: string, id: string, block: BlogBlock) {
    setData((prev) => ({ posts: prev.posts.map((post) => post.id === postId ? { ...post, blocks: post.blocks.map((item) => item.id === id ? block : item) } : post) }));
  }

  function addBlock(post: BlogPost, index: number, type: BlogBlock["type"]) {
    const id = crypto.randomUUID();
    const block: BlogBlock = type === "text" ? { id, type, text: "" } : { id, type, url: "", caption: "" };
    updatePost(post.id, { blocks: [...post.blocks.slice(0, index), block, ...post.blocks.slice(index)] });
  }

  return <form className="admin-tab-content" onSubmit={(event) => { event.preventDefault(); void editor.save(); }}>
    <p className="admin-hint">Create posts with text, photos and videos. Enable Published and save to show a post on /blog. Drafts stay private. Post order here is the order on the page.</p>
    <fieldset className="album-editor-fields" disabled={saving || uploads > 0}>
      <div className="admin-group-header">
        <h3 className="admin-group-title">Blog posts</h3>
        <button type="button" className="admin-btn" disabled={blog.posts.length >= 100} onClick={() => {
          const now = new Date();
          const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          const post: BlogPost = { id: crypto.randomUUID(), title: "", date, published: false, blocks: [{ id: crypto.randomUUID(), type: "text", text: "" }] };
          setData((prev) => ({ posts: [post, ...prev.posts] }));
        }}>+ Add post</button>
      </div>
      {blog.posts.length === 0 ? <p className="admin-field-hint">No posts yet. Add your first story.</p> : null}
      {blog.posts.map((post, index) => <section className="album-editor-card" key={post.id}>
        <div className="admin-group-header">
          <h3 className="admin-group-title">{post.title || "Untitled post"} · {post.published ? "Published" : "Draft"}</h3>
          <ItemControls label={`post ${index + 1}`} index={index} count={blog.posts.length}
            onMove={(direction) => setData((prev) => ({ posts: moveItem(prev.posts, index, direction) }))}
            onRemove={() => { if (window.confirm(`Remove “${post.title || "Untitled post"}”? Save the blog to apply this change.`)) setData((prev) => ({ posts: prev.posts.filter((item) => item.id !== post.id) })); }} />
        </div>
        <label className="admin-field"><span className="admin-field-label">Post title</span><input className="admin-input" maxLength={500} value={post.title} onChange={(event) => updatePost(post.id, { title: event.target.value })} /></label>
        <label className="admin-field"><span className="admin-field-label">Date</span><input className="admin-input" type="date" value={post.date} onChange={(event) => updatePost(post.id, { date: event.target.value })} /></label>
        <label className="editor-publish"><input type="checkbox" checked={post.published} onChange={(event) => updatePost(post.id, { published: event.target.checked })} /> Published</label>
        <AddBlock disabled={post.blocks.length >= 100} onAdd={(type) => addBlock(post, 0, type)} />
        {post.blocks.map((block, blockIndex) => <div className="editor-block-group" key={block.id}>
          <div className="album-editor-card">
            <div className="admin-group-header">
              <span className="admin-field-label">{block.type === "image" ? "Photo" : block.type} · {blockIndex + 1}</span>
              <ItemControls label={`block ${blockIndex + 1} of post ${index + 1}`} index={blockIndex} count={post.blocks.length}
                onMove={(direction) => updatePost(post.id, { blocks: moveItem(post.blocks, blockIndex, direction) })}
                onRemove={() => { if (window.confirm("Remove this content block?")) updatePost(post.id, { blocks: post.blocks.filter((item) => item.id !== block.id) }); }} />
            </div>
            {block.type === "text" ? <TextEditor value={block.text} onChange={(text) => updateBlock(post.id, block.id, { ...block, text })} />
              : <MediaEditor item={block} category="blog" onChange={(item) => updateBlock(post.id, block.id, item)} onBusyChange={onBusyChange} />}
          </div>
          <AddBlock disabled={post.blocks.length >= 100} onAdd={(type) => addBlock(post, blockIndex + 1, type)} />
        </div>)}
        <div className="admin-btn-row"><button type="button" className="admin-btn" aria-expanded={preview === post.id} onClick={() => setPreview(preview === post.id ? null : post.id)}>{preview === post.id ? "Hide preview" : "Preview post"}</button></div>
        {preview === post.id ? <div className="editor-post-preview">{post.date && Number.isFinite(Date.parse(post.date)) ? <BlogPostContent post={post} /> : <p className="admin-field-hint">Enter a date to preview this post.</p>}</div> : null}
      </section>)}
    </fieldset>
    <EditorSave name="blog" href="/blog" {...editor} />
  </form>;
}

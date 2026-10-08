"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // See More ကြည့်ထားသော Post ID များကို မှတ်ထားရန်
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  
  // Comment ရေးသားရန် Input State
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Post တင်ခြင်း
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (file) formData.append("file", file);

      const res = await fetch("/api/posts", { method: "POST", body: formData });
      if (res.ok) {
        setTitle("");
        setContent("");
        setFile(null);
        await fetchPosts();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Upvote တိုးခြင်း
  const handleUpvote = async (postId: number, currentUpvotes: number) => {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upvote", postId, currentUpvotes: currentUpvotes || 0 }),
    });
    fetchPosts();
  };

  // Comment တင်ခြင်း
  const handleCommentSubmit = async (postId: number) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", postId, content: commentText }),
    });

    setCommentInputs({ ...commentInputs, [postId]: "" });
    fetchPosts();
  };

  // Post ဖျက်ခြင်း
  const handleDelete = async (id: number) => {
    if (!confirm("ဒီ Post ကို ဖျက်မှာ သေချာပါသလား?")) return;
    const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchPosts();
  };

  // See More အဖွင့်အပိတ် ပြုလုပ်ရန်
  const toggleExpand = (id: number) => {
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ maxWidth: "550px", margin: "20px auto", padding: "15px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>MM Sub App</h1>

      {/* Post ဖန်တီးရန် Form */}
      <form onSubmit={handleSubmit} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px", border: "1px solid #ddd" }}>
        <h3>Post အသစ်ဖန်တီးရန်</h3>
        <input
          type="text"
          placeholder="ခေါင်းစဉ်"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
        <textarea
          placeholder="အကြောင်းအရာ"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: "10px" }} />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}
        >
          {loading ? "တင်နေသည်..." : "Post တင်မည်"}
        </button>
      </form>

      {/* Post စာရင်း */}
      <h2 style={{ marginTop: "30px" }}>Post များ စာရင်း</h2>
      {posts.length === 0 ? (
        <p>Post များ မရှိသေးပါ...</p>
      ) : (
        posts.map((post) => {
          const isExpanded = expandedPosts[post.id];
          const isLongText = post.content.length > 100;
          const displayContent = isExpanded || !isLongText ? post.content : post.content.substring(0, 100) + "...";

          return (
            <div key={post.id} style={{ border: "1px solid #e0e0e0", padding: "15px", marginTop: "15px", borderRadius: "10px", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              
              {/* Header: Upvote & Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "18px" }}>{post.title}</h3>
                <button
                  onClick={() => handleUpvote(post.id, post.upvotes)}
                  style={{ display: "flex", alignItems: "center", gap: "5px", background: "#f0f2f5", border: "none", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}
                >
                  ▲ {post.upvotes || 0}
                </button>
              </div>

              {/* ပုံ */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  style={{ maxWidth: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }}
                />
              )}

              {/* အကြောင်းအရာ စာသား (See More ဖြင့်) */}
              <p style={{ color: "#333", marginTop: "10px", lineHeight: "1.5" }}>
                {displayContent}
                {isLongText && (
                  <span
                    onClick={() => toggleExpand(post.id)}
                    style={{ color: "#0070f3", cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}
                  >
                    {isExpanded ? "See less" : "See more"}
                  </span>
                )}
              </p>

              <button
                onClick={() => handleDelete(post.id)}
                style={{ backgroundColor: "#ff4d4f", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
              >
                Delete
              </button>

              <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #eee" }} />

              {/* Comment Section */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>Comments ({post.comments?.length || 0})</h4>

                {/* Comment များပြရန် */}
                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {post.comments.map((c: any) => (
                      <div key={c.id} style={{ background: "#f0f2f5", padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}>
                        {c.content}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment ရေးရန် Form */}
                <div style={{ display: "flex", gap: "5px" }}>
                  <input
                    type="text"
                    placeholder="Comment ရေးရန်..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "13px" }}
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    style={{ padding: "8px 12px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px", fontSize: "13px", cursor: "pointer" }}
                  >
                    Send
                  </button>
                </div>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
        }

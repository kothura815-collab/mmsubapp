"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // See More ကြည့်ထားသော Post ID များ
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  
  // Comments ပိတ်/ဖွင့် မှတ်ထားရန် State
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  
  // Comment ရေးသားရန် Input State
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  const topRef = useRef<HTMLDivElement>(null);

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
      body: JSON.stringify({ action: "upvote", postId, currentUpvotes }),
    });
    fetchPosts();
  };

  // View Count တိုးခြင်းနှင့် See More ဖွင့်ခြင်း
  const handleToggleExpand = async (postId: number, currentViews: number) => {
    const isCurrentlyExpanded = expandedPosts[postId];
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));

    if (!isCurrentlyExpanded) {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementView", postId, currentViews }),
      });
      fetchPosts();
    }
  };

  // Comments ပိတ်/ဖွင့် Toggle လုပ်ရန်
  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
    setShowComments((prev) => ({ ...prev, [postId]: true })); // comment တင်ပြီးရင် ဖွင့်ပြမည်
    fetchPosts();
  };

  // အပေါ်ဆုံးသို့ သွားရန် Function
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ maxWidth: "550px", margin: "20px auto", padding: "15px", fontFamily: "sans-serif", position: "relative" }}>
      
      {/* Top Anchor */}
      <div ref={topRef}></div>

      <h1 style={{ textAlign: "center" }}>MM Sub App</h1>

      {/* Post ဖန်တီးရန် Form */}
      <form onSubmit={handleSubmit} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px", border: "1px solid #ddd" }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Post အသစ်ဖန်တီးရန်</h3>
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
          const isLongText = post.content.length > 80;
          const displayContent = isExpanded || !isLongText ? post.content : post.content.substring(0, 80) + "...";
          const isCommentsOpen = showComments[post.id];

          return (
            <div key={post.id} style={{ border: "1px solid #e0e0e0", padding: "15px", marginTop: "15px", borderRadius: "10px", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              
              {/* Title & Upvote & Views */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "18px" }}>{post.title}</h3>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#666", background: "#f0f2f5", padding: "4px 8px", borderRadius: "12px" }}>
                    👁️ {post.views || 100} views
                  </span>
                  <button
                    onClick={() => handleUpvote(post.id, post.upvotes || 0)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", background: "#e6f0ff", color: "#0070f3", border: "none", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    ▲ {post.upvotes || 0}
                  </button>
                </div>
              </div>

              {/* ပုံ */}
              {post.image_url && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={post.image_url}
                    alt={post.title}
                    style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
              )}

              {/* Content */}
              <p style={{ color: "#333", marginTop: "10px", lineHeight: "1.5" }}>
                {displayContent}
                {isLongText && (
                  <span
                    onClick={() => handleToggleExpand(post.id, post.views || 100)}
                    style={{ color: "#0070f3", cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}
                  >
                    {isExpanded ? "See less" : "See more"}
                  </span>
                )}
              </p>

              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #eee" }} />

              {/* Comment Toggle Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => toggleComments(post.id)}
                  style={{ background: "none", border: "none", color: "#555", fontWeight: "bold", cursor: "pointer", padding: 0, fontSize: "14px" }}
                >
                  💬 Comments ({post.comments?.length || 0}) {isCommentsOpen ? "▲ (ချုံ့မည်)" : "▼ (ကြည့်မည်)"}
                </button>
              </div>

              {/* Comments Section (Toggle အဖွင့်/အပိတ်) */}
              {isCommentsOpen && (
                <div style={{ marginTop: "10px" }}>
                  {/* Comments List - ခွဲခြားပြသခြင်း */}
                  {post.comments && post.comments.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                      {post.comments.map((c: any) => (
                        <div key={c.id} style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", borderLeft: "3px solid #0070f3", fontSize: "13px", color: "#333" }}>
                          {c.content}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "12px", color: "#888", margin: "5px 0 10px 0" }}>Comment မရှိသေးပါ...</p>
                  )}

                  {/* Comment Input */}
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
              )}

            </div>
          );
        })
      )}

      {/* Floating Up Top Button */}
      <button
        onClick={scrollToTop}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "10px 16px",
          fontSize: "14px",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        ▲ Top
      </button>

    </div>
  );
          }

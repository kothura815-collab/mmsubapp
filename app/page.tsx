"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: number;
  text: string;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  upvotes?: number;
  comments?: Comment[];
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [expandedPostIds, setExpandedPostIds] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  // Post များ ဆွဲယူရန်
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const formattedData = data.map((p: any) => ({
            ...p,
            upvotes: p.upvotes || 0,
            comments: p.comments || [],
          }));
          setPosts(formattedData);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // Post အသစ် တင်ရန် Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Post တင်ခြင်း မအောင်မြင်ပါ");
      }

      setTitle("");
      setContent("");
      setFile(null);
      await fetchPosts();
      alert("Post အောင်မြင်စွာ တက်သွားပါပြီ!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Post ဖျက်ရန်
  const handleDelete = async (id: number) => {
    if (!confirm("ဒီ Post ကို ဖျက်မှာ သေချာပါသလား?")) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Post ဖျက်ပြီးပါပြီ!");
        await fetchPosts();
      } else {
        const data = await res.json();
        alert("ဖျက်လို့ မရပါ: " + (data.error || ""));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // See More / See Less Toggle
  const toggleExpand = (id: number) => {
    setExpandedPostIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Upvote (Up Arrow) နှိပ်ခြင်း
  const handleUpvote = (id: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, upvotes: (post.upvotes || 0) + 1 } : post
      )
    );
  };

  // Comment ထည့်ခြင်း
  const handleAddComment = (postId: number) => {
    const text = commentInputs[postId];
    if (!text || text.trim() === "") return;

    const newComment: Comment = {
      id: Date.now(),
      text: text,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment],
          };
        }
        return post;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", padding: "16px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>MM Sub App</h1>

      {/* မူရင်း Post အသစ်ဖန်တီးရန် Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#f9f9f9",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Post အသစ်ဖန်တီးရန်</h3>
        <input
          type="text"
          placeholder="ခေါင်းစဉ်"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
        />
        <textarea
          placeholder="အကြောင်းအရာ"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: "10px", display: "block" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "တင်နေသည်..." : "Post တင်မည်"}
        </button>
      </form>

      {/* Post များ စာရင်း Feed အပိုင်း */}
      <h2>Post များ စာရင်း</h2>
      {posts.length === 0 ? (
        <p>Post များ မရှိသေးပါ...</p>
      ) : (
        posts.map((post) => {
          const isExpanded = expandedPostIds.includes(post.id);
          const shouldTruncate = post.content && post.content.length > 120;
          const displayContent = isExpanded
            ? post.content
            : shouldTruncate
            ? `${post.content.slice(0, 120)}...`
            : post.content;

          return (
            <div
              key={post.id}
              style={{
                border: "1px solid #e0e0e0",
                padding: "16px",
                marginTop: "16px",
                borderRadius: "10px",
                display: "flex",
                gap: "12px",
                backgroundColor: "#fff",
              }}
            >
              {/* Up Arrow (Upvote) ခလုတ် */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  onClick={() => handleUpvote(post.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f0f0f0",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  title="Upvote"
                >
                  ▲
                </button>
                <span style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>
                  {post.upvotes}
                </span>
              </div>

              {/* ပို့စ် အကြောင်းအရာ အပြည့်အစုံ */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: "0 0 8px 0" }}>{post.title}</h3>
                  <button
                    onClick={() => handleDelete(post.id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#ff4d4f",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Delete
                  </button>
                </div>

                {/* ပုံ ပြသခြင်း */}
                {post.image_url && (
                  <div style={{ margin: "10px 0" }}>
                    <img
                      src={post.image_url}
                      alt={post.title}
                      style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "6px", objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* စာကြောင်း အနည်းငယ် + See More */}
                <p style={{ fontSize: "14px", color: "#333", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                  {displayContent}
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      style={{
                        marginLeft: "6px",
                        color: "#0070f3",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        padding: 0,
                      }}
                    >
                      {isExpanded ? "See less" : "See more"}
                    </button>
                  )}
                </p>

                {/* Comments အပိုင်း */}
                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #eee" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>COMMENTS</h4>

                  {/* Comment ရေးရန် input */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      style={{ flex: 1, padding: "6px 8px", fontSize: "13px", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Send
                    </button>
                  </div>

                  {/* Comment များကို လစ်စထုတ်ပြခြင်း */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          style={{ background: "#f5f5f5", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" }}
                        >
                          <span style={{ fontWeight: "bold" }}>{comment.text}</span>
                          <span style={{ color: "#888", marginLeft: "8px", fontSize: "10px" }}>{comment.createdAt}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: "12px", color: "#aaa", italic: "true", margin: 0 }}>No comments yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

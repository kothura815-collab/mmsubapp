"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Post များ ဆွဲယူရန်
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Post အသစ် တင်ရန်
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

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>MM Sub App</h1>

      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px" }}>
        <h3>Post အသစ်ဖန်တီးရန်</h3>
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
          style={{ marginBottom: "10px" }}
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
          }}
        >
          {loading ? "တင်နေသည်..." : "Post တင်မည်"}
        </button>
      </form>

      <h2 style={{ marginTop: "30px" }}>Post များ စာရင်း</h2>
      {posts.length === 0 ? (
        <p>Post များ မရှိသေးပါ...</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ border: "1px solid #ddd", padding: "10px", marginTop: "10px", borderRadius: "6px" }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt={post.title} style={{ maxWidth: "100%", height: "auto" }} />
            )}
          </div>
        ))
      )}
    </div>
  );
}

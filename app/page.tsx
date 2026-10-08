"use client";

import { useState, useEffect } from "react";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseClient";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Post များ ဆွဲယူရန်
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*&order=id.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data || []);
      }
    } catch (err: any) {
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
      let imageUrl = "";

      // ၁။ ဓာတ်ပုံပါပါက Upload လုပ်မည်
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/posts/${fileName}`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": file.type || "image/jpeg",
            "x-upsert": "true",
          },
          body: file,
        });

        if (uploadRes.ok) {
          imageUrl = `${SUPABASE_URL}/storage/v1/object/public/posts/${fileName}`;
        } else {
          const uploadErr = await uploadRes.json();
          console.warn("Upload Warning:", uploadErr);
        }
      }

      // ၂။ Database ထဲသို့ Post ထည့်မည်
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          title: title,
          content: content,
          image_url: imageUrl || null,
        }),
      });

      const responseData = await insertRes.json();

      if (!insertRes.ok) {
        throw new Error(responseData.message || responseData.error || JSON.stringify(responseData));
      }

      setTitle("");
      setContent("");
      setFile(null);
      await fetchPosts();
      alert("Post အောင်မြင်စွာ တင်ပြီးပါပြီ!");
    } catch (err: any) {
      alert("Error Details: " + (err.message || err));
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

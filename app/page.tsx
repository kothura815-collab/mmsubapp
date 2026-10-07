"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching posts:", error);
    else setPosts(data || []);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("ကျေးဇူးပြု၍ ခေါင်းစဉ် ထည့်ပါ။");

    setLoading(true);
    let imageUrl = "";

    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("posts")
      .insert([{ title, content, image_url: imageUrl }]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setTitle("");
      setContent("");
      setFile(null);
      fetchPosts();
    }
  };

  return (
    <main style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>MM Sub App</h1>
      
      <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h3>Post အသစ်ဖန်တီးရန်</h3>
        <input
          type="text"
          placeholder="ခေါင်းစဉ်"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
          required
        />
        <textarea
          placeholder="အကြောင်းအရာ"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "80px" }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "တင်နေသည်..." : "Post တင်မည်"}
        </button>
      </form>

      <h2>Post များ စာရင်း</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {posts.length === 0 ? (
          <p>Post များ မရှိသေးပါ...</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ background: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #eee" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>{post.title}</h3>
              <p style={{ margin: "0 0 10px 0", color: "#444" }}>{post.content}</p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  style={{ maxWidth: "100%", borderRadius: "4px" }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

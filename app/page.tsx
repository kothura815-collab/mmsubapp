"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Post Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("funny");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Ad Task & Posting Lock State (0/3 System)
  const [adWatchCount, setAdWatchCount] = useState(0);
  const [isProcessingAd, setIsProcessingAd] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // UI Toggles
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [showAbout, setShowAbout] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Ads Watch & Processing Logic (10s Countdown)
  const handleWatchAd = () => {
    if (adWatchCount >= 3) return;
    setIsProcessingAd(true);
    setCountdown(10);

    // HilltopAds / Direct link simulator (ပွင့်သွားစေရန်)
    window.open("https://www.profitablecpmrate.com", "_blank");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsProcessingAd(false);
          const newCount = adWatchCount + 1;
          setAdWatchCount(newCount);
          
          if (newCount === 3) {
            // Random 1 to 3 points
            const randomPts = Math.floor(Math.random() * 3) + 1;
            setEarnedPoints((p) => p + randomPts);
            alert(`ဂုဏ်ယူပါတယ်! ကြော်ငြာ ၃ ခု ကြည့်ရှုပြီးပါပြီ။ ${randomPts} ပွိုင့် ရရှိထားပါသည်။ ယခု Post တင်နိုင်ပါပြီ။`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Post တင်ခြင်း (Ad Task ပြီးမှ ခွင့်ပြုမည်)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adWatchCount < 3) {
        alert("ကျေးဇူးပြု၍ ပို့စ်မတင်မီ ကြော်ငြာ (3) ကြိမ် အရင်ကြည့်ရှုပေးပါရန်။");
        return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      if (file) formData.append("file", file);

      const res = await fetch("/api/posts", { method: "POST", body: formData });
      if (res.ok) {
        setTitle("");
        setContent("");
        setFile(null);
        setAdWatchCount(0); // Reset task
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchPosts();
        alert("ပို့စ်တင်ခြင်း အောင်မြင်ပါသည်။");
      } else {
        const errData = await res.json();
        alert("Error: " + (errData.error || "Failed to post"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Share Functionality
  const handleShare = (postTitle: string) => {
    if (navigator.share) {
      navigator.share({
        title: postTitle,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link ကူးယူပြီးပါပြီ။");
    }
  };

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

  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = async (postId: number) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", postId, content: commentText }),
    });

    setCommentInputs({ ...commentInputs, [postId]: "" });
    setShowComments((prev) => ({ ...prev, [postId]: true }));
    fetchPosts();
  };

  const filteredPosts = activeCategory === "all" 
    ? posts 
    : posts.filter((p) => p.category === activeCategory);

  return (
    <div style={{ maxWidth: "600px", margin: "10px auto", padding: "10px", fontFamily: "sans-serif" }}>
      <div ref={topRef}></div>

      <h1 style={{ textAlign: "center", fontSize: "22px", marginBottom: "15px" }}>MM Sub App</h1>

      {/* စာအုပ်ဘ်ပုံစံ ကာလာစုံ Menu Tabs */}
      <div style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "10px", marginBottom: "15px" }}>
        <button onClick={() => { setActiveCategory("all"); setShowAbout(false); }} style={{ background: "#0070f3", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap" }}>MENU</button>
        <button onClick={() => { setActiveCategory("funny"); setShowAbout(false); }} style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>ဟာသ</button>
        <button onClick={() => { setActiveCategory("novel"); setShowAbout(false); }} style={{ background: "#d69e2e", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>ဝတ္ထု</button>
        <button onClick={() => { setActiveCategory("news"); setShowAbout(false); }} style={{ background: "#805ad5", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>ဆိုရှယ်သတင်း</button>
        <button onClick={() => { setActiveCategory("movie"); setShowAbout(false); }} style={{ background: "#319795", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>ဇာတ်ကား</button>
        <button onClick={() => { setActiveCategory("game"); setShowAbout(false); }} style={{ background: "#2d3748", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>Games</button>
        <button onClick={() => setShowAbout(true)} style={{ background: "#3182ce", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>About / အသုံးပြုပုံ</button>
        <a href="https://t.me/your_admin_username" target="_blank" style={{ background: "#718096", color: "#fff", textDecoration: "none", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>Admin ကိုအကြောင်းကြားရန်</a>
      </div>

      {/* About Section */}
      {showAbout ? (
        <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", lineHeight: "1.6" }}>
          <h2>အသုံးပြုပုံ အကျဉ်းချုပ် (About & How to Use)</h2>
          <p>၁။ <b>Ads View & Points:</b> Post အသစ်တစ်ခု တင်ရန်အတွက် ကြော်ငြာ (3) ကြိမ် ကြည့်ရှုပေးရပါမည်။ ပြီးလျှင် Points (၁ မှ ၃ ထထိ) အလိုအလျောက် ရရှိမည် ဖြစ်ပါသည်။</p>
          <p>၂။ <b>Categories:</b> ဟာသ၊ ဝတ္ထု၊ ဆိုရှယ်သတင်းနှင့် ဇာတ်ကားများကို သက်ဆိုင်ရာ ကဏ္ဍအလိုက် လွယ်ကူစွာ ဖတ်ရှုနိုင်ပါသည်။</p>
          <p>၃။ <b>Community:</b> အခက်အခဲရှိပါက Menu ဘားရှိ Admin ကို အကြောင်းကြားရန် လင့်ခ်မှတစ်ဆင့် ဆက်သွယ်နိုင်ပါသည်။</p>
        </div>
      ) : (
        <>
          {/* Post Form with Ads Requirement (0/3) */}
          <form onSubmit={handleSubmit} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Post အသစ်ဖန်တီးရန် (Points: {earnedPoints})</h3>
            
            {/* Ad Task Box */}
            <div style={{ background: "#fff3cd", padding: "10px", borderRadius: "6px", marginBottom: "10px", border: "1px solid #ffeeba", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <span>Ads ကြည့်ရန် တာဝန်: <b>({adWatchCount}/3)</b></span>
                {adWatchCount < 3 && (
                  <button type="button" onClick={handleWatchAd} disabled={isProcessingAd} style={{ background: "#ffc107", border: "none", padding: "5px 10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                    {isProcessingAd ? `စောင့်ဆိုင်းနေသည် (${countdown}s)...` : "Ads ကြည့်မည်"}
                  </button>
                )}
              </div>
              {isProcessingAd && <p style={{ color: "#856404", margin: "5px 0 0 0" }}>⚠️ ကြော်ငြာကြည့်ရှုပြီး Back လုပ်လာပါက 10 စက္ကန့် စောင့်ဆိုင်းပေးပါမည်...</p>}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              <option value="funny">ဟာသ</option>
              <option value="novel">ဝတ္ထု</option>
              <option value="news">ဆိုရှယ်သတင်း</option>
              <option value="movie">ဇာတ်ကား</option>
              <option value="game">Games</option>
            </select>

            <input
              type="text"
              placeholder="ခေါင်းစဉ်"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
            <textarea
              placeholder="အကြောင်းအရာ"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ marginBottom: "10px", width: "100%" }}
            />
            <button
              type="submit"
              disabled={loading || adWatchCount < 3}
              style={{ width: "100%", padding: "10px", backgroundColor: adWatchCount < 3 ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: adWatchCount < 3 ? "not-allowed" : "pointer" }}
            >
              {loading ? "တင်နေသည်..." : adWatchCount < 3 ? "Ads (3) ခု အရင်ကြည့်ပါ" : "Post တင်မည်"}
            </button>
          </form>

          {/* Posts Feed */}
          <h2 style={{ fontSize: "18px", color: "#333" }}>Recent Posts</h2>

          {filteredPosts.length === 0 ? (
            <p style={{ color: "#777" }}>No posts found in this category...</p>
          ) : (
            filteredPosts.map((post) => {
              const isExpanded = expandedPosts[post.id];
              const isLongText = post.content.length > 80;
              const displayContent = isExpanded || !isLongText ? post.content : post.content.substring(0, 80) + "...";
              const isCommentsOpen = showComments[post.id];

              return (
                <div key={post.id} style={{ border: "1px solid #e0e0e0", padding: "12px", marginTop: "12px", borderRadius: "8px", background: "#fff" }}>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{post.title}</h3>
                    <span style={{ fontSize: "11px", color: "#666", background: "#f0f2f5", padding: "3px 8px", borderRadius: "10px" }}>
                      {post.views || 0} views
                    </span>
                  </div>

                  {post.image_url && (
                    <div style={{ marginTop: "8px" }}>
                      <img
                        src={post.image_url}
                        alt="Post attachment"
                        style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    </div>
                  )}

                  <p style={{ color: "#333", marginTop: "8px", lineHeight: "1.4", fontSize: "14px" }}>
                    {displayContent}
                    {isLongText && (
                      <span
                        onClick={() => handleToggleExpand(post.id, post.views || 0)}
                        style={{ color: "#0070f3", cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}
                      >
                        {isExpanded ? "See less" : "See more"}
                      </span>
                    )}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "13px" }}>
                    <button
                      onClick={() => toggleComments(post.id)}
                      style={{ background: "none", border: "none", color: "#555", fontWeight: "bold", cursor: "pointer", padding: 0 }}
                    >
                      💬 Comments ({post.comments?.length || 0})
                    </button>

                    <button
                      onClick={() => handleShare(post.title)}
                      style={{ background: "#edf2f7", border: "none", padding: "4px 10px", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                    >
                      🔗 Share
                    </button>
                  </div>

                  {isCommentsOpen && (
                    <div style={{ marginTop: "8px" }}>
                      {post.comments && post.comments.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "8px" }}>
                          {post.comments.map((c: any) => (
                            <div key={c.id} style={{ background: "#f8f9fa", padding: "6px 10px", borderRadius: "4px", borderLeft: "3px solid #0070f3", fontSize: "12px", color: "#333" }}>
                              {c.content}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: "11px", color: "#888", margin: "4px 0" }}>No comments yet...</p>
                      )}

                      <div style={{ display: "flex", gap: "5px" }}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" }}
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          style={{ padding: "6px 10px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
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
        </>
      )}
    </div>
  );
}

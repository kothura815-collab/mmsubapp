"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  
  // Post Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("social_news");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Ad Task State & Points
  const [adWatchCount, setAdWatchCount] = useState(0);
  const [isProcessingAd, setIsProcessingAd] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // UI Toggles
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

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

  const handleWatchAd = () => {
    if (adWatchCount >= 3) return;
    setIsProcessingAd(true);
    setCountdown(10);

    // HilltopAds Direct Link
    window.open("https://www.profitablecpmrate.com", "_blank");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsProcessingAd(false);
          const newCount = adWatchCount + 1;
          setAdWatchCount(newCount);
          
          if (newCount === 3) {
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
        setAdWatchCount(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchPosts();
        alert("ပို့စ်တင်ခြင်း အောင်မြင်ပါသည်။");
        setActiveCategory(null);
        setActiveCategoryLabel("");
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

  const handleSelectCategory = (catKey: string, label: string) => {
    setActiveCategory(catKey);
    setActiveCategoryLabel(label);
    setShowMenu(false);
  };

  const handleBackToHome = () => {
    setActiveCategory(null);
    setActiveCategoryLabel("");
    setShowMenu(false);
  };

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

  const handleContactAdmin = () => {
    window.open("https://t.me/Sayar_Soe_Thukha", "_blank", "noopener,noreferrer");
  };

  const filteredPosts = !activeCategory || activeCategory === "all"
    ? posts 
    : posts.filter((p) => p.category === activeCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fdfbf7", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "10px", boxSizing: "border-box", position: "relative" }}>
      <div ref={topRef}></div>

      {/* Header Area */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", margin: 0, fontWeight: "bold", color: "#2d3748" }}>MM Sub App</h1>
          {/* Menu အောက်တွင် ပွိုင့် Label လေး ထားရှိခြင်း */}
          <div style={{ display: "inline-block", background: "#f6e05e", color: "#744210", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>
            ⭐ Points: {earnedPoints}
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {activeCategory && (
            <button 
              onClick={handleBackToHome}
              style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}
            >
              ⬅ Back
            </button>
          )}

          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ background: "#2b6cb0", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}
          >
            {showMenu ? "✕ ပိတ်မည်" : "☰ MENU"}
          </button>
        </div>
      </div>

      {/* Menu Label/Dropdown Box (အကွက်သေးသေး အပေါ်ကနေ ထပ်ပေါ်သည့် ပုံစံ) */}
      {showMenu && (
        <div style={{ position: "absolute", top: "60px", right: "10px", left: "10px", background: "#fff", border: "1px solid #cbd5e0", borderRadius: "8px", padding: "10px", zIndex: 100, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", display: "grid", gridTemplateColumns: "1fr", gap: "6px" }}>
          
          <button onClick={() => handleSelectCategory("post", "Post တင်ရန်")} style={{ background: "#38a169", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            1- Post တင်ရန်
          </button>

          <button onClick={() => handleSelectCategory("social_news", "Social News")} style={{ background: "#805ad5", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            2- Social News
          </button>

          <button onClick={() => handleSelectCategory("whatever", "တင်ချင်ရာတင်")} style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            3- တင်ချင်ရာတင်
          </button>

          <button onClick={() => handleSelectCategory("local_news", "ရပ်ကွက်သတင်း")} style={{ background: "#dd6b20", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            4- ရပ်ကွက်သတင်း
          </button>

          <button onClick={() => handleSelectCategory("feelings", "ရင်ဖွင့်ရာ")} style={{ background: "#319795", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            5- ရင်ဖွင့်ရာ
          </button>

          <button onClick={() => handleSelectCategory("movie", "ဇာတ်ကားအညွှန်း")} style={{ background: "#744210", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            6- ဇာတ်ကားအညွှန်း
          </button>

          <button onClick={() => handleSelectCategory("novel", "ဝတ္ထု ဖတ်ရန်")} style={{ background: "#d69e2e", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            7- ဝတ္ထု ဖတ်ရန်
          </button>

          <button onClick={() => handleSelectCategory("ads", "Ads")} style={{ background: "#1a202c", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            8- Ads
          </button>

          <button onClick={() => handleSelectCategory("about", "About & Admin")} style={{ background: "#3182ce", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", textAlign: "left" }}>
            9- About & Admin
          </button>

        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, width: "100%" }}>
        
        {/* Post Form */}
        {activeCategory === "post" && (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Post အသစ်ဖန်တီးရန် (Points: {earnedPoints})</h3>
            
            <div style={{ background: "#fff3cd", padding: "10px", borderRadius: "6px", marginBottom: "10px", border: "1px solid #ffeeba", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <span>Ads ကြည့်ရန် တာဝန်: <b>({adWatchCount}/3)</b></span>
                {adWatchCount < 3 && (
                  <button type="button" onClick={handleWatchAd} disabled={isProcessingAd} style={{ background: "#ffc107", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                    {isProcessingAd ? `စောင့်ဆိုင်းနေသည် (${countdown}s)...` : "Ads ကြည့်မည်"}
                  </button>
                )}
              </div>
              {isProcessingAd && <p style={{ color: "#856404", margin: "5px 0 0 0" }}>⚠️ ကြော်ငြာကြည့်ရှုပြီး Back လုပ်လာပါက 10 စက္ကန့် စောင့်ဆိုင်းပေးပါမည်...</p>}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              <option value="social_news">Social News</option>
              <option value="whatever">တင်ချင်ရာတင်</option>
              <option value="local_news">ရပ်ကွက်သတင်း</option>
              <option value="feelings">ရင်ဖွင့်ရာ</option>
              <option value="movie">ဇာတ်ကားအညွှန်း</option>
              <option value="novel">ဝတ္ထု ဖတ်ရန်</option>
            </select>

            <input
              type="text"
              placeholder="ခေါင်းစဉ်"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
            <textarea
              placeholder="အကြောင်းအရာ ရေးသားရန်..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ marginBottom: "12px", width: "100%" }}
            />
            <button
              type="submit"
              disabled={loading || adWatchCount < 3}
              style={{ width: "100%", padding: "12px", backgroundColor: adWatchCount < 3 ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: adWatchCount < 3 ? "not-allowed" : "pointer" }}
            >
              {loading ? "တင်နေသည်..." : adWatchCount < 3 ? "Ads (3) ခု အရင်ကြည့်ပါ" : "Post တင်မည်"}
            </button>
          </form>
        )}

        {/* Ads ကဏ္ဍ (Recent Posts ပြသခြင်း မရှိပါ) */}
        {activeCategory === "ads" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", textAlign: "center" }}>
            <h2>📢 Ads & Points View</h2>
            <div style={{ background: "#fefcbf", border: "1px solid #faf089", padding: "8px", borderRadius: "6px", display: "inline-block", margin: "10px 0", fontWeight: "bold", color: "#744210" }}>
              လက်ရှိ ရရှိထားသော Points: {earnedPoints} Points
            </div>
            <p style={{ color: "#666", fontSize: "14px", margin: "10px 0 20px 0" }}>အောက်ပါလင့်ခ်များကို နှိပ်၍ ကြော်ငြာများကြည့်ရှုကာ အမှတ်များနှင့် ဝင်ငွေများ ရှာဖွေနိုင်ပါသည် -</p>
            <a 
              href="https://www.profitablecpmrate.com" 
              target="_blank" 
              style={{ display: "block", background: "#e53e3e", color: "#fff", padding: "12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", marginBottom: "10px" }}
            >
              🔥 Ads ကြည့်ပြီး ငွေရှာရန် လင့်ခ် (၁)
            </a>
            <a 
              href="https://www.profitablecpmrate.com" 
              target="_blank" 
              style={{ display: "block", background: "#3182ce", color: "#fff", padding: "12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}
            >
              ⭐ Ads ကြည့်ပြီး ငွေရှာရန် လင့်ခ် (၂)
            </a>
          </div>
        )}

        {/* About & Admin ကဏ္ဍ (Recent Posts ပြသခြင်း မရှိပါ) */}
        {activeCategory === "about" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", lineHeight: "1.6" }}>
            <h2 style={{ marginTop: 0 }}>About & Admin Support</h2>
            <p>🌟 <b>App ၏ ရည်ရွယ်ချက်:</b> မိမိကျွမ်းကျင်ရာများ၊ စိတ်ခံစားမှုများ၊ ပျော်ရွှင်မှုများနှင့် အနားယူရင်း ကိုယ်တိုင်ဖန်တီးနိုင်ရန် ရည်ရွယ်ပါသည်။</p>
            <p>📌 <b>အသုံးပြုပုံ:</b> ဆိုရှယ်မီဒီယာပေါ်တွင် ဟော့နေသည်များကို မျှဝေရန်၊ ရင်ဖွင့်ရန်၊ သတင်းစကားပါးရန်နှင့် ဝတ္ထု/ဇာတ်ကားအညွှန်းများကို ဖတ်ရှုနိုင်ပါသည်။</p>
            
            <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #eee" }} />
            
            <p style={{ color: "#e53e3e", fontWeight: "bold", fontSize: "14px" }}>
              ⚠️ ပို့စ်ကို ဖျက်ချင်ပါက Admin ဆီ တိုက်ရိုက် ဆက်သွယ်ပါရန်။
            </p>
            
            <button 
              onClick={handleContactAdmin}
              style={{ background: "#0088cc", color: "#fff", padding: "12px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}
            >
              💬 Contact Admin (Telegram)
            </button>
          </div>
        )}

        {/* Posts Feed (Ads နှင့် About မှအပ ကျန်သည့် ကဏ္ဍများတွင် ပို့စ်များ ပြသမည်) */}
        {activeCategory !== "post" && activeCategory !== "ads" && activeCategory !== "about" && (
          <>
            <h2 style={{ fontSize: "18px", color: "#333", marginTop: 0 }}>
              {activeCategoryLabel ? `${activeCategoryLabel} - ` : ""}Recent Posts
            </h2>

            {filteredPosts.length === 0 ? (
              <p style={{ color: "#777" }}>ဤကဏ္ဍတွင် ပို့စ်များ မရှိသေးပါ...</p>
            ) : (
              filteredPosts.map((post) => {
                const isExpanded = expandedPosts[post.id];
                const isLongText = post.content.length > 80;
                const displayContent = isExpanded || !isLongText ? post.content : post.content.substring(0, 80) + "...";
                const isCommentsOpen = showComments[post.id];

                return (
                  <div key={post.id} style={{ border: "1px solid #e0e0e0", padding: "12px", marginTop: "12px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", boxSizing: "border-box" }}>
                    
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
                          style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "6px" }}
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
    </div>
  );
          }

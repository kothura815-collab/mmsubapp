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

  // Ads Click Task State (0/10 System & 10s Processing)
  const [adClickCount, setAdClickCount] = useState(0);
  const [isProcessingAd, setIsProcessingAd] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // UI Toggles
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedPoints = localStorage.getItem("mm_sub_app_points");
    if (savedPoints) {
      setEarnedPoints(parseInt(savedPoints, 10) || 0);
    }
    fetchPosts();
  }, []);

  const updatePoints = (newPts: number) => {
    setEarnedPoints(newPts);
    localStorage.setItem("mm_sub_app_points", newPts.toString());
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // Ads Click & 10s Processing Logic (0/10 System, Random 1-10 Points)
  const handleWatchAd = () => {
    if (adClickCount >= 10) return;
    setIsProcessingAd(true);
    setCountdown(10);

    // HilltopAds Direct Link
    window.open("https://www.profitablecpmrate.com", "_blank");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsProcessingAd(false);
          const newCount = adClickCount + 1;
          setAdClickCount(newCount);
          
          // Random 1 to 10 points
          const randomPts = Math.floor(Math.random() * 10) + 1;
          const updatedTotal = earnedPoints + randomPts;
          updatePoints(updatedTotal);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchPosts();
        setActiveCategory(null);
        setActiveCategoryLabel("");
      }
    } catch (err: any) {
      console.error("Submit Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (catKey: string, label: string) => {
    setActiveCategory(catKey);
    setActiveCategoryLabel(label);
    setShowMenu(false);
    scrollToTop();
  };

  const handleBackToHome = () => {
    setActiveCategory(null);
    setActiveCategoryLabel("");
    setShowMenu(false);
    scrollToTop();
  };

  const scrollToTop = () => {
    setExpandedPosts({});
    setShowComments({});
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShare = (postTitle: string) => {
    if (navigator.share) {
      navigator.share({
        title: postTitle,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleToggleExpand = (postId: number, currentViews: number) => {
    const isCurrentlyExpanded = expandedPosts[postId];
    setExpandedPosts({ [postId]: !isCurrentlyExpanded });

    if (!isCurrentlyExpanded) {
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementView", postId, currentViews }),
      }).then(() => fetchPosts());
    }
  };

  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = async (postId: number) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), { id: Date.now(), content: commentText.trim() }],
          };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", postId, content: commentText.trim() }),
    });

    fetchPosts();
  };

  const handleContactAdmin = () => {
    window.open("https://t.me/Sayar_Soe_Thukha", "_blank", "noopener,noreferrer");
  };

  const renderFormattedContent = (text: string, isExpanded: boolean) => {
    if (!text) return "";
    const isLongText = text.length > 80;
    const rawDisplay = isExpanded || !isLongText ? text : text.substring(0, 80) + "...";

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = rawDisplay.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0070f3", textDecoration: "underline", wordBreak: "break-all" }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const filteredPosts = !activeCategory || activeCategory === "all"
    ? posts 
    : posts.filter((p) => p.category === activeCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fdfbf7", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "10px", boxSizing: "border-box", position: "relative" }}>
      <div ref={topRef}></div>

      {/* Header Area */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h1 style={{ fontSize: "22px", margin: 0, fontWeight: "bold", color: "#2d3748" }}>MM Sub App</h1>

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

      {/* ကာလာစုံ Menu Dropdown (အရောင်စုံ သပ်ရပ်သော ပုံစံ) */}
      {showMenu && (
        <div style={{ position: "absolute", top: "55px", right: "10px", background: "#fff", border: "1px solid #cbd5e0", borderRadius: "8px", padding: "6px", zIndex: 100, boxShadow: "0 8px 20px rgba(0,0,0,0.15)", width: "170px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <button onClick={() => handleSelectCategory("post", "Post တင်ရန်")} style={{ background: "#38a169", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>1- Post တင်ရန်</button>
          <button onClick={() => handleSelectCategory("social_news", "Social News")} style={{ background: "#805ad5", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>2- Social News</button>
          <button onClick={() => handleSelectCategory("whatever", "တင်ချင်ရာတင်")} style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>3- တင်ချင်ရာတင်</button>
          <button onClick={() => handleSelectCategory("local_news", "ရပ်ကွက်သတင်း")} style={{ background: "#dd6b20", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>4- ရပ်ကွက်သတင်း</button>
          <button onClick={() => handleSelectCategory("feelings", "ရင်ဖွင့်ရာ")} style={{ background: "#319795", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>5- ရင်ဖွင့်ရာ</button>
          <button onClick={() => handleSelectCategory("movie", "ဇာတ်ကားအညွှန်း")} style={{ background: "#744210", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>6- ဇာတ်ကားအညွှန်း</button>
          <button onClick={() => handleSelectCategory("novel", "ဝတ္ထု ဖတ်ရန်")} style={{ background: "#d69e2e", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>7- ဝတ္ထု ဖတ်ရန်</button>
          <button onClick={() => handleSelectCategory("ads", "Ads")} style={{ background: "#1a202c", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>8- Ads</button>
          <button onClick={() => handleSelectCategory("about", "About & Admin")} style={{ background: "#3182ce", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left" }}>9- About & Admin</button>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, width: "100%" }}>
        
        {/* Post Form (Modern Pill/Card Selection ဒီဇိုင်းဖြင့် Category ရွေးချယ်ခြင်း) */}
        {activeCategory === "post" && (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Post အသစ်ဖန်တီးရန်</h3>
            
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4a5568", display: "block", marginBottom: "5px" }}>
              ကဏ္ဍ (Category) ရွေးချယ်ရန်:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" }}>
              {[
                { key: "social_news", label: "Social News" },
                { key: "whatever", label: "တင်ချင်ရာတင်" },
                { key: "local_news", label: "ရပ်ကွက်သတင်း" },
                { key: "feelings", label: "ရင်ဖွင့်ရာ" },
                { key: "movie", label: "ဇာတ်ကားအညွှန်း" },
                { key: "novel", label: "ဝတ္ထု ဖတ်ရန်" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setCategory(item.key)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: category === item.key ? "2px solid #3182ce" : "1px solid #cbd5e0",
                    background: category === item.key ? "#ebf8ff" : "#f7fafc",
                    color: category === item.key ? "#2b6cb0" : "#2d3748",
                    fontWeight: "bold",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s"
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

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
              disabled={loading}
              style={{ width: "100%", padding: "12px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}
            >
              {loading ? "တင်နေသည်..." : "Post တင်မည်"}
            </button>
          </form>
        )}

        {/* Ads ကဏ္ဍ ((0/10) System, Random 1-10 Points နှင့် 10s Processing) */}
        {activeCategory === "ads" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", textAlign: "center" }}>
            <h2>📢 Ads & Points (0/10)</h2>
            <div style={{ background: "#fffaf0", border: "1px solid #ecc94b", padding: "10px 15px", borderRadius: "8px", display: "inline-block", margin: "10px 0", fontWeight: "bold", color: "#744210", fontSize: "16px" }}>
              💰 လက်ရှိ ရရှိထားသော Points: {earnedPoints} Points
            </div>

            <div style={{ background: "#fff3cd", padding: "12px", borderRadius: "8px", margin: "15px 0", border: "1px solid #ffeeba", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <span>Ads ကြည့်ရန် (Click): <b>({adClickCount}/10)</b></span>
                <button 
                  type="button" 
                  onClick={handleWatchAd} 
                  disabled={isProcessingAd || adClickCount >= 10} 
                  style={{ background: "#ffc107", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: adClickCount >= 10 ? "not-allowed" : "pointer" }}
                >
                  {isProcessingAd ? `Processing (${countdown}s)...` : "Ads ကြည့်မည်"}
                </button>
              </div>
              {isProcessingAd && <p style={{ color: "#856404", margin: "5px 0 0 0" }}>⚠️ ကြော်ငြာကြည့်ရှုပြီး Back လုပ်လာပါက 10 စက္ကန့် စောင့်ဆိုင်းပေးနေပါသည်...</p>}
            </div>

            <p style={{ color: "#666", fontSize: "14px", margin: "10px 0 20px 0" }}>အောက်ပါလင့်ခ်များကို နှိပ်၍ ကြော်ငြာများကြည့်ရှုကာ (1 မှ 10 ထထိ Random) Points အမှတ်များ စုဆောင်းနိုင်ပါသည် -</p>
            <a 
              href="https://www.profitablecpmrate.com" 
              target="_blank" 
              style={{ display: "block", background: "#e53e3e", color: "#fff", padding: "12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", marginBottom: "10px" }}
            >
              🔥 Points ရယူရန် လင့်ခ် (၁)
            </a>
            <a 
              href="https://www.profitablecpmrate.com" 
              target="_blank" 
              style={{ display: "block", background: "#3182ce", color: "#fff", padding: "12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}
            >
              ⭐ Points ရယူရန် လင့်ခ် (၂)
            </a>
          </div>
        )}

        {/* About & Admin ကဏ္ဍ */}
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

        {/* Recent Posts Feed (1s အတွင်း အမြန်ဆုံး တန်းပွင့်စေရန် Optimize ပြုလုပ်ထားသည်) */}
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
                const isCommentsOpen = showComments[post.id];

                return (
                  <div key={post.id} style={{ border: "1px solid #e0e0e0", padding: "12px", marginTop: "12px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", boxSizing: "border-box", width: "100%" }}>
                    
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

                    <p style={{ color: "#333", marginTop: "8px", lineHeight: "1.5", fontSize: "14px", whiteSpace: "pre-line", wordBreak: "break-word" }}>
                      {renderFormattedContent(post.content, isExpanded)}
                      {isLongText && (
                        <span
                          onClick={() => handleToggleExpand(post.id, post.views || 0)}
                          style={{ color: "#0070f3", cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}
                        >
                          {isExpanded ? " See less" : " See more"}
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
                            style={{ flex: "1", padding: "6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" }}
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

      {/* Floating Top Up Button */}
      <button
        onClick={scrollToTop}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          padding: "8px 14px",
          borderRadius: "20px",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          cursor: "pointer",
          fontSize: "13px",
          zIndex: 99
        }}
      >
        ▲ Top
      </button>

    </div>
  );
          }

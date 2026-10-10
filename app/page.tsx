"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("post"); 
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("Post တင်ရန်");
  const [showMenu, setShowMenu] = useState(false);
  
  // Post Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("social_news");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Ad Task State (0/3 System)
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

  // Ads Watch & Processing Logic (10s Countdown)
  const handleWatchAd = () => {
    if (adWatchCount >= 3) return;
    setIsProcessingAd(true);
    setCountdown(10);

    // HilltopAds Direct Link (သို့မဟုတ် Ad Network လင့်ခ်ထည့်ရန်)
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

  const filteredPosts = activeCategory === "post" || activeCategory === "ads" || activeCategory === "about" || activeCategory === "movie"
    ? [] 
    : posts.filter((p) => p.category === activeCategory);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fdfbf7", fontFamily: "sans-serif" }}>
      <div ref={topRef}></div>

      {/* ဘယ်ဘက် Menu သို့မဟုတ် Back ခလုတ် */}
      <div style={{ width: showMenu ? "140px" : "110px", display: "flex", flexDirection: "column", padding: "10px 0 10px 5px", position: "sticky", top: 0, height: "100vh", zIndex: 10, boxSizing: "border-box" }}>
        
        {/* Menu ပွင့်နေပါက ✕ ပိတ်မည် သို့မဟုတ် ပိတ်ထားလျှင် ☰ MENU (သို့) ⬅ Back ပြမည် */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          style={{ background: "#2b6cb0", color: "#fff", border: "none", padding: "12px 8px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", marginBottom: "4px", boxShadow: "-2px 2px 5px rgba(0,0,0,0.15)", textAlign: "center", width: "100%" }}
        >
          {showMenu ? "✕ ပိတ်မည်" : "⬅ Back / MENU"}
        </button>

        {/* Menu ပိတ်ထားချိန်တွင် လက်ရှိရွေးထားသော ခလုတ်ကို ပြမည် */}
        {!showMenu && (
          <button 
            style={{ background: "#38a169", color: "#fff", border: "none", padding: "12px 8px", borderRadius: "8px 0 0 8px", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%", boxShadow: "-2px 2px 5px rgba(0,0,0,0.1)" }}
          >
            {activeCategoryLabel}
          </button>
        )}

        {/* Menu ဖွင့်လိုက်ပါက ပေါ်လာမည့် စာရင်း (၉) ခု */}
        {showMenu && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", overflowY: "auto" }}>
            
            <button onClick={() => handleSelectCategory("post", "Post တင်ရန်")} style={{ background: "#38a169", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%" }}>
              1- Post တင်ရန်
            </button>
            <button onClick={() => handleSelectCategory("social_news", "Social News")} style={{ background: "#805ad5", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%" }}>
              2- Social News
            </button>
            <button onClick={() => handleSelectCategory("whatever", "တင်ချင်ရာတင်")} style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%" }}>
              3- တင်ချင်ရာတင်
            </button>
            <button onClick={() => handleSelectCategory("local_news", "ရပ်ကွက်သတင်း")} style={{ background: "#dd6b20", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%" }}>
              4- ရပ်ကွက်သတင်း
            </button>
            <button onClick={() => handleSelectCategory("feelings", "ရင်ဖွင့်ရာ")} style={{ background: "#319795", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%" }}>
              5- ရင်ဖွင့်ရာ
            </button>
            <button onClick={() => handleSelectCategory("movie", "ဇာတ်ကားအညွှန်း")} style={{ background: "#744210", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "10px", textAlign: "left", width: "100%" }}>
              6- ဇာတ်ကားအညွှန်း
            </button>
            <button onClick={() => handleSelectCategory("novel", "ဝတ္ထု ဖတ်ရန်")} style={{ background: "#d69e2e", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%" }}>
              7- ဝတ္ထု ဖတ်ရန်
            </button>
            <button onClick={() => handleSelectCategory("ads", "Ads")} style={{ background: "#1a202c", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", textAlign: "left", width: "100%" }}>
              8- Ads
            </button>
            <button onClick={() => handleSelectCategory("about", "About & Admin")} style={{ background: "#3182ce", color: "#fff", border: "none", padding: "10px 6px", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: "bold", fontSize: "10px", textAlign: "left", width: "100%" }}>
              9- About & Admin
            </button>

          </div>
        )}

      </div>

      {/* ညာဘက် Main Content Area (ဘေးမကပ်ဘဲ အပြည့်ပြရန်) */}
      <div style={{ flex: 1, padding: "15px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        
        <h1 style={{ fontSize: "22px", marginBottom: "15px", fontWeight: "bold", color: "#2d3748" }}>MM Sub App</h1>

        {/* ၁။ Post တင်ရန် ကဏ္ဍ (တစ်ခုတည်းကို အပြည့်အစုံပြမည်) */}
        {activeCategory === "post" && (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", width: "100%", boxSizing: "border-box" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Post အသစ်ဖန်တီးရန် (Points: {earnedPoints})</h3>
            
            <div style={{ background: "#fff3cd", padding: "12px", borderRadius: "6px", marginBottom: "12px", border: "1px solid #ffeeba", fontSize: "14px" }}>
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
              style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
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
              style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
            <textarea
              placeholder="အကြောင်းအရာ ရေးသားရန်..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
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

        {/* ၈။ Ads ကဏ္ဍ */}
        {activeCategory === "ads" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
            <h2>📢 Ads & Points View</h2>
            <p style={{ color: "#666", fontSize: "14px", margin: "10px 0 20px 0" }}>အောက်ပါလင့်ခ်များကို နှိပ်၍ ကြော်ငြာများကြည့်ရှုကာ အမှတ်များနှင့် ဝင်ငွေများ ရှာဖွေနိုင်ပါသည် -</p>
            <a href="https://www.profitablecpmrate.com" target="_blank" style={{ display: "block", background: "#e53e3e", color: "#fff", padding: "12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", marginBottom: "10px" }}>
              🔥 Ads ကြည့်ပြီး ငွေရှာရန် လင့်ခ် (၁)
            </a>
            <a href="https://www.profitablecpmrate.com" target="_blank" style={{ display: "block", background: "#3182ce", color: "#fff", padding: "12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
              ⭐ Ads ကြည့်ပြီး ငွေရှာရန် လင့်ခ် (၂)
            </a>
          </div>
        )}

        {/* ၉။ About & Admin ကဏ္ဍ (Recent Posts လုံးဝ မပါ၊ Telegram Name Hide ထားပြီး Admin ဆီဆက်သွယ်ရန်) */}
        {activeCategory === "about" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", lineHeight: "1.6", width: "100%", boxSizing: "border-box" }}>
            <h2>About & Admin</h2>
            <p>🌟 <b>App ၏ ရည်ရွယ်ချက်:</b> မိမိကျွမ်းကျင်ရာများ၊ စိတ်ခံစားမှုများ၊ ပျော်ရွှင်မှုများနှင့် အနားယူရင်း ကိုယ်တိုင်ဖန်တီးနိုင်ရန် ရည်ရွယ်ပါသည်။</p>
            <p>📌 <b>အသုံးပြုပုံ:</b> ဆိုရှယ်မီဒီယာပေါ်တွင် ဟော့နေသည်များကို မျှဝေရန်၊ ရင်ဖွင့်ရန်၊ သတင်းစကားပါးရန်နှင့် ဝတ္ထု/ဇာတ်ကားအညွှန်းများကို ဖတ်ရှုနိုင်ပါသည်။</p>
            <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #eee" }} />
            <p><b>ပို့စ်များကို ဖျက်လိုပါက သို့မဟုတ် အကူအညီလိုပါက Admin ထံ ဆက်သွယ်နိုင်ပါသည်:</b></p>
            <a href="https://t.me/Sayar_Soe_Thukha" target="_blank" style={{ background: "#4a5568", color: "#fff", padding: "10px 15px", borderRadius: "6px", textDecoration: "none", display: "inline-block", fontWeight: "bold", fontSize: "14px" }}>
              💬 Admin ထံ ဆက်သွယ်ရန် (Telegram)
            </a>
          </div>
        )}

        {/* ၆။ ဇာတ်ကားအညွှန်း (ကြည့်လို့သာ ရမည်) */}
        {activeCategory === "movie" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" }}>
            <h2>ဇာတ်ကားအညွှန်းများ</h2>
            <p style={{ color: "#666", fontSize: "14px", margin: "10px 0" }}>ℹ️ ဤကဏ္ဍတွင် ဇာတ်ကားများကို ဝင်ရောက်ကြည့်ရှု ဖတ်ရှုနိုင်ပါသည်။</p>
          </div>
        )}

        {/* ရွေးချယ်ထားသော Category အလိုက် Posts များကို အပြည့်အစုံ ပြသရန် */}
        {activeCategory !== "post" && activeCategory !== "ads" && activeCategory !== "about" && (
          <>
            <h2 style={{ fontSize: "18px", color: "#333", marginTop: "15px" }}>
              {activeCategoryLabel}
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
                  <div key={post.id} style={{ border: "1px solid #e0e0e0", padding: "15px", marginTop: "12px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", width: "100%", boxSizing: "border-box" }}>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "bold" }}>{post.title}</h3>
                      <span style={{ fontSize: "11px", color: "#666", background: "#f0f2f5", padding: "3px 8px", borderRadius: "10px" }}>
                        {post.views || 0} views
                      </span>
                    </div>

                    {post.image_url && (
                      <div style={{ marginTop: "10px" }}>
                        <img
                          src={post.image_url}
                          alt="Post attachment"
                          style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "6px" }}
                        />
                      </div>
                    )}

                    <p style={{ color: "#333", marginTop: "10px", lineHeight: "1.5", fontSize: "15px" }}>
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

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "13px" }}>
                      <button
                        onClick={() => toggleComments(post.id)}
                        style={{ background: "none", border: "none", color: "#555", fontWeight: "bold", cursor: "pointer", padding: 0 }}
                      >
                        💬 Comments ({post.comments?.length || 0})
                      </button>

                      <button
                        onClick={() => handleShare(post.title)}
                        style={{ background: "#edf2f7", border: "none", padding: "6px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                      >
                        🔗 Share
                      </button>
                    </div>

                    {isCommentsOpen && (
                      <div style={{ marginTop: "10px" }}>
                        {post.comments && post.comments.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                            {post.comments.map((c: any) => (
                              <div key={c.id} style={{ background: "#f8f9fa", padding: "8px 12px", borderRadius: "4px", borderLeft: "3px solid #0070f3", fontSize: "13px", color: "#333" }}>
                                {c.content}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "12px", color: "#888", margin: "4px 0" }}>No comments yet...</p>
                        )}

                        <div style={{ display: "flex", gap: "6px" }}>
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }}
                          />
                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            style={{ padding: "8px 12px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer" }}
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

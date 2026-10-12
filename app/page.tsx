"use client";

import { useState, useEffect, useRef } from "react";

// Robust Iframe/Script Banner Component (အကွက်အလွတ်မဖြစ်ဘဲ ကြော်ငြာသေချာပေါက် ပေါ်စေရန်)
function DynamicTopBanner({ adKey }: { adKey: string | number }) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = "";

    // iframe ဖန်တီး၍ Ad script ကို iframe အတွင်း တိုက်ရိုက်ထည့်သွင်းခြင်း (Rendering သေချာစေရန်)
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "60px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";
    
    bannerRef.current.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { margin: 0; padding: 0; text-align: center; background: transparent; }</style>
          </head>
          <body>
            <script src="//unfoldedtrade.com/b.XMVVsBdCGrla0lYQW/cb/teEmc9juAZ/UflykQP/Thcl1bMvDkc/wmN_jBkutuNmzTUYw/N/zMAz3PMnwK" async></script>
            <script src="https://richinfo.co/richpartners/inpage/ra_inpage.js?siteid=409679" async></script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, [adKey]);

  return (
    <div style={{ background: "#fff", padding: "6px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "15px", textAlign: "center", minHeight: "65px", overflow: "hidden" }}>
      <div ref={bannerRef} />
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("social_news");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Post Ad State (0/3)
  const [postAdCount, setPostAdCount] = useState(0);
  const [isProcessingPostAd, setIsProcessingPostAd] = useState(false);
  const [postAdCountdown, setPostAdCountdown] = useState(10);

  // Main Ads Section (0/15)
  const [adCount, setAdCount] = useState(0);
  const [isProcessingAd, setIsProcessingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(10);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockRemainingTime, setLockRemainingTime] = useState("");

  // Adult Novel Read More Logic
  const [adultReadMoreState, setAdultReadMoreState] = useState<{ [key: number]: { isUnlocked: boolean; isProcessing: boolean; countdown: number } }>({});

  const [earnedPoints, setEarnedPoints] = useState(0);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const HILLTOP_ADS_LINK = "https://plump-plastic.com/b/3DVo0QP.3/puvob/mTVbJ/ZIDF0y3iN/TgAu3FMaDFAMxWLWT-cW1XM_Dec_wzMTDcUd";

  useEffect(() => {
    const savedPoints = localStorage.getItem("mm_sub_app_points");
    setEarnedPoints(savedPoints !== null ? parseInt(savedPoints, 10) || 0 : 0);

    const savedLockUntil = localStorage.getItem("mm_sub_app_ad_lock_until");
    if (savedLockUntil) {
      const lockTime = parseInt(savedLockUntil, 10);
      if (lockTime > Date.now()) {
        setLockUntil(lockTime);
      } else {
        localStorage.removeItem("mm_sub_app_ad_lock_until");
        localStorage.removeItem("mm_sub_app_ad_count");
        setAdCount(0);
      }
    } else {
      const savedAdCount = localStorage.getItem("mm_sub_app_ad_count");
      if (savedAdCount) {
        setAdCount(parseInt(savedAdCount, 10) || 0);
      }
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    if (!lockUntil) return;
    const interval = setInterval(() => {
      const diff = lockUntil - Date.now();
      if (diff <= 0) {
        setLockUntil(null);
        setAdCount(0);
        localStorage.removeItem("mm_sub_app_ad_lock_until");
        localStorage.removeItem("mm_sub_app_ad_count");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setLockRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

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

  // View Counter Function (+1 View when clicked)
  const incrementPostView = async (postId: number, currentViews: number) => {
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementView", postId, currentViews: currentViews || 0 }),
      });
      fetchPosts();
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  const handleWatchPostAd = () => {
    if (postAdCount >= 3) return;
    setIsProcessingPostAd(true);
    setPostAdCountdown(10);
    window.open(HILLTOP_ADS_LINK, "_blank");

    const timer = setInterval(() => {
      setPostAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsProcessingPostAd(false);
          setPostAdCount((c) => c + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleWatchMainAd = () => {
    if (lockUntil || isProcessingAd || adCount >= 15) return;

    setIsProcessingAd(true);
    setAdCountdown(10);
    window.open(HILLTOP_ADS_LINK, "_blank");

    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsProcessingAd(false);
          const newCount = adCount + 1;
          setAdCount(newCount);
          localStorage.setItem("mm_sub_app_ad_count", newCount.toString());

          if (newCount >= 15) {
            const randomPts = Math.floor(Math.random() * 11) + 5;
            updatePoints(earnedPoints + randomPts);
            const fourHoursLater = Date.now() + 4 * 60 * 60 * 1000;
            setLockUntil(fourHoursLater);
            localStorage.setItem("mm_sub_app_ad_lock_until", fourHoursLater.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAdultReadMoreClick = (postId: number, currentViews: number) => {
    incrementPostView(postId, currentViews);

    setAdultReadMoreState((prev) => ({
      ...prev,
      [postId]: { isUnlocked: false, isProcessing: true, countdown: 10 },
    }));

    window.open(HILLTOP_ADS_LINK, "_blank");

    const timer = setInterval(() => {
      setAdultReadMoreState((prev) => {
        const current = prev[postId];
        if (!current) return prev;
        if (current.countdown <= 1) {
          clearInterval(timer);
          return {
            ...prev,
            [postId]: { isUnlocked: true, isProcessing: false, countdown: 0 },
          };
        }
        return {
          ...prev,
          [postId]: { ...current, countdown: current.countdown - 1 },
        };
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postAdCount < 3) return;
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
        setPostAdCount(0);
        updatePoints(earnedPoints + 1);

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchPosts();
        setActiveCategory(null);
        setActiveCategoryLabel("");
      }
    } catch (err) {
      console.error("Submit Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (catKey: string, label: string) => {
    setActiveCategory(catKey);
    setActiveCategoryLabel(label);
    setShowMenu(false);
    scrollToTopAndCollapse();
  };

  const handleBackToHome = () => {
    setActiveCategory(null);
    setActiveCategoryLabel("");
    setShowMenu(false);
    scrollToTopAndCollapse();
  };

  const scrollToTopAndCollapse = () => {
    setExpandedPosts({});
    setShowComments({});
    setAdultReadMoreState({});
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShare = (postTitle: string) => {
    if (navigator.share) {
      navigator.share({ title: postTitle, text: postTitle, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  const handleToggleExpand = (postId: number, currentViews: number) => {
    const isCurrentlyExpanded = expandedPosts[postId];
    setExpandedPosts({ [postId]: !isCurrentlyExpanded });

    if (!isCurrentlyExpanded) {
      incrementPostView(postId, currentViews);
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

  const renderFormattedContent = (text: string, isExpanded: boolean) => {
    if (!text) return "";
    const isLongText = text.length > 80;
    const rawDisplay = isExpanded || !isLongText ? text : text.substring(0, 80) + "...";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = rawDisplay.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#0070f3", textDecoration: "underline", wordBreak: "break-all" }}>
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

      {showToast && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.85)", color: "#fff", padding: "15px 30px", borderRadius: "10px", fontWeight: "bold", fontSize: "18px", zIndex: 1000, boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
          🎉 Points +1
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h1 style={{ fontSize: "22px", margin: 0, fontWeight: "bold", color: "#2d3748" }}>MM Sub App</h1>
        <div style={{ display: "flex", gap: "6px" }}>
          {activeCategory && (
            <button onClick={handleBackToHome} style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>⬅ Back</button>
          )}
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: "#2b6cb0", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>{showMenu ? "✕ ပိတ်မည်" : "☰ MENU"}</button>
        </div>
      </div>

      {/* Menu */}
      {showMenu && (
        <div style={{ position: "absolute", top: "55px", right: "10px", background: "#fff", border: "1px solid #cbd5e0", borderRadius: "8px", padding: "6px", zIndex: 100, width: "170px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <button onClick={() => handleSelectCategory("post", "Post တင်ရန်")} style={{ background: "#38a169", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>1- Post တင်ရန်</button>
          <button onClick={() => handleSelectCategory("social_news", "Social News")} style={{ background: "#805ad5", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>2- Social News</button>
          <button onClick={() => handleSelectCategory("whatever", "တင်ချင်ရာတင်")} style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>3- တင်ချင်ရာတင်</button>
          <button onClick={() => handleSelectCategory("local_news", "ရပ်ကွက်သတင်း")} style={{ background: "#dd6b20", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>4- ရပ်ကွက်သတင်း</button>
          <button onClick={() => handleSelectCategory("feelings", "ရင်ဖွင့်ရာ")} style={{ background: "#319795", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>5- ရင်ဖွင့်ရာ</button>
          <button onClick={() => handleSelectCategory("movie", "ဇာတ်ကားအညွှန်း")} style={{ background: "#744210", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>6- ဇာတ်ကားအညွှန်း</button>
          <button onClick={() => handleSelectCategory("novel", "ဝတ္ထု")} style={{ background: "#d69e2e", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>7- ဝတ္ထု</button>
          <button onClick={() => handleSelectCategory("adult_novel", "လူကြီးဝတ္ထု")} style={{ background: "#9b2c2c", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>8- လူကြီးဝတ္ထု</button>
          <button onClick={() => handleSelectCategory("ads", "Ads")} style={{ background: "#1a202c", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>9- Ads</button>
          <button onClick={() => handleSelectCategory("about", "About & Admin")} style={{ background: "#3182ce", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", textAlign: "left", cursor: "pointer" }}>10- About & Admin</button>
        </div>
      )}

      {/* Main Container */}
      <div style={{ flex: 1, width: "100%" }}>
        
        {/* Dynamic Iframe Banner (ကြော်ငြာအသေအချာ ပေါ်စေရန်) */}
        <DynamicTopBanner adKey={activeCategory || 'home'} />

        {/* Post Form */}
        {activeCategory === "post" && (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Post အသစ်ဖန်တီးရန်</h3>
            <div style={{ background: "#fff3cd", padding: "10px", borderRadius: "6px", marginBottom: "12px", border: "1px solid #ffeeba", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Ads ကြည့်ရန် တာဝန်: <b>({postAdCount}/3)</b></span>
                {postAdCount < 3 && (
                  <button type="button" onClick={handleWatchPostAd} disabled={isProcessingPostAd} style={{ background: "#ffc107", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                    {isProcessingPostAd ? `Processing (${postAdCountdown}s)...` : "Ads ကြည့်မည်"}
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" }}>
              {[
                { key: "social_news", label: "Social News" },
                { key: "whatever", label: "တင်ချင်ရာတင်" },
                { key: "local_news", label: "ရပ်ကွက်သတင်း" },
                { key: "feelings", label: "ရင်ဖွင့်ရာ" },
                { key: "movie", label: "ဇာတ်ကားအညွှန်း" },
                { key: "novel", label: "ဝတ္ထု" },
                { key: "adult_novel", label: "လူကြီးဝတ္ထု" },
              ].map((item) => (
                <button type="button" key={item.key} onClick={() => setCategory(item.key)} style={{ padding: "10px", borderRadius: "8px", border: category === item.key ? "2px solid #3182ce" : "1px solid #cbd5e0", background: category === item.key ? "#ebf8ff" : "#f7fafc", color: category === item.key ? "#2b6cb0" : "#2d3748", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>{item.label}</button>
              ))}
            </div>

            <input type="text" placeholder="ခေါင်းစဉ်" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }} />
            <textarea placeholder="အကြောင်းအရာ ရေးသားရန်..." value={content} onChange={(e) => setContent(e.target.value)} required rows={4} style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }} />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: "12px", width: "100%" }} />
            <button type="submit" disabled={loading || postAdCount < 3} style={{ width: "100%", padding: "12px", backgroundColor: postAdCount < 3 ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: postAdCount < 3 ? "not-allowed" : "pointer" }}>
              {loading ? "တင်နေသည်..." : postAdCount < 3 ? "Ads (3) ခု အရင်ကြည့်ပါ" : "Post တင်မည်"}
            </button>
          </form>
        )}

        {/* Ads Section (0/15 & 4 Hours Rotation) */}
        {activeCategory === "ads" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", textAlign: "center" }}>
            <h2 style={{ marginBottom: "10px", fontSize: "18px" }}>📢 Ads 4နာရီတစ်ကြိမ် ကြည့်ရင်း ပွိုင့်စုကြမယ်</h2>
            
            <div style={{ background: "#fffaf0", border: "1px solid #ecc94b", padding: "10px 20px", borderRadius: "8px", display: "inline-block", marginBottom: "20px", fontWeight: "bold", color: "#744210", fontSize: "16px" }}>
              💰 လက်ရှိ ရရှိထားသော Points: {earnedPoints}
            </div>

            {lockUntil ? (
              <div style={{ background: "#fff5f5", border: "1px solid #feb2b2", color: "#c53030", padding: "15px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" }}>
                🔒 Task ပြီးဆုံးသွားပါပြီ။<br />ကျေးဇူးပြု၍ <b>{lockRemainingTime}</b> ကြာပြီးမှ ပြန်လည်ကြည့်ရှုပေးပါရန်။
              </div>
            ) : (
              <div style={{ background: "#fff3cd", padding: "15px", borderRadius: "8px", border: "1px solid #ffeeba" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>Ads ကြည့်ရန်: <b>({adCount}/15)</b></span>
                  <button 
                    type="button" 
                    onClick={handleWatchMainAd} 
                    disabled={isProcessingAd || adCount >= 15} 
                    style={{ background: adCount >= 15 ? "#cbd5e0" : "#ffc107", color: adCount >= 15 ? "#718096" : "#000", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: "bold", cursor: adCount >= 15 ? "not-allowed" : "pointer" }}
                  >
                    {adCount >= 15 ? "ပြီးပါပြီ" : isProcessingAd ? `Processing (${adCountdown}s)...` : "Ads ကြည့်မည်"}
                  </button>
                </div>
                {isProcessingAd && <p style={{ color: "#856404", fontSize: "12px", margin: "5px 0 0 0", textAlign: "left" }}>⚠️ ကြော်ငြာကြည့်ရှုပြီး Back လုပ်လာပါက 10 စက္ကန့် စောင့်ဆိုင်းပေးနေပါသည်...</p>}
              </div>
            )}
          </div>
        )}

        {/* About Section */}
        {activeCategory === "about" && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", lineHeight: "1.6" }}>
            <h2 style={{ marginTop: 0 }}>About & Admin Support</h2>
            <p>🌟 <b>App ၏ ရည်ရွယ်ချက်:</b> မိမိကျွမ်းကျင်ရာများ၊ စိတ်ခံစားမှုများ၊ ပျော်ရွှင်မှုများနှင့် အနားယူရင်း ကိုယ်တိုင်ဖန်တီးနိုင်ရန် ရည်ရွယ်ပါသည်။</p>
            <p>📌 <b>အသုံးပြုပုံ:</b> ဆိုရှယ်မီဒီယာပေါ်တွင် ဟော့နေသည်များကို မျှဝေရန်၊ ရင်ဖွင့်ရန်၊ သတင်းစကားပါးရန်နှင့် ဝတ္ထု/ဇာတ်ကားအညွှန်းများကို ဖတ်ရှုနိုင်ပါသည်။</p>
            <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #eee" }} />
            <p style={{ color: "#e53e3e", fontWeight: "bold", fontSize: "14px" }}>⚠️ ပို့စ်ကို ဖျက်ချင်ပါက Admin ဆီ တိုက်ရိုက် ဆက်သွယ်ပါရန်။</p>
            <button onClick={() => window.open("https://t.me/Sayar_Soe_Thukha", "_blank", "noopener,noreferrer")} style={{ background: "#0088cc", color: "#fff", padding: "12px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
              💬 Contact Admin (Telegram)
            </button>
          </div>
        )}

        {/* Feed Posts */}
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
                const isCommentsOpen = showComments[post.id];
                const formattedDate = post.created_at ? new Date(post.created_at).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }) : "";

                const isAdultPost = post.category === "adult_novel";
                const adultState = adultReadMoreState[post.id] || { isUnlocked: false, isProcessing: false, countdown: 10 };

                return (
                  <div key={post.id} style={{ border: "1px solid #e0e0e0", padding: "12px", marginTop: "12px", borderRadius: "8px", background: "#fff" }}>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{post.title}</h3>
                      <span style={{ fontSize: "11px", color: "#666", background: "#f0f2f5", padding: "3px 8px", borderRadius: "10px" }}>{post.views || 0} views</span>
                    </div>

                    {formattedDate && <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>{formattedDate}</div>}

                    {post.image_url && (
                      <div style={{ marginTop: "8px", background: "#f8f9fa", borderRadius: "6px", overflow: "hidden", border: "1px solid #edf2f7", padding: "4px" }}>
                        <img src={post.image_url} alt="Post attachment" style={{ width: "100%", height: "auto", maxHeight: "400px", objectFit: "contain", borderRadius: "4px", display: "block", margin: "0 auto" }} />
                      </div>
                    )}

                    {/* Adult Novel Content Handling with Read More Ad Gate & +1 View */}
                    {isAdultPost ? (
                      <div style={{ marginTop: "8px" }}>
                        {adultState.isUnlocked ? (
                          <p style={{ color: "#333", lineHeight: "1.5", fontSize: "14px", whiteSpace: "pre-line", wordBreak: "break-word" }}>
                            {renderFormattedContent(post.content, true)}
                          </p>
                        ) : (
                          <div>
                            <p style={{ color: "#333", lineHeight: "1.5", fontSize: "14px" }}>
                              {post.content.length > 60 ? post.content.substring(0, 60) + "..." : post.content}
                            </p>
                            <div style={{ marginTop: "8px", background: "#fff5f5", padding: "10px", borderRadius: "6px", border: "1px solid #fed7d7" }}>
                              {adultState.isProcessing ? (
                                <p style={{ color: "#c53030", fontSize: "13px", fontWeight: "bold", margin: 0 }}>
                                  ⚠️ Processing ({adultState.countdown}s)... ဖတ်ရန် ခဏစောင့်ပါ...
                                </p>
                              ) : (
                                <button onClick={() => handleAdultReadMoreClick(post.id, post.views)} style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                                  📖 Read More (ဖတ်ရန် Ads ကြည့်မည်)
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "#333", marginTop: "8px", lineHeight: "1.5", fontSize: "14px", whiteSpace: "pre-line", wordBreak: "break-word" }}>
                        {renderFormattedContent(post.content, isExpanded)}
                        {post.content.length > 80 && (
                          <span onClick={() => handleToggleExpand(post.id, post.views)} style={{ color: "#0070f3", cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}>
                            {isExpanded ? " See less" : " See more"}
                          </span>
                        )}
                      </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "13px" }}>
                      <button onClick={() => toggleComments(post.id)} style={{ background: "none", border: "none", color: "#555", fontWeight: "bold", cursor: "pointer", padding: 0 }}>
                        💬 Comments ({post.comments?.length || 0})
                      </button>
                      <button onClick={() => handleShare(post.title)} style={{ background: "#edf2f7", border: "none", padding: "4px 10px", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                        🔗 Share
                      </button>
                    </div>

                    {/* Clean Comments Section (NO Ads inside) */}
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
                          <input type="text" placeholder="Write a comment..." value={commentInputs[post.id] || ""} onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} style={{ flex: "1", padding: "6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" }} />
                          <button onClick={() => handleCommentSubmit(post.id)} style={{ padding: "6px 10px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
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

      {/* Top Button with Full Auto-Collapse */}
      <button onClick={scrollToTopAndCollapse} style={{ position: "fixed", bottom: "20px", right: "20px", background: "#0070f3", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", zIndex: 99, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
        ▲ Top
      </button>
    </div>
  );
            }

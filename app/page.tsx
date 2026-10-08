"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
  const [expandedPostIds, setExpandedPostIds] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Upvote နဲ့ Comments ရေးလို့ရအောင် Client-side state သတ်မှတ်ပေးခြင်း
        const formattedData = data.map((p: any) => ({
          ...p,
          upvotes: p.upvotes || 0,
          comments: p.comments || [],
        }));
        setPosts(formattedData);
      }
    } catch (err) {
      console.error("Posts ဆွဲယူရာတွင် အမှားရှိပါသည်:", err);
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
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Post Feed</h1>

      {posts.map((post) => {
        const isExpanded = expandedPostIds.includes(post.id);
        const shouldTruncate = post.content && post.content.length > 120;
        const displayContent = isExpanded
          ? post.content
          : shouldTruncate
          ? `${post.content.slice(0, 120)}...`
          : post.content;

        return (
          <div key={post.id} className="border rounded-xl p-4 shadow-sm bg-white flex gap-4">
            {/* Up Arrow (Upvote) ခလုတ် */}
            <div className="flex flex-col items-center justify-start pt-1">
              <button
                onClick={() => handleUpvote(post.id)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 transition"
                title="Upvote"
              >
                ▲
              </button>
              <span className="text-sm font-semibold mt-1">{post.upvotes}</span>
            </div>

            {/* ပို့စ် အကြောင်းအရာ အပြည့်အစုံ */}
            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>

              {/* ပုံ ပြသခြင်း */}
              {post.image_url && (
                <div className="relative w-full h-64 my-2 rounded-lg overflow-hidden border">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // ပုံမတက်ပါက Alt Text သို့မဟုတ် fallback ပြရန်
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* စာကြောင်း အနည်းငယ် + See More */}
              <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                {displayContent}
                {shouldTruncate && (
                  <button
                    onClick={() => toggleExpand(post.id)}
                    className="ml-2 text-blue-600 font-medium hover:underline inline-block"
                  >
                    {isExpanded ? "See less" : "See more"}
                  </button>
                )}
              </p>

              {/* Comments အပိုင်း */}
              <div className="mt-4 pt-3 border-t space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Comments</h3>

                {/* Comment ရေးရန် input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Send
                  </button>
                </div>

                {/* Comment များကို လစ်စထုတ်ပြခြင်း */}
                <div className="space-y-2 mt-2">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-2 rounded-lg text-xs">
                        <span className="font-semibold text-gray-800">{comment.text}</span>
                        <span className="text-gray-400 text-[10px] ml-2">{comment.createdAt}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No comments yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

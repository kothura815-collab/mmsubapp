import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseClient";

// Post များ နှင့် Comments များကို ဆွဲယူရန် API
export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*,comments(*)&order=id.desc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Upvote, View, Comment, Post သစ်များအတွက် API
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();

      // 1. Upvote တိုးခြင်း
      if (body.action === "upvote") {
        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${body.postId}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ upvotes: (body.currentUpvotes || 0) + 1 }),
        });
        return NextResponse.json({ success: updateRes.ok });
      }

      // 2. View Count တိုးခြင်း
      if (body.action === "incrementView") {
        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${body.postId}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ views: (body.currentViews || 100) + 1 }),
        });
        return NextResponse.json({ success: updateRes.ok });
      }

      // 3. Comment တင်ခြင်း
      if (body.action === "comment") {
        const commentRes = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: body.postId,
            content: body.content,
          }),
        });
        return NextResponse.json({ success: commentRes.ok });
      }
    }

    // Post အသစ် တင်ခြင်း
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    let imageUrl = "";

    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();

      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/posts/${fileName}`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": file.type || "image/jpeg",
          "x-upsert": "true",
        },
        body: Buffer.from(arrayBuffer),
      });

      if (uploadRes.ok) {
        imageUrl = `${SUPABASE_URL}/storage/v1/object/public/posts/${fileName}`;
      }
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        title,
        content,
        image_url: imageUrl || null,
        upvotes: 0,
        views: 100,
      }),
    });

    const resultData = await insertRes.json();
    return NextResponse.json({ success: insertRes.ok, data: resultData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
      }

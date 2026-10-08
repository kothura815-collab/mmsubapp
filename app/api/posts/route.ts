import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseClient";

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

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();

      // Upvote တိုးခြင်း
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

      // View တိုးခြင်း
      if (body.action === "incrementView") {
        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${body.postId}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ views: (body.currentViews || 0) + 1 }),
        });
        return NextResponse.json({ success: updateRes.ok });
      }

      // Comment တင်ခြင်း
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
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // ပုံသေချာပေါ်စေရန် Base64 format သို့ တိုက်ရိုက်ပြောင်းပေးခြင်း
      const base64Image = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      imageUrl = `data:${mimeType};base64,${base64Image}`;
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
        views: 0,
      }),
    });

    const resultData = await insertRes.json();
    return NextResponse.json({ success: insertRes.ok, data: resultData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

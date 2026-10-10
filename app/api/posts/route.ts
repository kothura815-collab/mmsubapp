import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseClient";

export const revalidate = 0; // Disable slow caching, enforce instant responses

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?select=id,title,content,category,image_url,views,created_at,comments(id,content)&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: "no-store",
      }
    );

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

      if (body.action === "comment") {
        if (!body.content || !body.content.trim()) {
          return NextResponse.json({ error: "Empty comment" }, { status: 400 });
        }
        const commentRes = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: body.postId,
            content: body.content.trim(),
          }),
        });
        return NextResponse.json({ success: commentRes.ok });
      }
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = (formData.get("category") as string) || "social_news";
    const file = formData.get("file") as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    let imageUrl = "";
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File size too large" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
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
        title: title.trim(),
        content: content.trim(),
        category,
        image_url: imageUrl || null,
        views: 0,
      }),
    });

    const resultData = await insertRes.json();
    return NextResponse.json({ success: insertRes.ok, data: resultData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

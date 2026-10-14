import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const IMGBB_API_KEY = "1b6579975db16e1eccd6d664ef32ec9d";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
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
        const { postId, currentViews } = body;
        const { error } = await supabase
          .from("posts")
          .update({ views: (currentViews || 0) + 1 })
          .eq("id", postId);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true }, { status: 200 });
      }

      if (body.action === "comment") {
        const { postId, content } = body;
        const { data: postData, error: fetchError } = await supabase
          .from("posts")
          .select("comments")
          .eq("id", postId)
          .single();

        if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

        const existingComments = Array.isArray(postData.comments) ? postData.comments : [];
        const newComment = { id: Date.now(), content };
        const updatedComments = [...existingComments, newComment];

        const { error: updateError } = await supabase
          .from("posts")
          .update({ comments: updatedComments })
          .eq("id", postId);

        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File | null;

    let imageUrl = null;

    if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");

        const imgbbFormData = new URLSearchParams();
        imgbbFormData.append("key", IMGBB_API_KEY);
        imgbbFormData.append("image", base64Image);

        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload`, {
          method: "POST",
          body: imgbbFormData,
        });

        const imgbbData = await imgbbRes.json();
        if (imgbbData && imgbbData.success) {
          imageUrl = imgbbData.data.url;
        }
      } catch (imgErr) {
        console.error("ImgBB Upload Exception:", imgErr);
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([{ 
        title: title || "", 
        content: content || "", 
        category: category || "General", 
        image_url: imageUrl, 
        views: 0, 
        comments: [] 
      }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

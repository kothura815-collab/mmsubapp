import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseClient";

// Post များ ဆွဲယူရန် API
export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*&order=id.desc`, {
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

// Post အသစ် တင်ရန် API
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    let imageUrl = "";

    // ၁။ ဓာတ်ပုံပါပါက Upload လုပ်မည်
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
        // မှန်ကန်သော Supabase Storage Public URL လမ်းကြောင်း
        imageUrl = `${SUPABASE_URL}/storage/object/public/posts/${fileName}`;
      } else {
        const uploadErr = await uploadRes.json();
        console.error("Upload error details:", uploadErr);
      }
    }

    // ၂။ Database ထဲသို့ Post ထည့်မည်
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
      }),
    });

    const resultData = await insertRes.json();

    if (!insertRes.ok) {
      return NextResponse.json(
        { error: resultData.message || resultData.error || JSON.stringify(resultData) },
        { status: insertRes.status }
      );
    }

    return NextResponse.json({ success: true, data: resultData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

// Post ဖျက်ရန် (DELETE API)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID မရှိပါ" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json();
      return NextResponse.json({ error: errData.message || "Delete မရပါ" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

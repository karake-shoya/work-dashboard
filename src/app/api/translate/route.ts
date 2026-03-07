import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPL_API_KEY is not configured" }, { status: 500 });
  }

  const { text, targetLang } = await req.json();
  if (!text || !targetLang) {
    return NextResponse.json({ error: "text and targetLang are required" }, { status: 400 });
  }

  const url = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const params = new URLSearchParams();
  params.append("text", text);
  params.append("target_lang", targetLang);

  const response = await fetch(url, {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `DeepL-Auth-Key ${apiKey}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: `DeepL API error: ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json({ translatedText: data.translations?.[0]?.text ?? "" });
}

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(request: NextRequest) {
  
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");

    const pajUrl = pathSegments[3]; // ✅ Gets `[projectId]


  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/detect-pagination`, { pajUrl });
      NextResponse.json(response.data);
    } catch (error) {
      console.error("Pagination detection failed:", error);
      NextResponse.json({ error: "Could not detect pagination method automatically." }, { status: 500 });
    }
  }
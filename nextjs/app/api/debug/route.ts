import { DATABASE_URL } from "@/lib/config";
import { NextResponse } from "next/server";;
import { DGO_DATABASE, DGO_HOST, DGO_PASSWORD, DGO_PORT, DGO_USER,  } from "@/lib/config";



export async function GET() {
  // dotenv.config();
  // console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);
  console.log("test", DATABASE_URL)
  console.log(DGO_DATABASE, DGO_HOST, DGO_PASSWORD, DGO_PORT, DGO_USER)
  return NextResponse.json({ message: "API is working!" });
}
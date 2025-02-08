import { db } from "@/drizzleconfig";
import { users } from "@/server/db/schema/users";
import { NextResponse } from "next/server";

export async function GET() {
    console.log("Recieving Get Request")
  try {
    const result = await db.select().from(users); // ✅ Fetch users
    console.log(result)
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
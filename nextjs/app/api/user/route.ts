
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        return NextResponse.json({ userId: userId || "anonymous" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ userId: "anonymous" });
    }
}
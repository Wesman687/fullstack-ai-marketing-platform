import { db } from "@/server";


export default async function handler(req, res) {
  try {
    const database = await db();
    const [result] = await database.execute("SELECT NOW() AS current_time");

    console.log("✅ DB Query Result:", result);
    res.status(200).json({ success: true, time: result });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

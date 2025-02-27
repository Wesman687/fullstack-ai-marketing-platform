import { NextApiRequest, NextApiResponse } from "next";
import {  dbSecondary } from "@/server/db";
import { scrapedRequestsTable } from "@/server/db/schema/db2schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const database = await dbSecondary()
    try {
        const { userId, url, selectors, name } = req.body;
        if (!userId || !url || !selectors || !name) {
            return res.status(400).json({ error: "Invalid fields" });
        }
        const id = crypto.randomUUID();
        await database.drizzle.insert(scrapedRequestsTable).values({ 
            id, 
            url,
            userId,
            selectors,
            name,
            status: "pending",
        });

        res.status(200).json({ success: true, message: "Data saved successfully!" });
    } catch (error) {
        console.error("❌ Error saving scraped data:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        database.release();
    }
}

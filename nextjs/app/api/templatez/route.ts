import { getTemplatesForUser } from "@/server/db/queries";
import { createTemplate } from "@/server/mutation";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const templates = await getTemplatesForUser();
        return NextResponse.json(templates, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching templates:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    
    const formData = await request.formData();

    try {
        const template = await createTemplate(formData);
        return NextResponse.json({templateId:template.newTemplateId}, { status: 200 });
    } catch (error) {
        console.error("❌ Error creating template:", error);
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }
}   
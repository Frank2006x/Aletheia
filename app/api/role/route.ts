import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/db";
import { investors, suppliers } from "@/core/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// POST /api/role — register role after sign-in
// Body: { role: "investor" | "supplier" }
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const role = body.role as "investor" | "supplier";

        if (role !== "investor" && role !== "supplier") {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const email = session.user.email;
        const name = session.user.name ?? email;

        if (role === "investor") {
            // Upsert into investors table (email is unique)
            await db
                .insert(investors)
                .values({ email })
                .onConflictDoNothing({ target: investors.email });
        } else {
            // Upsert into suppliers table (email is unique)
            await db
                .insert(suppliers)
                .values({ name, email })
                .onConflictDoNothing({ target: suppliers.email });
        }

        return NextResponse.json({ success: true, role });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to set role" },
            { status: 500 }
        );
    }
}

// GET /api/role — look up current user's role from DB
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        const [investor] = await db
            .select()
            .from(investors)
            .where(eq(investors.email, email));

        if (investor) {
            return NextResponse.json({ success: true, role: "investor" });
        }

        const [supplier] = await db
            .select()
            .from(suppliers)
            .where(eq(suppliers.email, email));

        if (supplier) {
            return NextResponse.json({ success: true, role: "supplier" });
        }

        // Not yet registered
        return NextResponse.json({ success: true, role: null });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get role" },
            { status: 500 }
        );
    }
}

import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
    const id = ctx.params.id;

    // Ürünü ID ile bul → slug'ı getir
    const {data, error} = await supabase
        .from("products")
        .select("slug")
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json({ok: false, message: "Product not found"}, {status: 404});
    }

    // /products/[slug] sayfasına yönlendir
    const target = `/products/${encodeURIComponent(data.slug)}`;

    return NextResponse.redirect(new URL(target, req.url), 302);
}

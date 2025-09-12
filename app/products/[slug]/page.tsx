// app/products/[slug]/page.tsx
import React from "react";
import type {Metadata} from "next";
import Link from "next/link";
import {supabaseServer} from "@/src/lib/supabaseServer";

import ProductGalleryLoader from "@/src/components/ProductGalleryLoader";
import LikeButton from "@/src/components/LikeButton";
import TrackView from "@/src/components/TrackView";
import ShareMenu from "@/src/components/ShareMenu";
import RelatedCarousel from "@/src/components/product/RelatedCarousel";

export async function generateMetadata({params}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const {slug} = await params;
  const supabase = await supabaseServer();

  const {data: bySlug} = await supabase.from("products").select("*").eq("slug", slug).single();
  const fallback = bySlug ? null : await supabase.from("products").select("*").eq("id", slug).single();
  const data: any = bySlug || fallback?.data || null;

  const title = (data?.seo_title as string) || (data?.name ? `${data.name} | Nut Things` : "Ürün | Nut Things");
  const description = (data?.seo_desc as string) || (data?.description as string) || "Lokum, kuruyemiş ve geleneksel lezzetler.";
  const image = (data?.image_url as string) || "/og-default.png";

  return {
    title,
    description,
    openGraph: {title, description, images: [image], type: "website"},
    alternates: {canonical: `/products/${slug}`},
  };
}

export default async function ProductPage({params}: { params: Promise<{ slug: string }> }) {
  const {slug} = await params;
  const supabase = await supabaseServer();

  const {data: bySlug} = await supabase.from("products").select("*").eq("slug", slug).single();
  const fallback = bySlug ? null : await supabase.from("products").select("*").eq("id", slug).single();
  const product: any = bySlug || fallback?.data || null;

  if (!product) {
    return (
      <div className="container-tight my-10">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <p className="text-neutral-600 mt-2">The product you are looking for is not available or may have been
          removed.</p>
      </div>
    );
  }

  // Likes (best-effort)
  let likes = 0;
  try {
    const {data: stat} = await supabase.from("product_stats").select("likes").eq("product_id", product.id).single();
    likes = Number(stat?.likes || 0);
  } catch {
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image_url].filter(Boolean),
    description: product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.price ?? undefined,
      availability: "https://schema.org/InStock"
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>

      <nav className="text-sm text-neutral-600 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:underline">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-800">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-5 gap-8">
        <section className="md:col-span-3">
          <ProductGalleryLoader
            productId={product.id}
            mainUrl={product.image_url as string}
            mainAlt={(product.image_alt as string) || product.name}
            debug
          />
        </section>

        <aside className="md:col-span-2 space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold">{product.name}</h1>

          {typeof product.price === "number" && (
            <div className="text-2xl md:text-3xl font-semibold">
              {product.price} <span className="text-base font-normal text-neutral-600">€</span>
            </div>
          )}

          {product.description && (
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{product.description}</p>
          )}

          {product.important_html && (
            <details className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 open:shadow-sm">
              <summary className="cursor-pointer select-none font-medium text-amber-900">Important info</summary>
              <div
                className="prose prose-sm mt-3 text-amber-900 max-w-none [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal"
                dangerouslySetInnerHTML={{__html: product.important_html as string}}/>
            </details>
          )}

          <div className="flex items-center gap-3 pt-2">
            <LikeButton productId={product.id} initialLikes={likes}/>
            <ShareMenu url={`https://nut-things.com/products/${product.slug || slug}`} productTitle={product.name}
                       label="Share"/>
          </div>
        </aside>
      </div>

      <div className="mt-12 container-tight">
        <RelatedCarousel seedSlug={product.slug ?? slug}/>
      </div>

      <TrackView id={product.id} slug={product.slug || slug}/>
    </div>
  );
}

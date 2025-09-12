// app/products/[slug]/page.tsx
import React from "react";
import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {headers, cookies} from "next/headers";
import {supabaseServer} from "@/src/lib/supabaseServer";

// — Sende zaten var: aynıları kullanıyoruz
import ProductGallery from "@/src/components/ProductGallery";
// import ProductCard from "@/src/components/ProductCard"; // KALDIRILDI
import LikeButton from "@/src/components/LikeButton";
import TrackView from "@/src/components/TrackView";
// import ShareButtons from "@/src/components/ShareButtons"; // KALDIRILDI
import ShareMenu from "@/src/components/ShareMenu"; // YENİ: tek buton + renkli ikon menü
import RelatedCarousel from "@/src/components/product/RelatedCarousel"; // YENİ: benzer ürünler carousel

// SSR i18n (cookie -> messages)
function t(ns: any, key: string, fallback?: string) {
  const v = ns?.[key];
  return typeof v === "string" ? v : (fallback ?? key);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { slug: string };

/* ──────────────────────────────────────────────────────────────
   SEO / Metadata  (senin projendeki mantığınla aynı)
   - slug -> ürün
   - yoksa id fallback
   - seo_title / seo_desc / image_url
──────────────────────────────────────────────────────────────── */
export async function generateMetadata(
  {params}: { params: Promise<Params> }
): Promise<Metadata> {
  const {slug} = await params;
  const supabase = supabaseServer();

  const {data: bySlug} = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  const fallback = bySlug
    ? null
    : await supabase.from("products").select("*").eq("id", slug).single();

  const data = bySlug || fallback?.data || null;

  const title =
    (data?.seo_title as string) ||
    (data?.name ? `${data.name} | Nut Things` : "Ürün | Nut Things");

  const description =
    (data?.seo_desc as string) ||
    (data?.description as string) ||
    "Lokum, kuruyemiş ve geleneksel lezzetler.";

  const image = (data?.image_url as string) || "/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      // Next 15’te 'product' OG type yok → 'website' kullan
      type: "website",
    },
    alternates: {
      canonical: data?.slug ? `/products/${data.slug}` : undefined,
    },
  };
}

/* ──────────────────────────────────────────────────────────────
   Sayfa
──────────────────────────────────────────────────────────────── */
export default async function ProductPage({
                                            params,
                                          }: {
  params: Promise<Params>; // Next 15: asenkron!
}) {
  const {slug} = await params;
  const supabase = supabaseServer();

  // i18n yükle
  const jar = await cookies();
  const locale = (jar.get("lang")?.value as "de" | "tr" | "en") ?? "de";
  const messages = (await import(`../../../messages/${locale}.json`)).default as any;

  // URL (hydration güvenli)
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const pageUrl = `${proto}://${host}/products/${slug}`;

  // Ürün (slug → id fallback)
  const {data: bySlug} = await supabase.from("products").select("*").eq("slug", slug).single();
  const fallback = bySlug ? null : await supabase.from("products").select("*").eq("id", slug).single();
  const product = bySlug || fallback?.data || null;

  if (!product) {
    return (
      <div className="container-tight my-10">
        <h1 className="text-xl font-semibold">
          {t(messages.common, "ürün_bulunamadı", "Product not found")}
        </h1>
        <p className="text-neutral-600 mt-2">
          {t(
            messages.common,
            "aradığınız_ürün_mevcut_değil_veya_kaldırılmış_olabilir",
            "The product you are looking for is not available or may have been removed."
          )}
        </p>
      </div>
    );
  }

  // Ürün görselleri (senin projendeki tablo/adlar)
  const {data: images} = await supabase
    .from("product_images")
    .select("id,image_url")
    .eq("product_id", product.id)
    .order("position", {ascending: true});

  // Likes (senin projendeki product_stats)
  let likes = 0;
  try {
    const {data: stat} = await supabase
      .from("product_stats")
      .select("likes")
      .eq("product_id", product.id)
      .single();
    likes = Number(stat?.likes || 0);
  } catch {
    likes = 0;
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [
      product.image_url,
      ...(images || []).map((i: any) => i.image_url).filter(Boolean),
    ].filter(Boolean),
    description: product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.price ?? undefined,
      availability: "https://schema.org/InStock",
    },
  };

  // Görsel güvenliği (next/image için remotePatterns ayarlı olmalı)
  const mainImage = (product.image_url as string) || null;
  const galleryItems =
    (images || []).map((i: any) => ({id: i.id, image_url: i.image_url, alt: product.name})) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-600 mb-6">
        <Link href="/" className="hover:underline">
          {t(messages.common, "ana_sayfa", "Home")}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:underline">
          {t(messages.common, "ürünler", "Products")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-800">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Sol: Galeri (senin ProductGallery’n) */}
        <section className="md:col-span-3">
          <ProductGallery
            mainUrl={mainImage}
            mainAlt={(product.image_alt as string) || product.name}
            images={galleryItems}
          />
        </section>

        {/* Sağ: Bilgi/CTA (sticky) */}
        <aside className="md:col-span-2 md:sticky md:top-20 h-fit space-y-5">
          {/* Başlık + Rozetler */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold leading-snug">{product.name}</h1>
            <div className="flex items-center gap-2">
              {product.is_featured && (
                <span
                  className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-medium">
                  {t(messages.common, "öne_çıkan", "Featured")}
                </span>
              )}
              {likes > 0 && (
                <span
                  className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2.5 py-1 text-xs font-medium">
                  {likes} {t(messages.common, "beğeni_8291", "Likes")}
                </span>
              )}
            </div>
          </div>

          {/* Fiyat */}
          {typeof product.price === "number" && (
            <div className="text-2xl md:text-3xl font-semibold">
              {product.price} <span className="text-base font-normal text-neutral-600">€</span>
            </div>
          )}

          {/* Açıklama */}
          {product.description && (
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* ÖNEMLİ BİLGİ — native details/summary (senin projendeki gibi) */}
          {product.important_html && (
            <details className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 open:shadow-sm">
              <summary className="cursor-pointer select-none font-medium text-amber-900">
                {t(messages.common, "önemli_bilgi", "Important info")}
              </summary>
              <div
                className="prose prose-sm mt-3 text-amber-900 max-w-none [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal"
                dangerouslySetInnerHTML={{__html: product.important_html as string}}
              />
            </details>
          )}

          {/* CTA + Metrikler */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-black text-white hover:bg-black/90 transition focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label={t(messages.common, "sepete_ekle", "Add to cart")}
            >
              {t(messages.common, "sepete_ekle", "Add to cart")}
            </button>

            {/* Like & View (senin Client bileşenlerin) */}
            <LikeButton productId={product.id} initialLikes={likes}/>
            <TrackView productId={product.id}/>
          </div>

          {/* Paylaşım — tek buton + renkli ikon menüsü */}
          <div className="pt-1">
            {/* ShareMenu, URL'yi kendisi window.location'dan alır;
               istersen buradaki pageUrl’i prop olarak da genişletebilirim */}
            <ShareMenu
              productTitle={product.name}
              label={t(messages.common, "paylaş", "Share")}
            />
          </div>
        </aside>
      </div>

      {/* Benzer Ürünler – oklar + otomatik kaydırma + ortalı başlık (i18n içeriden) */}
      <div className="mt-12 container-tight">
        <RelatedCarousel seedSlug={product.slug ?? slug}/>
      </div>
    </div>
  );
}

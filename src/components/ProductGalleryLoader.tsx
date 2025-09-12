"use client";

import {useEffect, useState} from "react";
import {supabase} from "@/src/lib/supabaseClient";
import ProductGallery from "@/src/components/ProductGallery";

type Img = { id?: string | number; image_url: string; alt?: string };

export default function ProductGalleryLoader({
                                               productId,
                                               mainUrl,
                                               mainAlt,
                                               debug = true, // küçük teşhis satırı
                                             }: {
  productId: string;
  mainUrl?: string | null;
  mainAlt?: string | null;
  debug?: boolean;
}) {
  const [images, setImages] = useState<Img[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = false;

    async function run() {
      try {
        setError(null);

        // SADE: sadece mevcut kolonları oku (url, image_alt, position)
        const {data, error} = await supabase
          .from("product_images")
          .select("id,url,image_alt,position")
          .eq("product_id", productId)
          .order("position", {ascending: true});

        if (error) {
          if (!done) setError(error.message);
          return;
        }

        const arr =
          (data || []).map((i: any) => ({
            id: i.id,
            image_url: i.url as string,     // << url -> image_url map
            alt: i.image_alt as string | null,
          })) || [];

        if (!done) setImages(arr.filter((x) => !!x.image_url));
      } catch (e: any) {
        if (!done) setError(e?.message || String(e));
      }
    }

    run();
    return () => {
      done = true;
    };
  }, [productId]);

  return (
    <div>
      {debug && (
        <div className="mb-2 text-xs text-neutral-500">
          gallery: images=<b>{images.length}</b>
          {error ? ` — error: ${error}` : ""}
        </div>
      )}
      <ProductGallery
        mainUrl={mainUrl || null}
        mainAlt={mainAlt || null}
        images={images}
      />
    </div>
  );
}
  
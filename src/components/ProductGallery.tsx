"use client";

import {useState, useMemo, useRef, useEffect} from "react";

type Img = { id?: string | number; image_url: string; alt?: string };

export default function ProductGallery({
                                           mainUrl,
                                           mainAlt,
                                           images = [],
                                       }: {
    mainUrl?: string | null;
    mainAlt?: string | null;
    images?: Img[] | null;
}) {
    const list = useMemo<Img[]>(
        () =>
            [
                ...(mainUrl ? [{id: "main", image_url: mainUrl, alt: mainAlt || undefined}] : []),
                ...((images || []).filter((i) => !!i?.image_url) as Img[]),
            ].slice(0, 10),
        [mainUrl, mainAlt, images]
    );

    const [active, setActive] = useState(0);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    // klavye ile gezinme
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") setActive((i) => Math.min(i + 1, list.length - 1));
            if (e.key === "ArrowLeft") setActive((i) => Math.max(i - 1, 0));
        };
        el.addEventListener("keydown", onKey);
        return () => el.removeEventListener("keydown", onKey);
    }, [list.length]);

    if (!list.length) {
        return (
            <div className="rounded-xl overflow-hidden bg-neutral-100 aspect-[4/3]" aria-label="Ürün görseli yok"/>
        );
    }

    return (
        <div ref={wrapRef} tabIndex={0} className="outline-none">
            <div className="rounded-2xl overflow-hidden border border-neutral-200">
                {/* Ana görsel */}
                <img
                    src={list[active].image_url}
                    alt={list[active].alt || "Ürün görseli"}
                    className="w-full object-cover aspect-[4/3] md:aspect-[5/4] hover:scale-[1.01] transition-transform"
                    loading="eager"
                    decoding="async"
                />
            </div>

            {/* Thumbnail çubuğu */}
            {list.length > 1 && (
                <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {list.map((i, idx) => (
                        <button
                            key={(i.id ?? idx).toString()}
                            type="button"
                            onClick={() => setActive(idx)}
                            aria-label={`Görsel ${idx + 1}`}
                            className={`rounded-xl overflow-hidden border ${idx === active ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}
                        >
                            <img
                                src={i.image_url}
                                alt={i.alt || "Ürün küçük görsel"}
                                className="w-full aspect-square object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

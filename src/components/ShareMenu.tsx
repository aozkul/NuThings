"use client";

import {useCallback, useMemo, useState} from "react";

type Props = {
    /** Paylaşılacak URL (tercih edilen) */
    url?: string;
    /** Eski projeler için geriye dönük uyumluluk */
    href?: string;
    /** Paylaşım başlığı (opsiyonel) */
    productTitle?: string;
    /** Buton etiketi (varsayılan: "Share") */
    label?: string;
    className?: string;
};

export default function ShareMenu({
                                      url,
                                      href,
                                      productTitle,
                                      label = "Share",
                                      className,
                                  }: Props) {
    // SSR'da window yok; client'ta yoksa sayfa URL'sini kullan
    const fallbackUrl =
        typeof window !== "undefined" ? window.location.href : undefined;

    const shareUrl = useMemo(() => url ?? href ?? fallbackUrl ?? "", [url, href, fallbackUrl]);

    const [copied, setCopied] = useState(false);

    const onNativeShare = useCallback(async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    url: shareUrl,
                    title: productTitle || document.title,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }
        } catch {
            /* yoksay */
        }
    }, [shareUrl, productTitle]);

    const onCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* yoksay */
        }
    }, [shareUrl]);

    const tw = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
    )}&text=${encodeURIComponent(productTitle || "")}`;
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
    )}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(
        `${productTitle || ""} ${shareUrl}`.trim()
    )}`;

    return (
        <div className={className}>
            <div className="inline-flex items-center gap-2">
                <button
                    type="button"
                    onClick={onNativeShare}
                    className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50"
                    aria-label="Share"
                    title="Share"
                >
                    {label}
                </button>

                {/* basit menü linkleri */}
                <a
                    href={tw}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50"
                    aria-label="Share on X"
                    title="Share on X"
                >
                    X
                </a>
                <a
                    href={fb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50"
                    aria-label="Share on Facebook"
                    title="Share on Facebook"
                >
                    FB
                </a>
                <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50"
                    aria-label="Share on WhatsApp"
                    title="Share on WhatsApp"
                >
                    WA
                </a>

                <button
                    type="button"
                    onClick={onCopy}
                    className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50"
                    aria-label="Copy link"
                    title="Copy link"
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
        </div>
    );
}
  
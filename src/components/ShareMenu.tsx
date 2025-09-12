// src/components/ShareMenu.tsx
"use client";

import React from "react";

type Props = {
    url: string;
    productTitle?: string;
    label?: string;
    /** 'native' => sadece Web Share API */
    mode?: "native";
    className?: string;
};

export default function ShareMenu({
                                      url,
                                      productTitle = "NuThings",
                                      label = "Paylaş",
                                      mode = "native",
                                      className = "",
                                  }: Props) {
    const onShare = async () => {
        try {
            if (typeof navigator !== "undefined" && (navigator as any).share) {
                await (navigator as any).share({
                    title: productTitle,
                    url,
                    text: productTitle,
                });
            } else {
                // Masaüstü fallback (opsiyonel): e-posta aç
                const mail = `mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(url)}`;
                window.open(mail, "_blank");
            }
        } catch {
            // kullanıcı iptal etti vs.
        }
    };

    // Sadece tek buton (X/FB/WA/Copy yok)
    return (
        <button
            type="button"
            onClick={onShare}
            className={
                "inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] " +
                className
            }
            aria-label={label}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" x2="12" y1="2" y2="15"/>
            </svg>
            {label}
        </button>
    );
}

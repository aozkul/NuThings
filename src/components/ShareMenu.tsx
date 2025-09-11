"use client";

import {useEffect, useMemo, useState} from "react";

/** Basit renkli ikonlar (inline SVG) */
function IconFacebook({className = ""}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="#1877F2"
                  d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.436H7.078v-3.49h3.047V9.413c0-3.016 1.792-4.685 4.533-4.685 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.49 0-1.953.927-1.953 1.878v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            <path fill="#FFF"
                  d="M16.03 15.563l.532-3.49h-3.328v-2.25c0-.95.463-1.878 1.953-1.878h1.513v-2.97s-1.373-.235-2.686-.235c-2.741 0-4.533 1.669-4.533 4.685v2.662H7.078v3.49h3.047V24h3.109v-8.437h2.796z"/>
        </svg>
    );
}

function IconX({className = ""}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="#000000" d="M0 0h24v24H0z"/>
            <path fill="#FFFFFF"
                  d="M17.53 3H20l-5.41 6.19L21 21h-5.66l-4.24-5.6L5.9 21H3.43l5.78-6.61L3 3h5.81l3.86 5.17L17.53 3zm-1 16.5h1.52L8.59 4.5H7.01l9.52 15z"/>
        </svg>
    );
}

function IconInstagram({className = ""}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <linearGradient id="ig" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F58529"/>
                <stop offset="50%" stopColor="#DD2A7B"/>
                <stop offset="100%" stopColor="#515BD4"/>
            </linearGradient>
            <path fill="url(#ig)"
                  d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.4.4.6.2 1 .4 1.5.8.5.4.9.9 1.2 1.5.3.5.5 1 .6 1.6.1.5.2 1.3.2 2.5.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.4-.2.6-.4 1-0.8 1.5-.4.5-.9.9-1.5 1.2-.5.3-1 .5-1.6.6-.5.1-1.3.2-2.5.2-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.4-.4-.6-.2-1-.4-1.5-.8-.5-.4-.9-.9-1.2-1.5-.3-.5-.5-1-.6-1.6C2.3 18 2.2 17.2 2.2 16c-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.4.2-.6.4-1 .8-1.5.4-.5.9-.9 1.5-1.2.5-.3 1-.5 1.6-.6C7.1 2.2 7.9 2.1 9.1 2.1 10.4 2 10.8 2 14 2s3.6 0 4.9.1z"/>
            <path fill="#fff"
                  d="M12 6.8A5.2 5.2 0 1 0 12 17.2 5.2 5.2 0 0 0 12 6.8m0-2.3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zm6.4-1.1a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z"/>
        </svg>
    );
}

function IconShare({className = ""}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path
                d="M18 8a3 3 0 1 0-2.83-4h-.01L8.91 7.09a3.01 3.01 0 0 0 0 3.82l6.25 3.18A3 3 0 1 0 16 17a2.98 2.98 0 0 0-.66.08l-6.25-3.18a3 3 0 1 0 0-3.8l6.25-3.18c.21.05.43.08.66.08z"/>
        </svg>
    );
}

type Props = {
    productTitle: string;
    /** i18n’den gelen “Paylaş / Share / Teilen” metni */
    label?: string;
};

export default function ShareMenu({productTitle, label = "Paylaş"}: Props) {
    const [open, setOpen] = useState(false);
    const [pageUrl, setPageUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setPageUrl(window.location.href);
        }
    }, []);

    const encoded = useMemo(() => ({
        url: encodeURIComponent(pageUrl || ""),
        text: encodeURIComponent(productTitle || ""),
    }), [pageUrl, productTitle]);

    async function handleNativeShare() {
        if (typeof navigator !== "undefined" && (navigator as any).share) {
            try {
                await (navigator as any).share({title: productTitle, url: pageUrl});
                setOpen(false);
            } catch {
                /* kullanıcı iptal ederse sessiz geç */
            }
        } else {
            setOpen((v) => !v);
        }
    }

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(pageUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* kopyalama başarısız olabilir */
        }
    }

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] transition"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={label}
            >
                <IconShare className="h-4 w-4"/>
                {label}
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg"
                >
                    <a
                        role="menuitem"
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-neutral-50"
                        onClick={() => setOpen(false)}
                    >
                        <span className="h-5 w-5"><IconFacebook/></span>
                        <span className="text-sm font-medium">Facebook’ta paylaş</span>
                    </a>

                    <a
                        role="menuitem"
                        href={`https://twitter.com/intent/tweet?url=${encoded.url}&text=${encoded.text}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-neutral-50"
                        onClick={() => setOpen(false)}
                    >
                        <span className="h-5 w-5"><IconX/></span>
                        <span className="text-sm font-medium">X (Twitter)’da paylaş</span>
                    </a>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={copyLink}
                        className="w-full text-left flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-neutral-50"
                    >
                        <span className="h-5 w-5"><IconInstagram/></span>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Instagram için bağlantıyı kopyala</span>
                            <span className="text-[11px] text-neutral-500">Instagram web paylaşımı desteklemez</span>
                        </div>
                    </button>

                    <div className="my-1 border-t border-neutral-200"/>

                    <button
                        type="button"
                        onClick={copyLink}
                        className="w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-neutral-50"
                    >
                        {copied ? "Bağlantı kopyalandı ✓" : "Bağlantıyı kopyala"}
                    </button>
                </div>
            )}

            {open && (
                <button
                    aria-hidden
                    tabIndex={-1}
                    className="fixed inset-0 z-20 cursor-default bg-transparent"
                    onClick={() => setOpen(false)}
                />
            )}
        </div>
    );
}

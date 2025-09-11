"use client";
import { useEffect, useMemo } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export default function TrackView({ productId }: { productId: string }) {
  const storageKey = useMemo(() => `viewed:${productId}:${new Date().toDateString()}`, [productId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "1");

    (async () => {
      try {
        await supabase.rpc("increment_click", { pid: productId });
      } catch {
        // sessiz geç
      }
    })();
  }, [storageKey, productId]);

  return null;
}

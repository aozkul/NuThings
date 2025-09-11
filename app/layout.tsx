// app/layout.tsx
import React from "react";
import type {Metadata} from "next";
import "./globals.css";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import {cookies} from "next/headers";
import {I18nProvider} from "@/src/i18n/provider";
import DOMTranslate from "@/src/i18n/DOMTranslate";

// Next 15: bu segment her istekte yeniden render edilsin
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Nut Things",
  description: "Premium nuts & delights",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const jar = await cookies();
  const locale = (jar.get("lang")?.value as "de" | "tr" | "en") ?? "de";

  let messages: Record<string, any> = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = {};
  }

  return (
    <html lang={locale}>
    <body>
    <I18nProvider locale={locale} messages={messages}>
      <DOMTranslate/>
      <Navbar/>
      {props.children}
      <Footer/>
    </I18nProvider>
    </body>
    </html>
  );
}

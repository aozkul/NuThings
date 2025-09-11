"use client";

import Link from "next/link";
import Image from "next/image";
import {useEffect, useState} from "react";
import {ShieldIcon} from "@/src/components/Icons";
import {supabase} from "@/src/lib/supabaseClient";
import type {Category} from "@/src/lib/types";
import {IconBadge} from "@/src/components/IconBadge";
import LocaleSwitcher from "@/src/components/LocaleSwitcher";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    let alive = true;
    supabase
      .from("categories")
      .select("id,name,position,slug")
      .order("position", {ascending: true})
      .then(({data}) => {
        if (!alive) return;
        setCats((data || []).filter(Boolean));
      });
    return () => {
      alive = false;
    };
  }, []);

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
      {/* Ana ürünler ortada */}
      <ul className="flex flex-col md:flex-row gap-4 md:gap-8 mx-auto">
        {cats.map((c) => (
          <li key={c.id}>
            <Link
              href={`/category/${(c as any).slug ?? c.id}`}
              className="px-2 py-2 rounded-xl hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              onClick={() => setOpen(false)}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Admin sağda */}
      <div className="mt-4 md:mt-0 md:ml-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          onClick={() => setOpen(false)}
        >
          <IconBadge bg="bg-violet-50" color="text-violet-600">
            <ShieldIcon className="h-4 w-4"/>
          </IconBadge>
          <span>Admin</span>
        </Link>
      </div>
      <div className="mt-4 md:mt-0">
        <div className="flex items-center gap-4">
          {/* ...diğer linkler */}
          <LocaleSwitcher/>
        </div>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      {/* YÜKSEKLİK BURADA BELİRLENİYOR */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-18 md:h-32">
        {/* Logo + Yazı */}
        <div className="flex items-center gap-2 leading-none">
          <Link href="/" className="flex items-center gap-2">
            {/* Container yüksekliğine göre logoyu ölçekle */}
            <Image
              src="/logo.png"
              alt="Nut Things Logo"
              width={100}             // büyük kaynak ver (kalite için)
              height={100}
              priority
              className="h-full w-auto object-contain"  // <-- kritik: yüksekliği konteynere uyar
            />
            <span className="text-2xl font-bold text-neutral-800 leading-none">NuThings</span>
          </Link>
        </div>

        {/* Desktop menu */}
        <nav className="hidden md:flex flex-1">
          <NavLinks/>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-300"
          onClick={() => setOpen(!open)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-neutral-200 px-4 py-2">
          <NavLinks/>
        </nav>
      )}
    </header>
  );
};

export default Navbar;

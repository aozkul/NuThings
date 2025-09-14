"use client";
import {useEffect, useState} from "react";
import {supabase} from "@/src/lib/supabaseClient";
import AdminOverview from "@/src/components/admin/Overview";
import AdminSettings from "@/src/components/admin/Settings";
import AdminCategories from "@/src/components/admin/Categories";
import AdminProducts from "@/src/components/admin/Products";
import {GridIcon} from "@/src/components/Icons";

type Tab = "overview" | "categories" | "products" | "settings" | "newsletter";

const tabs: { key: Tab; label: string; emoji: string }[] = [
  {key: "overview", label: "Genel Bakış", emoji: "📊"},
  {key: "categories", label: "Kategoriler", emoji: "🗂️"},
  {key: "products", label: "Ürünler", emoji: "🧺"},
  {key: "settings", label: "Ayarlar", emoji: "⚙️"},
  {key: "newsletter", label: "Newsletter", emoji: "✉️"}, // ✅ yeni sekme
];

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  // auth
  useEffect(() => {
    supabase.auth.getSession().then(({data}) => setSession(data.session));
    const {data: sub} = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const login = async () => {
    setLoading(true);
    setMsg(null);
    try {
      if (password) {
        const {error} = await supabase.auth.signInWithPassword({email, password});
        if (error) throw error;
      } else {
        const {error} = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? window.location.origin + "/admin" : undefined,
          },
        });
        if (error) throw error;
        setMsg("Giriş bağlantısı e-postanıza gönderildi.");
      }
    } catch (e: any) {
      setMsg(e?.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="relative">
        <div className="bg-gradient-to-b from-neutral-50 to-transparent h-28"/>
        <div className="container-tight -mt-20 mb-10">
          <div className="rounded-2xl shadow-sm border bg-white p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl grid place-items-center border">
                <GridIcon className="h-5 w-5"/>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Admin Giriş</h1>
                <p className="text-sm text-neutral-600">
                  E-posta & şifre veya magic link ile giriş yapın
                </p>
              </div>
            </div>
            <label className="block text-sm">E-posta</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <label className="block text-sm mt-3">Şifre (opsiyonel)</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              onClick={login}
              disabled={loading || !email}
              className="mt-4 w-full rounded-xl bg-black text-white py-2 disabled:opacity-50"
            >
              {loading ? "Bekleyin..." : "Giriş Yap / Magic Link"}
            </button>
            {msg && <p className="mt-3 text-sm text-neutral-700">{msg}</p>}
          </div>
        </div>
      </div>
    );
  }

  const render = () => {
    switch (tab) {
      case "overview":
        return <AdminOverview/>;
      case "categories":
        return <AdminCategories/>;
      case "products":
        return <AdminProducts/>;
      case "settings":
        return <AdminSettings/>;
      case "newsletter":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Newsletter</h2>
            <div className="flex gap-3">
              <a
                href="/admin/newsletter"
                className="rounded border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Aboneler
              </a>
              <a
                href="/admin/newsletter/campaign"
                className="rounded bg-neutral-900 text-white px-3 py-2 text-sm"
              >
                Kampanya Gönder
              </a>
            </div>
          </div>
        );
    }
  };

  // Sidebar item
  const Item = ({t}: { t: (typeof tabs)[number] }) => {
    const active = tab === t.key;
    return (
      <button
        onClick={() => {
          setTab(t.key);
          setMenuOpen(false);
        }}
        className={
          "w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border " +
          (active ? "bg-black text-white border-black" : "hover:bg-neutral-50")
        }
        aria-current={active ? "page" : undefined}
      >
        <span className="text-base select-none">{t.emoji}</span>
        <span className="text-sm font-medium">{t.label}</span>
      </button>
    );
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-50 to-transparent h-32"/>
      <div className="container-tight -mt-24">
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Yönetim Paneli</h1>
              <p className="text-sm text-neutral-600">İçeriğinizi ve ayarlarınızı buradan yönetin.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden inline-flex items-center gap-2 rounded-xl border px-3 py-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Menü
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2"
              >
                Çıkış
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-[220px,1fr] gap-4 md:gap-6">
            {/* Sidebar (desktop) */}
            <aside className="hidden md:block">
              <div className="space-y-2">
                {tabs.map((t) => (
                  <Item key={t.key} t={t}/>
                ))}
              </div>
            </aside>

            {/* Content */}
            <section className="min-h-[60vh]">{render()}</section>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMenuOpen(false)}/>
          <div className="fixed inset-x-0 bottom-0 rounded-t-2xl border bg-white p-4 shadow-2xl">
            <div className="mx-auto max-w-md space-y-2">
              {tabs.map((t) => (
                <Item key={t.key} t={t}/>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

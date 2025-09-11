"use client";
// src/components/admin/Products.tsx
// --- Shared font options (local + Google) for Important Info editor ---
const LOCAL_FONT_OPTIONS = [
  "inherit",
  "Inter, system-ui, sans-serif",
  "Arial, Helvetica, sans-serif",
  "Georgia, serif",
  "\"Times New Roman\", Times, serif",
  "Roboto, system-ui, sans-serif",
  "\"Playfair Display\", serif",
  "Merriweather, serif",
];

const GOOGLE_FONT_FAMILIES: Record<string, string> = {
  "Inter": "Inter, system-ui, sans-serif",
  "Roboto": "Roboto, system-ui, sans-serif",
  "Playfair Display": "\"Playfair Display\", serif",
  "Merriweather": "Merriweather, serif",
  "Lora": "Lora, serif",
  "Poppins": "Poppins, sans-serif",
  "Montserrat": "Montserrat, sans-serif",
  "Open Sans": "\"Open Sans\", sans-serif",
  "Raleway": "Raleway, sans-serif",
  "Lato": "Lato, sans-serif",
  "Source Sans 3": "\"Source Sans 3\", sans-serif",
  "Noto Serif": "\"Noto Serif\", serif",
  "Noto Sans": "\"Noto Sans\", sans-serif",
  "DM Sans": "\"DM Sans\", sans-serif",
  "Josefin Sans": "\"Josefin Sans\", sans-serif",
  "Oswald": "Oswald, sans-serif",
  "Nunito": "Nunito, sans-serif",
  "Libre Baskerville": "\"Libre Baskerville\", serif",
  "Bebas Neue": "\"Bebas Neue\", cursive",
  "Quicksand": "Quicksand, sans-serif",
  // Handwriting (cursive)
  "Dancing Script": "\"Dancing Script\", cursive",
  "Great Vibes": "\"Great Vibes\", cursive",
  "Pacifico": "Pacifico, cursive",
  "Satisfy": "Satisfy, cursive",
  "Caveat": "Caveat, cursive",
  "Shadows Into Light": "\"Shadows Into Light\", cursive",
  "Amatic SC": "\"Amatic SC\", cursive",
  "Handlee": "Handlee, cursive",
  "Sacramento": "Sacramento, cursive",
  "Courgette": "Courgette, cursive",
  "Gloria Hallelujah": "\"Gloria Hallelujah\", cursive",
  "Nothing You Could Do": "\"Nothing You Could Do\", cursive"
};

const FONT_OPTIONS = Array.from(new Set([
  ...LOCAL_FONT_OPTIONS,
  ...Object.values(GOOGLE_FONT_FAMILIES),
])) as string[];
import {useEffect, useMemo, useRef, useState} from "react";
import {supabase} from "@/src/lib/supabaseClient";

type Cat = { id: string; name: string };
type ProdRow = {
  id: string;
  name: string;
  category_id: string | null;
  price: number | null;
  image_url: string | null;
  image_alt: string | null; // SEO ALT
  description: string | null;
  important_html: string | null; // Önemli Bilgi (HTML)
  is_featured: boolean | null;
};

const STORAGE_BUCKET = "product-images";
const PRODUCT_PREFIX = "products/";

export default function ProductsAdmin() {
  const [rows, setRows] = useState<ProdRow[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // form
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProdRow | null>(null);

  const [fName, setFName] = useState("");
  const [fCategoryId, setFCategoryId] = useState<string>("");
  const [fPrice, setFPrice] = useState<number | "">("");
  const [fImage, setFImage] = useState("");
  const [fAlt, setFAlt] = useState(""); // Görsel Alt (SEO)
  const [fDesc, setFDesc] = useState("");
  const [fSeoTitle, setFSeoTitle] = useState("");
  const [fSeoDesc, setFSeoDesc] = useState("");
  const [fFeatured, setFFeatured] = useState(false);

  const [uploading, setUploading] = useState(false);

  // Önemli Bilgi editörü: tamamen uncontrolled
  const impRef = useRef<HTMLDivElement>(null);
  const importantHTMLRef = useRef<string>("");

  // --- Selection (bidi/ters yazma ve execCommand için) ---
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  // Sadece komutu çalıştıran küçük yardımcı (preventDefault içermez!)
  const runCmd = (fn: () => void) => {
    impRef.current?.focus();
    restoreSelection();
    fn();
    saveSelection();
  };

  const sanitizeFileName = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");

  const uploadToStorage = async (file: File, prefix: string) => {
    const safe = sanitizeFileName(file.name);
    const path = `${prefix}${Date.now()}-${safe}`;
    const {error} = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {cacheControl: "3600", upsert: false});
    if (error) throw error;
    const {data: pub} = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return pub?.publicUrl || "";
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    try {
      setUploading(true);
      const url = await uploadToStorage(file, PRODUCT_PREFIX);
      setFImage(url);
      setStatus(null);
    } catch (err: any) {
      setStatus(err.message || "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onNew = () => {
    setEditing(null);
    setFName("");
    setFCategoryId("");
    setFPrice("");
    setFImage("");
    setFAlt("");
    setFDesc("");
    setFSeoTitle("");
    setFSeoDesc("");
    importantHTMLRef.current = "";
    setFFeatured(false);
    setOpen(true);
  };

  const onEdit = (p: ProdRow) => {
    setEditing(p);
    setFName(p.name || "");
    setFCategoryId(p.category_id || "");
    setFPrice(p.price ?? "");
    setFImage(p.image_url || "");
    setFAlt(p.image_alt || "");
    setFDesc(p.description || "");
    setFSeoTitle((p as any).seo_title || "");
    setFSeoDesc((p as any).seo_desc || "");
    importantHTMLRef.current = p.important_html || "";
    setFFeatured(!!p.is_featured);
    setOpen(true);
  };

  const load = async () => {
    setLoading(true);
    setStatus(null);

    const [catRes, prodRes] = await Promise.all([
      supabase.from("categories").select("id, name").order("name", {ascending: true}),
      supabase
        .from("products")
        .select(
          "id, name, category_id, price, image_url, image_alt, description, important_html, is_featured"
        )
        .order("name", {ascending: true}),
    ]);

    if (catRes.error) setStatus(catRes.error.message);
    else setCats((catRes.data as any as Cat[]) || []);

    if (prodRes.error) setStatus(prodRes.error.message);
    else setRows((prodRes.data as any as ProdRow[]) || []);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  

  // Load Google Fonts for Important Info editor preview
useEffect(() => {
  try {
    const id = "admin-google-fonts-products";
    const weights = "wght@300;400;500;600;700;800;900";
    const famParams = Object.keys(GOOGLE_FONT_FAMILIES)
      .map((name) => `family=${encodeURIComponent(name)}:${weights}`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${famParams}&display=swap`;
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  } catch (e) {
    console.warn("Google Fonts preload failed (products):", e);
  }
}, []);

// Modal açıldığında editöre içeriği bir kez bas (uncontrolled)
  useEffect(() => {
    if (open && impRef.current) {
      impRef.current.innerHTML = importantHTMLRef.current || "";
      // editör açılır açılmaz selection'ı sona al
      const node = impRef.current;
      const range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      saveSelection();
    }
  }, [open]);

  const onEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    importantHTMLRef.current = (e.currentTarget as HTMLDivElement).innerHTML;
    saveSelection();
  };

  const onEditorSelectChange = () => saveSelection();

  const onSave = async () => {
    setStatus(null);

    const payload = {
      name: fName.trim(),
      category_id: fCategoryId || null,
      price: typeof fPrice === "number" ? fPrice : Number(fPrice || 0),
      image_url: fImage || null,
      image_alt: fAlt || null,
      description: fDesc || null,
      seo_title: fSeoTitle || null,
      seo_desc: fSeoDesc || null,
      is_featured: !!fFeatured,
      important_html: importantHTMLRef.current || null,
    };

    if (!payload.name) {
      setStatus("Ürün adı zorunlu.");
      return;
    }
    if (uploading) {
      setStatus("Görsel yüklenmesi bitene kadar bekleyin.");
      return;
    }

    if (editing) {
      const {error} = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) {
        setStatus(error.message);
        return;
      }
    } else {
      const {error} = await supabase.from("products").insert(payload);
      if (error) {
        setStatus(error.message);
        return;
      }
    }

    setOpen(false);
    await load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istiyor musunuz?")) return;
    const {error} = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setStatus(error.message);
      return;
    }
    await load();
  };

  const catMap = useMemo(() => {
    const m = new Map<string, string>();
    cats.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [cats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ürünler</h2>
        <button onClick={onNew} className="rounded-lg bg-black text-white px-4 py-2">
          Yeni Ürün
        </button>
      </div>

      {status && <div className="text-sm text-red-600">{status}</div>}

      <div className="rounded-xl border">
        <div className="p-4">
          {loading ? (
            <div className="text-sm text-neutral-500">Yükleniyor…</div>
          ) : rows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                <tr className="text-left text-neutral-600">
                  <th className="py-2 pr-4">Ürün</th>
                  <th className="py-2 pr-4">Kategori</th>
                  <th className="py-2 pr-4">Fiyat</th>
                  <th className="py-2 pr-4">Görsel</th>
                  <th className="py-2 pr-4">Görsel Alt (SEO)</th>
                  <th className="py-2 pr-4">Öne Çıkan</th>
                  <th className="py-2 pr-4 w-28">İşlem</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4">{r.name}</td>
                    <td className="py-2 pr-4">
                      {r.category_id ? catMap.get(r.category_id) || "-" : "-"}
                    </td>
                    <td className="py-2 pr-4">
                      {typeof r.price === "number" ? `${r.price.toFixed(2)} €` : "-"}
                    </td>
                    <td className="py-2 pr-4">
                      {r.image_url ? <img src={r.image_url} alt="" className="h-10 w-14 object-cover rounded"/> : "-"}
                    </td>
                    <td className="py-2 pr-4">{r.image_alt || "-"}</td>
                    <td className="py-2 pr-4">{r.is_featured ? "Evet" : "Hayır"}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 rounded border" onClick={() => onEdit(r)}>Düzenle</button>
                        <button className="px-2 py-1 rounded border" onClick={() => onDelete(r.id)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-neutral-500">Kayıt yok.</div>
          )}
        </div>
      </div>

      {/* Drawer / Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)}/>
          <div
            className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[720px] rounded-t-2xl md:rounded-2xl border bg-white shadow-2xl">
            <div className="p-4 space-y-4 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editing ? "Ürünü Düzenle" : "Yeni Ürün"}</h3>
                <button className="text-sm text-neutral-600" onClick={() => setOpen(false)}>Kapat</button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ürün Adı</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="Örn: Fıstıklı lokum - Nut Things"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
                  value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                />
              </div>

              {/* Önemli Bilgi (Zengin Metin) */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Önemli Bilgi</label>

                <div className="flex flex-wrap gap-2 mb-2">
                  {/* BUTONLAR: onMouseDown + preventDefault (dropdown'u etkilemez) */}
                  <button
                    type="button"
                    className="px-2 py-1 rounded border"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runCmd(() => document.execCommand("bold"));
                    }}
                  >
                    B
                  </button>

                  <button
                    type="button"
                    className="px-2 py-1 rounded border italic"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runCmd(() => document.execCommand("italic"));
                    }}
                  >
                    I
                  </button>

                  <button
                    type="button"
                    className="px-2 py-1 rounded border underline"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runCmd(() => document.execCommand("underline"));
                    }}
                  >
                    U
                  </button>

                  {/* SELECT: sadece onChange (dropdown sorunsuz açılır) */}
                  <select
                    className="px-2 py-1 rounded border"
                    defaultValue="3"
                    onChange={(e) =>
                      runCmd(() =>
                        document.execCommand("fontSize", false, (e.target as HTMLSelectElement).value)
                      )
                    }
                  >
                    <option value="1">Çok Küçük</option>
                    <option value="2">Küçük</option>
                    <option value="3">Normal</option>
                    <option value="4">Büyük</option>
                    <option value="5">Daha Büyük</option>
                    <option value="6">Çok Büyük</option>
                    <option value="7">En Büyük</option>
                  </select>

{/* Font Ailesi */}
<select
  className="px-2 py-1 rounded border"
  defaultValue="inherit"
  onChange={(e) =>
    runCmd(() =>
      document.execCommand("fontName", false, (e.target as HTMLSelectElement).value)
    )
  }
>
  {FONT_OPTIONS.map((f, i) => (
    <option key={`${i}-${f}`} value={f}>{f}</option>
  ))}
</select>

                  {/* Renk: sadece onChange */}
                  <input
                    type="color"
                    aria-label="Renk"
                    className="w-10 h-9 border rounded"
                    onChange={(e) =>
                      runCmd(() =>
                        document.execCommand("foreColor", false, (e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </div>

                <div
                  ref={impRef}
                  className="min-h-[120px] border rounded-lg p-3 bg-white prose max-w-none text-left"
                  contentEditable
                  suppressContentEditableWarning
                  dir="ltr"
                  spellCheck={false}
                  style={{unicodeBidi: "plaintext", whiteSpace: "pre-wrap"}}
                  onInput={onEditorInput}
                  onMouseUp={onEditorSelectChange}
                  onKeyUp={onEditorSelectChange}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Bu alan üründe açıklamanın altında gösterilir.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SEO Title</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={fSeoTitle}
                  onChange={(e) => setFSeoTitle(e.target.value)}
                  placeholder="Örn: Fıstıklı Lokum 250g | Nut Things"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SEO Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[70px]"
                  value={fSeoDesc}
                  onChange={(e) => setFSeoDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={fCategoryId}
                  onChange={(e) => setFCategoryId(e.target.value)}
                >
                  <option value="">— Seçiniz —</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Görsel URL + Dosyadan Seç (YÜKLE) */}
              <div>
                <label className="block text-sm font-medium mb-1">Görsel (URL)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={fImage}
                  onChange={(e) => setFImage(e.target.value)}
                  placeholder="https://…"
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="file"
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={onPickFile}
                  />
                  {uploading && <span className="text-xs text-neutral-500">Yükleniyor…</span>}
                </div>
                {fImage && (
                  <div className="mt-2">
                    <img src={fImage} alt="" className="h-28 w-40 object-cover rounded"/>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Görsel Alt (SEO)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={fAlt}
                  onChange={(e) => setFAlt(e.target.value)}
                  placeholder="Örn: Fıstıklı lokum görseli"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Fiyat (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-40 border rounded-lg px-3 py-2"
                  value={fPrice}
                  onChange={(e) => setFPrice(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={fFeatured}
                    onChange={(e) => setFFeatured(e.target.checked)}
                  />
                  Öne Çıkan
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button className="px-3 py-2 rounded-lg border" onClick={() => setOpen(false)}>
                  İptal
                </button>
                <button
                  onClick={onSave}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

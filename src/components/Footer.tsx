import Link from "next/link";
import {supabaseServer} from "@/src/lib/supabaseServer";
import {MailIcon, InstagramIcon, TwitterIcon, PhoneIcon} from "@/src/components/Icons";
import NewsletterBox from "@/src/components/footer/NewsletterBox";

function IconBadge({
                     children, bg, color, title,
                   }: {
  children: React.ReactNode;
  bg: string;
  color: string;
  title?: string;
}) {
  return (
    <span
      className={`h-7 w-7 grid place-items-center rounded-xl ${bg} ${color} shrink-0`}
      aria-hidden="true"
      title={title}
    >
      {children}
    </span>
  );
}

export default async function Footer() {
  const supabase = supabaseServer();
  const {data: settingsRows} = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["social_instagram", "social_twitter", "social_email", "social_phone"]);

  const settings = Object.fromEntries((settingsRows || []).map(r => [r.key, (r.value || "").trim()]));

  const instagramUrl = settings["social_instagram"] || "https://instagram.com";
  const twitterUrl = settings["social_twitter"] || "https://twitter.com";
  const emailAddr = settings["social_email"] || "info@nut-things.com";
  const phoneNumber = settings["social_phone"] || "+49 172 8891010";

  return (
    <footer className="border-t mt-12 bg-white">
      {/* Mobil -> tek kolon; sm -> 2; md -> 6 kolon. Daha ferah boşluklar ve taşma kırma. */}
      <div className="container-tight py-8 sm:py-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-6 items-start">
        {/* Brand */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Nut Things" className="h-10 w-10 rounded-full object-cover"/>
            <span className="font-semibold">NuThings</span>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed break-words hyphens-auto">
            Doğadan sofranıza; lokum, kuruyemiş ve daha fazlası.
          </p>
        </div>

        {/* Hızlı Bağlantılar */}
        <div>
          <h4 className="font-medium mb-3">Hızlı Bağlantılar</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:underline">Ana Sayfa</Link></li>
            <li><Link href="/products" className="hover:underline">Ürünler</Link></li>
            <li><Link href="/contact" className="hover:underline">İletişim</Link></li>
            <li><Link href="/admin" className="hover:underline">Admin</Link></li>
          </ul>
        </div>

        {/* İletişim */}
        <div className="min-w-0">
          <h4 className="font-medium mb-3">İletişim</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3 min-w-0">
              <IconBadge bg="bg-sky-50" color="text-sky-600" title="E-posta">
                <MailIcon className="h-4 w-4"/>
              </IconBadge>
              <a
                href={`mailto:${emailAddr}`}
                className="hover:underline break-words"
              >
                {emailAddr}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <IconBadge bg="bg-emerald-50" color="text-emerald-600" title="Telefon">
                <PhoneIcon className="h-4 w-4"/>
              </IconBadge>
              <a href={`tel:${phoneNumber}`} className="hover:underline">{phoneNumber}</a>
            </li>
          </ul>
        </div>

        {/* Sosyal */}
        <div>
          <h4 className="font-medium mb-3">Takipte Kalın</h4>
          {/* Sarabilir ve her öğe dokunmatik için yeterince büyük */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border px-3 py-3 min-h-[44px] min-w-[44px] hover:bg-neutral-50"
              aria-label="Instagram" title="Instagram"
            >
              <IconBadge bg="bg-fuchsia-50" color="text-fuchsia-600">
                <InstagramIcon className="h-4 w-4"/>
              </IconBadge>
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border px-3 py-3 min-h-[44px] min-w-[44px] hover:bg-neutral-50"
              aria-label="Twitter / X" title="Twitter / X"
            >
              <IconBadge bg="bg-sky-50" color="text-sky-600">
                <TwitterIcon className="h-4 w-4"/>
              </IconBadge>
            </a>
          </div>
        </div>

        {/* Newsletter – içerik aynı, sadece kolon davranışı: sm'de tek, md'de 2 kolon kaplar */}
        <div className="sm:col-span-2 md:col-span-2">
          <NewsletterBox compact/>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Nut Things
      </div>
    </footer>
  );
}

import {supabaseServer} from "@/src/lib/supabaseServer";
import ProductCard from "@/src/components/ProductCard";

export const revalidate = 60;

export default async function ProductsPage({searchParams}: { searchParams: Promise<{ category_id?: string }> }) {
  const {category_id} = await searchParams;
  const supabase = supabaseServer();
  let query = supabase.from("products").select("*").order("name");
  if (category_id) {
    query = query.eq("category_id", category_id);
  }
  const {data} = await query;
  return (
    <div className="container-tight my-10">
      <h1 className="text-2xl font-semibold mb-6">Ürünler</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(data || []).map((p: any) => (<ProductCard key={p.id} p={p}/>))}
      </div>
    </div>
  );
}

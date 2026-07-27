import type { Metadata } from "next";
import TiendaClient from "./TiendaClient";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tienda | The Mom Coach",
  description: "Guías, recetarios, programas y asesorías de The Mom Coach para acompañarte en cada etapa de la crianza.",
};

export default async function TiendaPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return <TiendaClient products={(products ?? []) as Product[]} />;
}

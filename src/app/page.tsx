import React from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import Testimonials from "@/components/sections/Testimonials";
import Shop from "@/components/sections/Shop";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_popular', true)
    .order('created_at', { ascending: false });

  return (
    <>
      <Hero />
      <Stats />
      <About />
      <Services />
      <Testimonials />
      <Shop products={(featuredProducts ?? []) as Product[]} />
    </>
  );
}

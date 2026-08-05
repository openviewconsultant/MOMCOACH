import React from "react";
import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import Testimonials from "@/components/sections/Testimonials";
import Shop from "@/components/sections/Shop";

export const metadata: Metadata = {
  title: "The Mom Coach | Coach de Sueño Infantil y Alimentación Complementaria",
  description:
    "Programas y asesorías personalizadas para que tu bebé duerma toda la noche y coma sin estrés. Acompañamiento gentil de 0 a 6 años, guiado por Denisse, consultora certificada.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <About />
      <Services />
      <Testimonials />
      <Shop />
    </>
  );
}

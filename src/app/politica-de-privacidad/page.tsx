import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Política de Privacidad | The Mom Coach",
  description: "Política de tratamiento de datos personales de The Mom Coach.",
  path: "/politica-de-privacidad",
});

export default function PoliticaDePrivacidad() {
  return (
    <div style={{ backgroundColor: "var(--color-cream)", minHeight: "100vh", padding: "160px 5% 100px" }}>
      <div>
        <Link
          href="/"
          className="font-inter"
          style={{ color: "var(--color-blue-gray)", fontSize: "0.95rem" }}
        >
          ← Volver al inicio
        </Link>

        <h1
          className="font-forum"
          style={{ fontSize: "2.6rem", color: "var(--color-blue-gray)", margin: "24px 0 8px" }}
        >
          Política de Privacidad
        </h1>
        <p className="font-inter" style={{ opacity: 0.7, marginBottom: "40px" }}>
          Última actualización: {new Date().getFullYear()}
        </p>

        <div className="font-inter" style={{ lineHeight: 1.8, fontSize: "1.05rem" }}>
          <p style={{ marginBottom: 24 }}>
            En <strong>The Mom Coach</strong> nos tomamos en serio la privacidad de quienes
            confían en nosotros. Este documento explica qué datos personales recolectamos,
            para qué los usamos y cuáles son tus derechos como titular de esa información, de
            acuerdo con la Ley 1581 de 2012 y sus decretos reglamentarios en Colombia.
          </p>

          <h2 className="font-forum" style={sectionTitleStyle}>1. Responsable del tratamiento</h2>
          <p style={pStyle}>
            The Mom Coach es la responsable del tratamiento de los datos personales que
            recolecta a través de este sitio web, sus canales de contacto y sus servicios de
            coaching y acompañamiento a familias.
          </p>

          <h2 className="font-forum" style={sectionTitleStyle}>2. Datos que recolectamos</h2>
          <p style={pStyle}>Dependiendo de cómo interactúes con nosotros, podemos recolectar:</p>
          <ul style={ulStyle}>
            <li>Datos de contacto: nombre, correo electrónico y número de teléfono.</li>
            <li>Información que compartes voluntariamente al agendar una sesión o escribirnos.</li>
            <li>Datos de navegación y uso del sitio (páginas visitadas, dispositivo, origen del tráfico).</li>
          </ul>

          <h2 className="font-forum" style={sectionTitleStyle}>3. Para qué usamos tus datos</h2>
          <ul style={ulStyle}>
            <li>Responder tus consultas y agendar sesiones de coaching.</li>
            <li>Enviarte información sobre nuestros programas, eventos y contenido, cuando lo hayas autorizado.</li>
            <li>Mejorar la experiencia del sitio web y nuestros servicios.</li>
            <li>Cumplir obligaciones legales, contables y contractuales.</li>
          </ul>
          <p style={pStyle}>
            No vendemos ni compartimos tus datos personales con terceros para fines distintos
            a los aquí descritos, salvo que la ley lo exija.
          </p>

          <h2 className="font-forum" style={sectionTitleStyle}>4. Tus derechos</h2>
          <p style={pStyle}>Como titular de tus datos personales, tienes derecho a:</p>
          <ul style={ulStyle}>
            <li>Conocer, actualizar y rectificar tu información.</li>
            <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
            <li>Revocar la autorización y/o solicitar la supresión de tus datos, cuando no exista un deber legal que lo impida.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio por el manejo indebido de tus datos.</li>
          </ul>

          <h2 className="font-forum" style={sectionTitleStyle}>5. Cómo ejercer tus derechos</h2>
          <p style={pStyle}>
            Puedes escribirnos a{" "}
            <a href="mailto:hola@themomcoaching.com" style={{ color: "var(--color-coral)" }}>
              hola@themomcoaching.com
            </a>{" "}
            para conocer, actualizar, rectificar o solicitar la eliminación de tus datos
            personales. Atenderemos tu solicitud dentro de los plazos establecidos por la ley.
          </p>

          <h2 className="font-forum" style={sectionTitleStyle}>6. Cambios a esta política</h2>
          <p style={pStyle}>
            Podemos actualizar esta política ocasionalmente para reflejar cambios en nuestras
            prácticas o en la normativa aplicable. Publicaremos cualquier cambio en esta misma
            página.
          </p>
        </div>
      </div>
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  color: "var(--color-blue-gray)",
  marginTop: 40,
  marginBottom: 12,
};

const pStyle: React.CSSProperties = { marginBottom: 20 };

const ulStyle: React.CSSProperties = {
  marginBottom: 20,
  paddingLeft: 24,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

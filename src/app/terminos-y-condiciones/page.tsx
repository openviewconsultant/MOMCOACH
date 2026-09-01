import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Términos y Condiciones | The Mom Coach",
  description:
    "Términos y condiciones de las asesorías de sueño y alimentación de The Mom Coach por Denisse Lafaurie.",
  path: "/terminos-y-condiciones",
});

export default function TerminosYCondiciones() {
  return (
    <div style={{ paddingTop: "120px", paddingBottom: "80px", backgroundColor: "var(--color-cream)", minHeight: "100vh" }}>
      <div style={{ padding: "0 5%" }}>
        <Link
          href="/"
          className="font-inter"
          style={{ color: "var(--color-blue-gray)", fontSize: "0.9rem", display: "inline-block", marginBottom: "24px" }}
        >
          ← Volver al inicio
        </Link>

        <h1
          className="font-fraunces"
          style={{ fontSize: "2.6rem", color: "var(--color-blue-gray)", margin: "0 0 8px" }}
        >
          Términos y Condiciones
        </h1>
        <p className="font-inter" style={{ opacity: 0.7, marginBottom: "24px" }}>
          The Mom Coach por Denisse Lafaurie · Última actualización: {new Date().getFullYear()}
        </p>

        <a
          href="/terminos-y-condiciones.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="font-inter"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-coral)",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: 500,
            marginBottom: "40px",
          }}
        >
          Descargar en PDF
        </a>

        <div className="font-inter" style={{ lineHeight: 1.8, fontSize: "1.05rem" }}>
          <h2 className="font-fraunces" style={sectionTitleStyle}>¿Qué es The Mom Coach?</h2>
          <p style={pStyle}>
            The Mom Coach es una asesoría personalizada, dictada por Denisse Lafaurie, que tiene como
            objetivo brindar la información y el acompañamiento necesario a padres y acudientes de
            niños con problemas de sueño comunes (en adelante, la &ldquo;Asesoría&rdquo;).
          </p>
          <p style={pStyle}>
            La Asesoría está diseñada para niños con problemas de sueño comunes no relacionados con
            condiciones médicas.
          </p>
          <p style={pStyle}>
            Antes de iniciar con la Asesoría, usted deberá aceptar estos Términos y Condiciones,
            manifestando de forma expresa e inequívoca que ha leído y está de acuerdo con los
            Términos y Condiciones aquí establecidos.
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Descargo de responsabilidad</h2>
          <p style={pStyle}>
            Toda la información, el contenido y el material de las Asesorías son para fines
            informativos y no tienen la intención de servir como un sustituto de la consulta,
            diagnóstico y/o tratamiento de un médico o proveedor de atención médica calificado. La
            Asesoría está diseñada para niños con problemas de sueño comunes no relacionados con
            condiciones médicas. La información entregada es para uso informativo y bajo ningún caso
            tendrá como objetivo proporcionar orientación médica. La información que se provee en la
            Asesoría no sustituye el consejo de un profesional de la salud. Siempre busque el consejo
            de su médico pediatra si tiene alguna pregunta acerca de la salud o condición médica de
            su hijo.
          </p>
          <p style={pStyle}>
            Firmando estos términos y condiciones, el usuario acepta entender que la información aquí
            entregada tiene únicamente fines informativos y de ninguna manera sustituye el consejo
            médico. Así mismo, usted acepta consultar y obtener la aprobación de su pediatra antes de
            seguir los consejos o utilizar las técnicas ofrecidas durante la Asesoría.
          </p>
          <p style={pStyle}>
            En ningún caso The Mom Coach o Denisse Lafaurie será responsable por reclamaciones,
            pérdidas o daños relacionados con el contenido informativo entregado a través de las
            asesorías.
          </p>
          <p style={pStyle}>
            The Mom Coach se compromete a proporcionar información que encuentra sustento en los
            estudios necesarios para garantizar que sea lo más precisa y actualizada posible. The Mom
            Coach o Denisse Lafaurie no asumen responsabilidad por errores, omisiones o
            interpretaciones contrarias a la información entregada en la Asesoría.
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Vigencia del programa</h2>
          <p style={pStyle}>
            Una vez que el usuario haya completado el pago por el servicio de Asesoría, dispondrá de
            un plazo de 45 días calendario para iniciar dicho servicio sin incurrir en cargos
            adicionales. Cualquier consulta telefónica programada por el usuario deberá ser cancelada
            con al menos 8 horas de antelación; de lo contrario, se descontará del tiempo disponible
            en el plan adquirido.
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Política de reembolso</h2>
          <p style={pStyle}>
            Cuando el usuario haya realizado el pago de la Asesoría, y todavía no se haya iniciado la
            prestación de la misma, el usuario podrá ejercer su derecho de retracto hasta cinco (5)
            días hábiles posteriores al pago de la Asesoría.
          </p>
          <p style={pStyle}>
            Para ello, el usuario deberá informar a The Mom Coach su intención de desistir de las
            Asesorías, y The Mom Coach hará efectivo el reembolso dentro de los cinco (5) días
            hábiles siguientes al recibo del retracto.
          </p>
          <p style={pStyle}>
            Posterior al término habilitado para el retracto, no se realizarán devoluciones del
            dinero.
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Derechos de autor</h2>
          <p style={pStyle}>
            The Mom Coach o Denisse Lafaurie es titular de todos los derechos de propiedad industrial
            e intelectual derivados de la información entregada en la Asesoría, y se reserva todos los
            derechos de autor, incluidos los no mencionados en este documento. La propiedad
            intelectual sobre la información entregada en la Asesoría hace parte del patrimonio
            intelectual de The Mom Coach o de Denisse Lafaurie o, en su caso, su titularidad es de
            terceros que autorizaron el uso de esta información, o es información pública que se rige
            por las leyes de acceso a la información pública colombianas.
          </p>
          <p style={pStyle}>
            Algunos de los materiales entregados en la Asesoría pueden estar protegidos por derechos
            de autor de terceras personas, en cuyo caso se mencionará en el contenido.
          </p>
          <p style={pStyle}>
            La información que se provee en la Asesoría no puede ser copiada, transmitida o
            compartida por ningún medio, ya sea mecánico o electrónico. Para la reproducción o
            publicación del plan y otros documentos como guías, notas o consejos compartidos en la
            consultoría de forma escrita o verbal, se requiere un permiso escrito de The Mom Coach o
            Denisse Lafaurie.
          </p>
          <p style={pStyle}>
            Toda información que se provee por The Mom Coach o Denisse Lafaurie es confidencial.
            Compartir esta información de cualquier manera está prohibido y estará sujeto a la ley
            internacional de protección a los derechos de autor.
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Confidencialidad</h2>
          <p style={pStyle}>
            The Mom Coach o Denisse Lafaurie se compromete a mantener la confidencialidad de toda la
            información proporcionada por el Cliente, incluyendo detalles personales y médicos
            relacionados con el niño y con su familia. Esta información solo se compartirá con
            terceros cuando sea necesario para proporcionar los servicios de asesoría o cuando esté
            requerido por la ley.
          </p>
          <p style={pStyle}>
            Los archivos, videos y demás insumos con información no deberán ser compartidos ni
            reproducidos sin el consentimiento previo y por escrito de The Mom Coach o Denisse
            Lafaurie. El Cliente reconoce y acuerda que la información proporcionada durante la
            asesoría en sueño infantil es confidencial y forma parte integral de los servicios de
            asesoría pagados. El Cliente se compromete a no compartir esta información con otras
            familias o terceros sin el consentimiento previo y por escrito de The Mom Coach o Denisse
            Lafaurie.
          </p>
          <p style={pStyle}>
            El Cliente reconoce y acuerda que el contenido de la asesoría en sueño infantil está
            diseñado exclusivamente para familias que buscan mejorar los patrones de sueño o
            alimentación de sus hijos, y no está destinado a ser utilizado como material de
            entrenamiento para otras asesoras o profesionales del sueño sin el consentimiento previo
            y por escrito del Asesor.
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Aviso de privacidad</h2>
          <p style={pStyle}>
            De conformidad con lo establecido en el artículo 15 de la Constitución Política de
            Colombia y los deberes contenidos en la Ley 1581 de 2012 o las normas que la modifiquen,
            deroguen o subroguen, The Mom Coach o Denisse Lafaurie adopta la política de tratamiento
            de datos personales del Ministerio de Tecnologías de la Información y las Comunicaciones,
            con el objeto de proteger la privacidad de la información personal que obtenga o llegare a
            obtener, al igual que preservar la confidencialidad, seguridad, veracidad, transparencia,
            acceso y circulación restringida de esta información que reposa en sus bases de datos.
            Consulta también nuestra{" "}
            <Link href="/politica-de-privacidad" style={{ color: "var(--color-coral)" }}>
              Política de Privacidad
            </Link>
            .
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Política de uso para tarjetas de regalo</h2>
          <ol style={olStyle}>
            <li>
              <strong>Uso exclusivo en asesorías y productos de The Mom Coach:</strong> el saldo de
              la tarjeta de regalo emitida por The Mom Coach está destinado exclusivamente para su
              uso en asesorías y productos ofrecidos por nuestra plataforma.
            </li>
            <li>
              <strong>No reembolso del saldo o total de la tarjeta:</strong> el saldo o total de la
              tarjeta de regalo no puede ser solicitado como reembolso en efectivo ni en ninguna
              otra forma de pago. Las tarjetas de regalo son intransferibles y solo pueden ser
              utilizadas para adquirir servicios y productos de The Mom Coach.
            </li>
            <li>
              <strong>No conversión a efectivo:</strong> en ningún caso el saldo de la tarjeta puede
              ser solicitado o convertido en efectivo. Las tarjetas de regalo no tienen valor
              monetario fuera de The Mom Coach.
            </li>
            <li>
              <strong>Fecha de expiración:</strong> las tarjetas de regalo tienen una vigencia de 1
              año desde la fecha de emisión. Después de este periodo, la tarjeta expirará y el saldo
              no utilizado será nulo. Es responsabilidad del titular utilizar el saldo antes de la
              fecha de expiración.
            </li>
            <li>
              <strong>Restricciones de uso:</strong> el saldo de la tarjeta no puede ser utilizado
              para pagar servicios o productos que no estén directamente relacionados con las
              asesorías y productos de The Mom Coach.
            </li>
            <li>
              <strong>Pérdida o robo:</strong> The Mom Coach no se hace responsable por la pérdida,
              robo o daño de las tarjetas de regalo. Se recomienda a los titulares mantenerlas en un
              lugar seguro.
            </li>
            <li>
              <strong>Modificaciones en las políticas:</strong> The Mom Coach se reserva el derecho
              de modificar estas políticas en cualquier momento. Cualquier cambio será comunicado a
              los titulares de tarjetas existentes y a través de nuestros canales de comunicación
              habituales.
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> estas políticas están sujetas a las leyes y
              regulaciones locales y nacionales. The Mom Coach se compromete a cumplir con todas las
              leyes aplicables relacionadas con las tarjetas de regalo.
            </li>
          </ol>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Ley aplicable</h2>
          <p style={pStyle}>
            Estos Términos se regirán e interpretarán de acuerdo con las leyes del Estado colombiano,
            y cualquier disputa que surja en relación con estos Términos estará sujeta a la
            jurisdicción exclusiva de los tribunales de este país.
          </p>

          <h2 className="font-fraunces" style={sectionTitleStyle}>Aceptación de términos</h2>
          <p style={pStyle}>
            Al contratar los servicios de asesoría proporcionados por The Mom Coach, el Cliente
            reconoce haber leído, comprendido y aceptado estos Términos y Condiciones en su
            totalidad. La compra del servicio se considerará como una aceptación inequívoca de estos
            Términos y Condiciones.
          </p>
          <p style={pStyle}>
            Si tiene alguna pregunta o inquietud acerca de estos Términos y Condiciones, le
            recomendamos comunicarse con nosotros antes de utilizar nuestros servicios escribiendo a{" "}
            <a href="mailto:hola@themomcoaching.com" style={{ color: "var(--color-coral)" }}>
              hola@themomcoaching.com
            </a>
            .
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

const olStyle: React.CSSProperties = {
  marginBottom: 20,
  paddingLeft: 24,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

import { useState, useEffect } from "react";
import { db } from "./supabase";
import SignaturePad from "./components/SignaturePad";

// ══════════════════════════════════════════════
// PALETA NODO
// ══════════════════════════════════════════════
const P = "#7C3AED";
const PL = "#A78BFA";
const PD = "#4C1D95";
const BG = "#07050e";
const BG2 = "#0f0b1e";
const BD = "rgba(124,58,237,0.2)";
const TX = "#EDE9FE";
const MT = "#6D6880";

// ══════════════════════════════════════════════
// TIPOS DE DOCUMENTO
// ══════════════════════════════════════════════
const DOCS = [
  { id: "bienvenida", icon: "✉️", label: "Carta de Bienvenida" },
  { id: "propuesta", icon: "📊", label: "Propuesta Comercial" },
  { id: "contrato", icon: "📋", label: "Contrato de Servicios" },
  { id: "acta_inicio", icon: "🚀", label: "Acta de Inicio" },
  { id: "acta_entrega", icon: "✅", label: "Acta de Entrega" },
  { id: "factura", icon: "🧾", label: "Documento de Cobro" },
  { id: "requerimientos", icon: "📦", label: "Kit & Requerimientos" },
];

// ══════════════════════════════════════════════
// VALORES INICIALES
// ══════════════════════════════════════════════
const fechaHoy = () =>
  new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

const INIT = {
  repName: "Tu nombre completo", repPhone: "+57 300 000 0000",
  repEmail: "hola@conectanodo.com", nit: "",
  clientName: "Nombre del cliente", clientCompany: "Empresa del cliente",
  clientEmail: "cliente@empresa.com", clientId: "", clientNiche: "Odontología Estética",
  kitStandardDays: "10 a 15", kitUrgentDays: "5 a 7",
  kitUrgentSurcharge: "30", kitFeedbackHours: "12",
  date: fechaHoy(), projectName: "Proyecto Nodo",
  service: "Pauta Digital con Meta Ads",
  description: "Gestión y optimización de campañas en Meta (Facebook e Instagram): estrategia de audiencias, creatividades y reportes mensuales de resultados.",
  totalValue: "2.000.000", currency: "COP", advance: "50",
  duration: "1 mes", validityDays: "15",
  startDate: "", endDate: "",
  deliverable1: "Configuración y lanzamiento de campaña",
  deliverable2: "3 conjuntos de anuncios optimizados",
  deliverable3: "Reporte mensual de resultados",
  invoiceNum: "001", bankName: "Bancolombia", bankAccount: "", bankType: "Cuenta de Ahorros",
  invoiceItem1: "Servicio de pauta digital", invoiceQty1: "1", invoiceUnit1: "2.000.000",
  invoiceItem2: "", invoiceQty2: "1", invoiceUnit2: "0",
  invoiceItem3: "", invoiceQty3: "1", invoiceUnit3: "0",
  invoiceNote: "Pago por transferencia bancaria a la cuenta indicada.",
};

// ══════════════════════════════════════════════
// PARTES COMPARTIDAS DE DOCUMENTO
// ══════════════════════════════════════════════
const sBase = {
  fontFamily: "'Sora','Helvetica Neue',Georgia,sans-serif",
  color: "#1a1830", fontSize: 13, lineHeight: 1.88,
};

// Patrón geométrico Muisca (SVG inline)
const MuiscaPattern = () => (
  <svg width="100%" height="8" style={{ display: "block", marginBottom: 14 }}>
    <defs>
      <pattern id="muisca" x="0" y="0" width="16" height="8" patternUnits="userSpaceOnUse">
        <rect x="4" y="2" width="4" height="4" fill="none" stroke={P} strokeWidth="0.8" />
        <rect x="6" y="3" width="2" height="2" fill={P} opacity="0.4" />
      </pattern>
    </defs>
    <rect width="100%" height="8" fill="url(#muisca)" />
  </svg>
);

const GradBar = ({ color = "#7C3AED" }) => (
  <div style={{ height: 5, background: `linear-gradient(90deg,#3B0764,${color},#C4B5FD,${color},#3B0764)`, borderRadius: 2, marginBottom: 16 }} />
);

const BrandHeader = ({ f }) => (
  <div style={{ paddingBottom: 14, marginBottom: 18, borderBottom: "1px solid #EAE6F8" }}>
    <GradBar />
    <MuiscaPattern />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{
          fontFamily: "Orbitron,'Courier New',monospace",
          fontSize: 28, fontWeight: 900, color: P, letterSpacing: 4, lineHeight: 1
        }}>NODO</div>
        <div style={{ fontSize: 7.5, letterSpacing: 5.5, color: "#AAA", marginTop: 2, textTransform: "uppercase" }}>
          TECH &amp; GROWTH
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 10, color: "#777", lineHeight: 1.95 }}>
        <div style={{ fontWeight: 700, color: "#444" }}>www.conectanodo.com</div>
        <div>{f.repEmail || "hola@conectanodo.com"}</div>
        <div>{f.repPhone || "+57 300 000 0000"}</div>
        <div>Bogotá D.C., Colombia</div>
        {f.nit && <div>NIT: {f.nit}</div>}
      </div>
    </div>
  </div>
);

const DocFooter = () => (
  <div style={{
    marginTop: 32, paddingTop: 10, borderTop: "1px solid #EEEAF8",
    display: "flex", justifyContent: "space-between", alignItems: "center"
  }}>
    <div style={{ height: 3, width: 48, background: `linear-gradient(90deg,${P},${PL})`, borderRadius: 2 }} />
    <div style={{ fontSize: 9, color: "#CCC", letterSpacing: 0.5 }}>
      www.conectanodo.com · Bogotá D.C., Colombia
    </div>
    <div style={{ height: 3, width: 48, background: `linear-gradient(90deg,${PL},${P})`, borderRadius: 2 }} />
  </div>
);

const Sigs = ({ f, showClient = true }) => (
  <div style={{ display: "flex", gap: 40, marginTop: 32 }}>
    <div style={{ flex: 1, borderTop: "1px solid #AAA", paddingTop: 8 }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>Firma</div>
      <div style={{ 
        fontFamily: "'Playwrite IS', cursive, 'Brush Script MT', Georgia, serif", 
        fontSize: 18, 
        color: PD, 
        height: 38, 
        lineHeight: "38px",
        fontStyle: "italic",
        opacity: 0.85
      }}>
        {f.repName || "Representante"}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{f.repName || "Representante"}</div>
      <div style={{ fontSize: 10, color: P, marginTop: 1 }}>Nodo Tech &amp; Growth</div>
      {f.nit && <div style={{ fontSize: 10, color: "#888" }}>NIT: {f.nit}</div>}
    </div>
    {showClient && (
      <div style={{ flex: 1, borderTop: "1px solid #AAA", paddingTop: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>Firma</div>
        {f.signatureClient ? (
          <img 
            src={f.signatureClient} 
            alt="Firma Cliente" 
            style={{ height: 42, display: "block", marginBottom: 4, objectFit: "contain" }} 
          />
        ) : (
          <div style={{ height: 42, display: "flex", alignItems: "center", color: "#AAA", fontSize: 11, fontStyle: "italic" }}>
            Pendiente de firma
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: f.signatureClient ? 4 : 0 }}>{f.clientName || "Cliente"}</div>
        {f.clientCompany && <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>{f.clientCompany}</div>}
        {f.clientId && <div style={{ fontSize: 10, color: "#888" }}>C.C./NIT: {f.clientId}</div>}
      </div>
    )}
  </div>
);

// ══════════════════════════════════════════════
// DOCUMENTO 1 — CARTA DE BIENVENIDA
// ══════════════════════════════════════════════
const DocBienvenida = ({ f }) => (
  <div style={sBase}>
    <BrandHeader f={f} />
    <p style={{ color: "#999", fontSize: 11, marginBottom: 10 }}>Bogotá D.C., {f.date}</p>
    <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: "#0f0d1e" }}>Carta de Bienvenida</h2>
    <div style={{ height: 2, width: 50, background: P, borderRadius: 1, marginBottom: 20 }} />
    <p style={{ marginBottom: 14 }}>
      Estimado/a <strong>{f.clientName || "[Nombre del cliente]"}</strong>,
    </p>
    <p style={{ marginBottom: 12 }}>
      En nombre de todo el equipo de{" "}
      <strong style={{ color: P }}>Nodo Tech &amp; Growth</strong>, te extendemos
      una cordial bienvenida. Es un privilegio contar contigo como parte de
      nuestra familia de clientes, y estamos genuinamente emocionados de
      acompañar el crecimiento de{" "}
      {f.clientCompany
        ? <strong>{f.clientCompany}</strong>
        : "tu empresa"}.
    </p>
    <p style={{ marginBottom: 12 }}>
      En Nodo creemos que la tecnología bien aplicada es el motor más poderoso
      para escalar un negocio. Nuestra misión es que cada peso que inviertas
      en digital se traduzca en resultados reales y medibles: más leads, más
      ventas y una presencia de marca más fuerte en el ecosistema digital.
    </p>
    <p style={{ marginBottom: 12 }}>
      Tu punto de contacto directo será <strong>{f.repName}</strong>, disponible
      en <strong>{f.repPhone}</strong> y{" "}
      <strong>{f.repEmail}</strong> para atender cualquier consulta, ajuste o
      novedad durante nuestro trabajo conjunto.
    </p>
    <p style={{ marginBottom: 36 }}>
      Pronto recibirás la hoja de ruta inicial de tu proyecto. No dudes en
      contactarnos en cualquier momento — en Nodo, tu crecimiento es nuestra
      prioridad absoluta.
    </p>
    <p style={{ marginBottom: 44, color: "#444" }}>Con entusiasmo y compromiso,</p>
    <Sigs f={f} showClient={false} />
    <DocFooter />
  </div>
);

// ══════════════════════════════════════════════
// DOCUMENTO 2 — PROPUESTA COMERCIAL (DIAPOSITIVAS)
// ══════════════════════════════════════════════
const DocPropuesta = ({ f }) => {
  const num = (s) => parseFloat((s || "0").replace(/\./g, "").replace(",", ".")) || 0;
  const fmt = (n) => Math.round(n).toLocaleString("es-CO");
  const total = num(f.totalValue);
  const adv = total * (parseFloat(f.advance || 0) / 100);

  const Slide = ({ children, isCover = false }) => (
    <div style={{
      minHeight: "260mm",
      padding: "20mm 10mm",
      display: "flex",
      flexDirection: "column",
      justifyContent: isCover ? "center" : "flex-start",
      pageBreakAfter: "always",
      position: "relative",
      ...(!isCover && { borderBottom: "1px solid #EEE" })
    }}>
      {!isCover && (
        <div style={{ position: "absolute", top: "10mm", left: "10mm", right: "10mm", opacity: 0.8 }}>
          <BrandHeader f={f} />
        </div>
      )}
      {children}
      {!isCover && (
        <div style={{ position: "absolute", bottom: "10mm", left: "10mm", width: "calc(100% - 20mm)" }}>
          <DocFooter />
        </div>
      )}
    </div>
  );

  return (
    <div style={sBase}>
      {/* DIAPOSITIVA 1: PORTADA */}
      <Slide isCover={true}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Orbitron,'Courier New',monospace", fontSize: 48, fontWeight: 900, color: P, letterSpacing: 6, marginBottom: 4 }}>NODO</div>
          <div style={{ fontSize: 12, letterSpacing: 8, color: "#AAA", textTransform: "uppercase", marginBottom: 60 }}>TECH & GROWTH</div>
          
          <div style={{ height: 4, width: 80, background: P, margin: "0 auto", borderRadius: 2, marginBottom: 30 }} />
          
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f0d1e", marginBottom: 16 }}>Propuesta Comercial</h1>
          <h2 style={{ fontSize: 20, color: P, fontWeight: 600, marginBottom: 40 }}>Soluciones para {f.clientNiche || "tu industria"}</h2>
          
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: "20px", display: "inline-block", textAlign: "left", minWidth: 300 }}>
            <div style={{ color: "#888", fontSize: 12, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Preparado para:</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1830" }}>{f.clientName}</div>
            {f.clientCompany && <div style={{ color: "#555", fontSize: 14 }}>{f.clientCompany}</div>}
            <div style={{ color: "#999", fontSize: 12, marginTop: 12 }}>{f.date}</div>
          </div>
        </div>
      </Slide>

      {/* DIAPOSITIVA 2: EL DESAFÍO Y LA SOLUCIÓN */}
      <Slide>
        <div style={{ marginTop: 120 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f0d1e", marginBottom: 12 }}>El Desafío en {f.clientNiche || "tu sector"}</h2>
          <div style={{ height: 3, width: 60, background: P, borderRadius: 2, marginBottom: 24 }} />
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, marginBottom: 30 }}>
            Sabemos que destacarse hoy en día es un reto. Tu objetivo es claro: <strong>{f.description}</strong>. Sin embargo, la competencia en el sector de {f.clientNiche || "tu industria"} requiere más que una simple presencia online; requiere un ecosistema digital diseñado para convertir visitantes en clientes reales.
          </p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: P, marginBottom: 12 }}>Nuestra Solución</h2>
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1830", marginBottom: 10 }}>{f.service || "Servicio Estratégico"}</h3>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8 }}>
              En Nodo, implementamos soluciones tecnológicas avanzadas adaptadas a las necesidades específicas de tu negocio. No entregamos "plantillas", construimos la infraestructura operativa que automatizará tu captación de leads y escalará tus ventas en tiempo récord.
            </p>
          </div>
        </div>
      </Slide>

      {/* DIAPOSITIVA 3: NUESTRO ENFOQUE Y BENEFICIOS */}
      <Slide>
        <div style={{ marginTop: 120 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f0d1e", marginBottom: 12 }}>¿Por qué elegir NODO?</h2>
          <div style={{ height: 3, width: 60, background: P, borderRadius: 2, marginBottom: 30 }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ padding: 20, border: "1px solid #EEE", borderRadius: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: P }}>Velocidad Récord</h4>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Desarrollo fluido y optimizado. Reducimos los tiempos tradicionales de entrega sin sacrificar calidad gracias a la asistencia de IA.</p>
            </div>
            <div style={{ padding: 20, border: "1px solid #EEE", borderRadius: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: P }}>Foco en Conversión</h4>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Diseños premium y copys persuasivos enfocados 100% en captar la atención de tu cliente ideal y motivarlo a la compra.</p>
            </div>
            <div style={{ padding: 20, border: "1px solid #EEE", borderRadius: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💻</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: P }}>Tecnología Escalar</h4>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Código limpio, arquitecturas modernas y rendimiento optimizado para que tu web posicione y cargue de forma inmediata.</p>
            </div>
            <div style={{ padding: 20, border: "1px solid #EEE", borderRadius: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: P }}>Acompañamiento</h4>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Comunicación directa y transparente. Tu representante estará atento para resolver dudas y ajustar la estrategia cuando sea necesario.</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* DIAPOSITIVA 4: ENTREGABLES Y CRONOGRAMA */}
      <Slide>
        <div style={{ marginTop: 120 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f0d1e", marginBottom: 12 }}>Entregables del Proyecto</h2>
          <div style={{ height: 3, width: 60, background: P, borderRadius: 2, marginBottom: 24 }} />
          
          <div style={{ background: "#F9F9FB", border: "1px solid #EAEAEF", borderRadius: 8, padding: 24, marginBottom: 30 }}>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#333", lineHeight: 2 }}>
              {[f.deliverable1, f.deliverable2, f.deliverable3].filter(Boolean).map((d, i) => (
                <li key={i} style={{ marginBottom: 12 }}><strong>{d}</strong></li>
              ))}
              <li style={{ marginBottom: 12, color: "#666" }}>Optimización técnica y SEO básico en toda la estructura.</li>
              <li style={{ marginBottom: 12, color: "#666" }}>Integración de analítica y conexión con canales de contacto.</li>
            </ul>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: P, marginBottom: 12 }}>Cronograma de Trabajo</h2>
          <div style={{ display: "flex", gap: 16 }}>
             <div style={{ flex: 1, padding: 16, background: "#FFF0F2", border: "1px solid #FECDD3", borderRadius: 8 }}>
               <strong style={{ display: "block", color: "#9F1239", fontSize: 14 }}>1. Onboarding</strong>
               <span style={{ fontSize: 12, color: "#444" }}>Recepción de requerimientos y recursos visuales.</span>
             </div>
             <div style={{ flex: 1, padding: 16, background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8 }}>
               <strong style={{ display: "block", color: P, fontSize: 14 }}>2. Desarrollo</strong>
               <span style={{ fontSize: 12, color: "#444" }}>Construcción y diseño en {f.duration}.</span>
             </div>
             <div style={{ flex: 1, padding: 16, background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8 }}>
               <strong style={{ display: "block", color: "#166534", fontSize: 14 }}>3. Lanzamiento</strong>
               <span style={{ fontSize: 12, color: "#444" }}>Revisión final, ajustes y puesta en producción.</span>
             </div>
          </div>
        </div>
      </Slide>

      {/* DIAPOSITIVA 5: INVERSIÓN Y SIGUIENTES PASOS */}
      <Slide>
        <div style={{ marginTop: 120 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f0d1e", marginBottom: 12 }}>Inversión</h2>
          <div style={{ height: 3, width: 60, background: P, borderRadius: 2, marginBottom: 30 }} />
          
          <div style={{ border: `2px solid ${P}`, borderRadius: 8, overflow: "hidden", marginBottom: 30 }}>
            <div style={{ background: P, color: "white", padding: "12px 20px", fontSize: 16, fontWeight: 700 }}>
              Detalle Financiero
            </div>
            <div style={{ padding: 20 }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Valor total del proyecto", `${f.currency} $${f.totalValue}`, true],
                    [`Anticipo inicial para arrancar (${f.advance}%)`, `${f.currency} $${fmt(adv)}`, false],
                    ["Saldo restante contra entrega", `${f.currency} $${fmt(total - adv)}`, false],
                    ["Tiempo de entrega estimado", f.duration, false],
                  ].map(([k, v, bold]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #F0ECFF" }}>
                      <td style={{ padding: "12px 0", color: "#555" }}>{k}</td>
                      <td style={{
                        padding: "12px 0", textAlign: "right",
                        fontWeight: bold ? 700 : 500, fontSize: bold ? 18 : 14,
                        color: bold ? "#1a1830" : P
                      }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: "#555", background: "#F5F3FF", padding: "10px 12px", borderRadius: 6, border: "1px solid #DDD6FE", marginTop: 16 }}>
                <strong>Nota:</strong> Los valores no incluyen IVA. Esta propuesta tiene validez de {f.validityDays || "15"} días calendario.
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: P, marginBottom: 12 }}>¿Listo para empezar?</h2>
          <p style={{ fontSize: 14, color: "#444", marginBottom: 30 }}>
            Para dar inicio formal al proyecto, requerimos la aprobación de esta propuesta y el comprobante del pago de anticipo.
          </p>

          <Sigs f={f} showClient={true} />
        </div>
      </Slide>
    </div>
  );
};

// ══════════════════════════════════════════════
// DOCUMENTO 3 — CONTRATO DE SERVICIOS
// ══════════════════════════════════════════════
const DocContrato = ({ f }) => {
  const clausulas = [
    ["PRIMERA — OBJETO",
      `EL PRESTADOR se compromete a prestar el servicio de "${f.service || "[servicio]"}". ${f.description || ""}`],
    ["SEGUNDA — DURACIÓN",
      `El presente contrato tendrá vigencia de ${f.duration || "[duración]"}, con inicio el ${f.startDate || "__________"} y finalización el ${f.endDate || "__________"}. Podrá renovarse mediante acuerdo escrito entre las partes con 15 días de anticipación.`],
    ["TERCERA — VALOR Y FORMA DE PAGO",
      `El valor total del contrato es de ${f.currency} $${f.totalValue}. EL CLIENTE realizará un anticipo del ${f.advance}% al inicio del proyecto, y el saldo restante al finalizar. Los pagos se efectuarán mediante transferencia bancaria a la cuenta informada por EL PRESTADOR. Los valores estipulados no incluyen IVA, debido a que EL PRESTADOR no es responsable de IVA, emitiendo el documento soporte de cobro correspondiente.`],
    ["CUARTA — OBLIGACIONES DEL PRESTADOR",
      "EL PRESTADOR se compromete a: (i) ejecutar los servicios con diligencia y profesionalismo; (ii) mantener comunicación periódica sobre el avance; (iii) entregar los productos acordados en los tiempos pactados; (iv) guardar confidencialidad sobre la información del cliente."],
    ["QUINTA — OBLIGACIONES DEL CLIENTE",
      "EL CLIENTE se compromete a: (i) realizar los pagos en los plazos establecidos; (ii) suministrar oportunamente la información y accesos necesarios; (iii) revisar y aprobar las entregas en un plazo máximo de 5 días hábiles; (iv) designar un punto de contacto interno."],
    ["SEXTA — PROPIEDAD INTELECTUAL",
      "Los entregables finales debidamente pagados serán propiedad de EL CLIENTE. EL PRESTADOR podrá referenciar el proyecto en su portafolio, salvo acuerdo expreso de confidencialidad."],
    ["SÉPTIMA — RESOLUCIÓN DE CONFLICTOS",
      "Las partes resolverán cualquier diferencia de forma amigable. De no lograrse acuerdo en 15 días, se acogerán a la legislación colombiana vigente, con jurisdicción en la ciudad de Bogotá D.C."],
  ];
  return (
    <div style={sBase}>
      <BrandHeader f={f} />
      <h2 style={{
        fontSize: 14, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: 2, marginBottom: 4, color: "#0f0d1e"
      }}>
        Contrato de Prestación de Servicios
      </h2>
      <div style={{ height: 2, width: 80, background: P, borderRadius: 1, marginBottom: 20 }} />
      <p style={{ marginBottom: 14, fontSize: 12 }}>
        Entre los suscritos: <strong>Nodo Tech &amp; Growth</strong> (en adelante
        "EL PRESTADOR"), con NIT <strong>{f.nit || "__________"}</strong>, domiciliado
        en Bogotá D.C., representado por <strong>{f.repName}</strong>; y{" "}
        <strong>{f.clientName}</strong>, con C.C./NIT{" "}
        <strong>{f.clientId || "__________"}</strong>,
        correo <strong>{f.clientEmail}</strong> (en adelante "EL CLIENTE"),
        acuerdan el presente contrato en Bogotá D.C., el {f.date}.
      </p>
      {clausulas.map(([titulo, texto]) => (
        <div key={titulo} style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 10, color: P, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700 }}>
            CLÁUSULA {titulo}
          </div>
          <p style={{ marginTop: 3, fontSize: 12, color: "#333" }}>{texto}</p>
        </div>
      ))}
      <p style={{ marginTop: 16, marginBottom: 28, fontSize: 12, color: "#555" }}>
        En señal de aceptación, firman en Bogotá D.C., el {f.date}.
      </p>
      <Sigs f={f} />
      <DocFooter />
    </div>
  );
};

// ══════════════════════════════════════════════
// DOCUMENTO 4 — ACTA DE INICIO
// ══════════════════════════════════════════════
const DocActaInicio = ({ f }) => (
  <div style={sBase}>
    <BrandHeader f={f} />
    <h2 style={{
      fontSize: 15, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 2, marginBottom: 4, color: "#0f0d1e"
    }}>
      Acta de Inicio de Proyecto
    </h2>
    <div style={{ height: 2, width: 80, background: P, borderRadius: 1, marginBottom: 20 }} />
    <div style={{
      background: "#F5F3FF", borderRadius: 8, padding: 14, marginBottom: 20,
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 18px", fontSize: 12
    }}>
      {[
        ["Fecha", f.date],
        ["Proyecto", f.projectName],
        ["Cliente", f.clientName],
        ["Empresa", f.clientCompany || "—"],
        ["Fecha de inicio", f.startDate || "A definir"],
        ["Fecha de entrega", f.endDate || "A definir"],
      ].map(([k, v]) => (
        <div key={k}><span style={{ color: "#888" }}>{k}: </span><strong>{v}</strong></div>
      ))}
    </div>
    <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#222" }}>Servicio contratado:</h4>
    <p style={{ fontSize: 12, color: "#444", marginBottom: 18 }}>
      <strong>{f.service}</strong> — {f.description}
    </p>
    <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#222" }}>Entregables acordados:</h4>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 20 }}>
      <thead>
        <tr style={{ background: P, color: "white" }}>
          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>#</th>
          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>Entregable</th>
          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {[f.deliverable1, f.deliverable2, f.deliverable3].filter(Boolean).map((d, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #EEE", background: i % 2 ? "#FAF8FF" : "white" }}>
            <td style={{ padding: "6px 10px", color: "#888" }}>{i + 1}</td>
            <td style={{ padding: "6px 10px" }}>{d}</td>
            <td style={{ padding: "6px 10px", color: P }}>⏳ En proceso</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ fontSize: 12, color: "#555", marginBottom: 28 }}>
      Con la firma del presente documento, ambas partes confirman los términos, fechas y
      entregables acordados, y declaran el <strong>inicio oficial del proyecto</strong>.
    </p>
    <Sigs f={f} />
    <DocFooter />
  </div>
);

// ══════════════════════════════════════════════
// DOCUMENTO 5 — ACTA DE ENTREGA
// ══════════════════════════════════════════════
const DocActaEntrega = ({ f }) => (
  <div style={sBase}>
    <BrandHeader f={f} />
    <h2 style={{
      fontSize: 15, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 2, marginBottom: 4, color: "#0f0d1e"
    }}>
      Acta de Entrega y Recibido a Satisfacción
    </h2>
    <div style={{ height: 2, width: 80, background: "#16A34A", borderRadius: 1, marginBottom: 20 }} />
    <div style={{
      background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8, padding: 14,
      marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 18px", fontSize: 12
    }}>
      {[
        ["Fecha de entrega", f.date],
        ["Proyecto", f.projectName],
        ["Cliente", f.clientName],
        ["Empresa", f.clientCompany || "—"],
      ].map(([k, v]) => (
        <div key={k}><span style={{ color: "#888" }}>{k}: </span><strong>{v}</strong></div>
      ))}
    </div>
    <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#222" }}>Entregables completados:</h4>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 20 }}>
      <thead>
        <tr style={{ background: "#16A34A", color: "white" }}>
          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>#</th>
          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>Entregable</th>
          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {[f.deliverable1, f.deliverable2, f.deliverable3].filter(Boolean).map((d, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #EEE", background: i % 2 ? "#F0FDF4" : "white" }}>
            <td style={{ padding: "6px 10px", color: "#888" }}>{i + 1}</td>
            <td style={{ padding: "6px 10px" }}>{d}</td>
            <td style={{ padding: "6px 10px", color: "#16A34A", fontWeight: 600 }}>✅ Entregado</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: 14, marginBottom: 18 }}>
      <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#222" }}>Declaración de satisfacción:</h4>
      <p style={{ fontSize: 12, color: "#444", lineHeight: 1.8 }}>
        Yo, <strong>{f.clientName}</strong>
        {f.clientCompany && `, en representación de ${f.clientCompany},`} declaro
        que he recibido a satisfacción todos los entregables del
        proyecto <strong>{f.projectName}</strong>, desarrollado por{" "}
        <strong>Nodo Tech &amp; Growth</strong>. Los trabajos cumplen con lo pactado
        en el contrato y la propuesta comercial inicial. Autorizo a Nodo Tech &amp; Growth
        a referenciar este proyecto en su portafolio de servicios.
      </p>
    </div>
    <div style={{ border: "2px dashed #CCC", borderRadius: 6, padding: "12px 14px", marginBottom: 28 }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 8 }}><strong>Observaciones del cliente:</strong></p>
      <div style={{ height: 52 }} />
      <div style={{ borderBottom: "1px solid #DDD" }} />
    </div>
    <Sigs f={f} />
    <DocFooter />
  </div>
);

// ══════════════════════════════════════════════
// DOCUMENTO 6 — DOCUMENTO DE COBRO (FACTURA)
// ══════════════════════════════════════════════
const DocFactura = ({ f }) => {
  const num = (s) => parseFloat((s || "").replace(/\./g, "").replace(",", ".")) || 0;
  const fmt = (n) => Math.round(n).toLocaleString("es-CO");

  const items = [
    { desc: f.invoiceItem1, qty: f.invoiceQty1, unit: f.invoiceUnit1 },
    { desc: f.invoiceItem2, qty: f.invoiceQty2, unit: f.invoiceUnit2 },
    { desc: f.invoiceItem3, qty: f.invoiceQty3, unit: f.invoiceUnit3 },
  ].filter(it => it.desc);

  const total = items.reduce((acc, it) => acc + num(it.unit) * parseFloat(it.qty || 1), 0);

  return (
    <div style={sBase}>
      <BrandHeader f={f} />

      {/* Título + Número */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: "#0f0d1e", textTransform: "uppercase", letterSpacing: 1 }}>Documento de Cobro</h2>
          <div style={{ height: 2, width: 50, background: P, borderRadius: 1 }} />
        </div>
        <div style={{ background: P, color: "white", borderRadius: 8, padding: "10px 18px", textAlign: "right" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, opacity: 0.8, textTransform: "uppercase" }}>N° de documento</div>
          <div style={{ fontFamily: "Orbitron,monospace", fontSize: 20, fontWeight: 900, letterSpacing: 3 }}>#{f.invoiceNum || "001"}</div>
        </div>
      </div>

      {/* Info cliente vs emisor */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: "12px 14px", fontSize: 11, lineHeight: 1.9 }}>
          <div style={{ fontSize: 8.5, color: P, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700, marginBottom: 6 }}>Emitido por</div>
          <div style={{ fontWeight: 700, color: "#1a1830" }}>Nodo Tech &amp; Growth</div>
          <div style={{ color: "#555" }}>{f.repName}</div>
          <div style={{ color: "#777" }}>{f.repEmail}</div>
          <div style={{ color: "#777" }}>{f.repPhone}</div>
          {f.nit && <div style={{ color: "#888" }}>NIT: {f.nit}</div>}
        </div>
        <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: "12px 14px", fontSize: 11, lineHeight: 1.9 }}>
          <div style={{ fontSize: 8.5, color: P, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700, marginBottom: 6 }}>Cobrado a</div>
          <div style={{ fontWeight: 700, color: "#1a1830" }}>{f.clientName || "Cliente"}</div>
          {f.clientCompany && <div style={{ color: "#555" }}>{f.clientCompany}</div>}
          <div style={{ color: "#777" }}>{f.clientEmail}</div>
          {f.clientId && <div style={{ color: "#888" }}>C.C./NIT: {f.clientId}</div>}
        </div>
      </div>

      {/* Meta info */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ k: "Fecha de emisión", v: f.date }, { k: "Proyecto", v: f.projectName }, { k: "Servicio", v: f.service }].map(({ k, v }) => (
          <div key={k} style={{ flex: "1 1 140px", background: "#FAF8FF", border: "1px solid #EDE9FE", borderRadius: 6, padding: "8px 12px", fontSize: 11 }}>
            <div style={{ color: "#AAA", fontSize: 9, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{k}</div>
            <div style={{ fontWeight: 600, color: "#1a1830" }}>{v || "—"}</div>
          </div>
        ))}
      </div>

      {/* Tabla de ítems */}
      <div style={{ border: `2px solid ${P}`, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ background: P, color: "white", padding: "8px 14px", fontSize: 12, fontWeight: 700 }}>📋 Detalle del cobro</div>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F5F3FF" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#555", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, width: "50%" }}>Descripción</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "#555", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Cant.</th>
              <th style={{ padding: "8px 12px", textAlign: "right", color: "#555", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Valor unitario</th>
              <th style={{ padding: "8px 12px", textAlign: "right", color: "#555", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} style={{ borderTop: "1px solid #EDE9FE", background: i % 2 ? "#FAF8FF" : "white" }}>
                <td style={{ padding: "9px 12px", color: "#333" }}>{it.desc}</td>
                <td style={{ padding: "9px 12px", textAlign: "center", color: "#555" }}>{it.qty}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", color: "#555" }}>{f.currency} ${fmt(num(it.unit))}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, color: "#1a1830" }}>{f.currency} ${fmt(num(it.unit) * parseFloat(it.qty || 1))}</td>
              </tr>
            ))}
            <tr style={{ borderTop: `2px solid ${P}`, background: "#F5F3FF" }}>
              <td colSpan={3} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#1a1830" }}>TOTAL A PAGAR</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 900, fontSize: 15, color: P, fontFamily: "Orbitron,monospace" }}>{f.currency} ${fmt(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Datos bancarios */}
      {(f.bankName || f.bankAccount) && (
        <div style={{ background: "#0f0d1e", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ fontSize: 9, color: PL, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, width: "100%", marginBottom: 4 }}>💳 Datos para transferencia</div>
          {[{ k: "Banco", v: f.bankName }, { k: "Tipo de cuenta", v: f.bankType }, { k: "Número de cuenta", v: f.bankAccount }].filter(x => x.v).map(({ k, v }) => (
            <div key={k}>
              <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: 0.8 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginTop: 1 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Nota */}
      {f.invoiceNote && (
        <div style={{ border: "1px dashed #C4B5FD", borderRadius: 6, padding: "9px 13px", marginBottom: 28, fontSize: 11, color: "#666", fontStyle: "italic" }}>
          <strong style={{ color: P, fontStyle: "normal" }}>Nota:</strong> {f.invoiceNote}
        </div>
      )}

      <Sigs f={f} showClient={false} />
      <DocFooter />
    </div>
  );
};

// ══════════════════════════════════════════════
// DOCUMENTO 7 — KIT DE BIENVENIDA Y REQUERIMIENTOS
// ══════════════════════════════════════════════
const DocRequerimientos = ({ f }) => (
  <div style={sBase}>
    <BrandHeader f={f} />
    <h2 style={{
      fontSize: 17, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 2, marginBottom: 4, color: "#0f0d1e"
    }}>
      Kit de Bienvenida y Requerimientos
    </h2>
    <div style={{ height: 2, width: 80, background: P, borderRadius: 1, marginBottom: 20 }} />
    
    <p style={{ marginBottom: 14 }}>
      Para nosotros, una página web no es un folleto digital; es la infraestructura operativa que va a automatizar tus ventas. Para cumplir con nuestros tiempos de entrega récord en código limpio, <strong>nuestro cronograma de desarrollo solo inicia una vez hayamos recibido la totalidad de los materiales solicitados en este documento.</strong>
    </p>

    <h3 style={{ fontSize: 14, fontWeight: 700, color: P, marginTop: 24, marginBottom: 10 }}>📅 Esquemas de Entrega según Urgencia</h3>
    
    <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: 14, marginBottom: 12 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#222" }}>Opción A: Flujo Estándar ({f.kitStandardDays || "10 a 15"} Días Hábiles)</h4>
      <ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: "#444" }}>
        <li style={{ marginBottom: 4 }}><strong>Condición:</strong> El cliente entrega el 100% de la información solicitada en el Kit de Bienvenida en la reunión de Onboarding.</li>
        <li><strong>Ritmo:</strong> Desarrollo fluido y optimizado con asistencia de IA.</li>
      </ul>
    </div>

    <div style={{ background: "#FFF0F2", border: "1px solid #FECDD3", borderRadius: 8, padding: 14, marginBottom: 24 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#9F1239" }}>Opción B: Flujo de Alta Urgencia ({f.kitUrgentDays || "5 a 7"} Días Hábiles)</h4>
      <ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: "#444" }}>
        <li style={{ marginBottom: 4 }}><strong>Condición:</strong> Requiere un <strong>recargo del {f.kitUrgentSurcharge || "30"}%</strong> sobre el valor base del proyecto.</li>
        <li><strong>Ritmo:</strong> Prioridad absoluta en el pipeline de desarrollo de NODO. El cliente debe garantizar feedback y aprobaciones de diseño/copys en menos de {f.kitFeedbackHours || "12"} horas hábiles.</li>
      </ul>
    </div>

    <h3 style={{ fontSize: 14, fontWeight: 700, color: P, marginTop: 24, marginBottom: 12 }}>📋 Lista de Requerimientos Obligatorios</h3>

    <div style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#222" }}>1. Identidad de Marca y Visuales</h4>
      <ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: "#444" }}>
        <li style={{ marginBottom: 6 }}><strong>[ ] Logotipo:</strong> Archivo original en alta resolución (preferiblemente en formato vectorial .ai, .svg o .png sin fondo).</li>
        <li style={{ marginBottom: 6 }}><strong>[ ] Manual de Marca o Colores:</strong> Códigos HEX de tus colores corporativos (Ej: #000000) y tipografías oficiales si las tienes.</li>
        <li style={{ marginBottom: 6 }}><strong>[ ] Banco de Imágenes/Videos:</strong> Enlace a una carpeta de Google Drive con las fotos de tus productos, instalaciones, retratos profesionales o videos que deban ir en la web. <em>(Si no tienes, indícalo para usar stock premium de alta conversión).</em></li>
      </ul>
    </div>

    <div style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#222" }}>2. Contenidos y Estructura Comercial</h4>
      <ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: "#444" }}>
        <li style={{ marginBottom: 6 }}><strong>[ ] Portafolio de Servicios/Productos:</strong> Documento de texto detallando qué vendes, cuáles son los beneficios principales de cada uno y sus respectivos precios o rangos.</li>
        <li style={{ marginBottom: 6 }}><strong>[ ] Preguntas Frecuentes (FAQs):</strong> Las 5 preguntas que tus clientes siempre te hacen antes de comprar y las respuestas exactas que les das.</li>
        <li style={{ marginBottom: 6 }}><strong>[ ] Prueba Social:</strong> Capturas de pantalla o textos de testimonios reales de tus clientes actuales con sus nombres o logos.</li>
      </ul>
    </div>

    <div style={{ marginBottom: 24 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#222" }}>3. Accesos Técnicos y Conexiones</h4>
      <ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: "#444" }}>
        <li style={{ marginBottom: 6 }}><strong>[ ] Dominio y Hosting:</strong> Credenciales de acceso al proveedor donde compraste el nombre de tu web (Ej: GoDaddy, Namecheap) si ya cuentas con uno.</li>
        <li style={{ marginBottom: 6 }}><strong>[ ] WhatsApp del Negocio:</strong> Número de teléfono exacto que se conectará al Optimizador de Intención para recibir los leads calificados.</li>
        <li style={{ marginBottom: 6 }}><strong>[ ] Accesos Publicitarios (Si aplica):</strong> Roles de administrador en tu Business Manager de Meta si vas a iniciar la fase de pauta de inmediato con nosotros.</li>
      </ul>
    </div>

    <DocFooter />
  </div>
);

// ══════════════════════════════════════════════
// MAPA DE RENDERERS
// ══════════════════════════════════════════════
const RENDERERS = {
  bienvenida: DocBienvenida,
  propuesta: DocPropuesta,
  contrato: DocContrato,
  acta_inicio: DocActaInicio,
  acta_entrega: DocActaEntrega,
  factura: DocFactura,
  requerimientos: DocRequerimientos,
};

// ══════════════════════════════════════════════
// COMPONENTES DE FORMULARIO
// ══════════════════════════════════════════════
const Field = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={{
      display: "block", fontSize: 9.5, color: PL, marginBottom: 3,
      textTransform: "uppercase", letterSpacing: 0.9, fontWeight: 600
    }}>{label}</label>
    {type === "textarea" ? (
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={3}
        style={{
          width: "100%", background: "rgba(124,58,237,0.08)",
          border: `1px solid ${BD}`, borderRadius: 5, color: TX,
          padding: "7px 9px", fontSize: 12, resize: "vertical", fontFamily: "inherit"
        }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: "rgba(124,58,237,0.08)",
          border: `1px solid ${BD}`, borderRadius: 5, color: TX,
          padding: "7px 9px", fontSize: 12, fontFamily: "inherit"
        }} />
    )}
  </div>
);

const Sec = ({ title, children }) => (
  <div style={{
    marginBottom: 12, padding: 11, background: "rgba(124,58,237,0.05)",
    borderRadius: 7, border: `1px solid ${BD}`
  }}>
    <div style={{
      fontSize: 8.5, color: PL, textTransform: "uppercase", letterSpacing: 1.6,
      fontWeight: 700, marginBottom: 9
    }}>{title}</div>
    {children}
  </div>
);

// ══════════════════════════════════════════════
// AuditTrail Component for PDF legal verification
const AuditTrail = ({ f }) => {
  if (f.status !== "signed") return null;

  return (
    <div style={{
      marginTop: 48,
      paddingTop: 16,
      borderTop: "2px dashed #DDD",
      fontSize: 10,
      color: "#555",
      fontFamily: "'Sora',system-ui,sans-serif",
      pageBreakBefore: "always"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: P, letterSpacing: 0.5, textTransform: "uppercase", fontSize: 9 }}>
          🔒 Pista de Auditoría de Firma Electrónica
        </div>
        <div style={{ background: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: 12, fontSize: 8, fontWeight: 700 }}>
          DOCUMENTO FIRMADO Y VERIFICADO
        </div>
      </div>
      
      <p style={{ marginBottom: 12, lineHeight: 1.5, color: "#666" }}>
        Este documento ha sido firmado electrónicamente de conformidad con la Ley 527 de 1999 de la República de Colombia. Los metadatos registrados a continuación garantizan la integridad, autenticidad y el no repudio del firmante.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px 20px",
        background: "#F9F9FB",
        border: "1px solid #EAEAEF",
        borderRadius: 6,
        padding: 12
      }}>
        <div>
          <span style={{ color: "#888", display: "block", fontSize: 8.5, textTransform: "uppercase" }}>Firmante (Cliente)</span>
          <strong style={{ color: "#333" }}>{f.clientName}</strong>
          {f.clientId && <span style={{ display: "block", fontSize: 9 }}>C.C./NIT: {f.clientId}</span>}
          {f.clientEmail && <span style={{ display: "block", fontSize: 9 }}>Email: {f.clientEmail}</span>}
        </div>
        <div>
          <span style={{ color: "#888", display: "block", fontSize: 8.5, textTransform: "uppercase" }}>Fecha y Hora (Firma)</span>
          <strong style={{ color: "#333" }}>{f.signedAt ? new Date(f.signedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" }) : "—"}</strong>
          <span style={{ display: "block", fontSize: 8.5, color: "#888" }}>Zona Horaria: Colombia (COT)</span>
        </div>
        <div>
          <span style={{ color: "#888", display: "block", fontSize: 8.5, textTransform: "uppercase" }}>Dirección IP</span>
          <strong style={{ color: "#333", fontFamily: "monospace" }}>{f.ipAddress || "No registrada"}</strong>
        </div>
        <div>
          <span style={{ color: "#888", display: "block", fontSize: 8.5, textTransform: "uppercase" }}>Identificador del Documento</span>
          <strong style={{ color: "#333", fontFamily: "monospace", fontSize: 8.5 }}>{f.documentId || "Local-Preview"}</strong>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <span style={{ color: "#888", display: "block", fontSize: 8.5, textTransform: "uppercase" }}>Huella Digital del Navegador (User-Agent)</span>
          <span style={{ color: "#666", fontSize: 8.5, fontFamily: "monospace", display: "block", wordBreak: "break-all" }}>
            {f.userAgent || "No registrado"}
          </span>
        </div>
      </div>
      
      <div style={{ textAlign: "center", marginTop: 12, fontSize: 8, color: "#AAA" }}>
        Generado automáticamente por Nodo Tech & Growth • ID de verificación: {f.documentId}
      </div>
    </div>
  );
};

// APP PRINCIPAL
// ══════════════════════════════════════════════
export default function App() {
  const [doc, setDoc] = useState("bienvenida");
  const [f, setF] = useState(INIT);
  const set = (k) => (v) => setF(p => ({ ...p, [k]: v }));

  // Signature and DB flow states
  const [isClientMode, setIsClientMode] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [docId, setDocId] = useState("");
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [generatedSignUrl, setGeneratedSignUrl] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Client input states for signing
  const [tempSignature, setTempSignature] = useState("");
  const [clientFullName, setClientFullName] = useState("");
  const [clientCc, setClientCc] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);

  useEffect(() => {
    // Cargar fuentes
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
    // Estilos globales
    const s = document.createElement("style");
    s.textContent = `
      *{box-sizing:border-box;}
      html,body,#root{height:100%;margin:0;padding:0;}
      input:focus,textarea:focus{
        outline:none!important;
        border-color:#7C3AED!important;
        box-shadow:0 0 0 2px rgba(124,58,237,0.18)!important;
      }
      ::-webkit-scrollbar{width:4px;}
      ::-webkit-scrollbar-track{background:#0a071a;}
      ::-webkit-scrollbar-thumb{background:#4C1D95;border-radius:2px;}
      button:hover{opacity:0.88;}

      @media print {
        body * { visibility: hidden; }
        #doc-preview-wrapper, #doc-preview-wrapper * { visibility: visible; }
        #doc-preview-wrapper {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          max-width: none !important;
          padding: 0 !important;
          box-shadow: none !important;
          margin: 0 !important;
          background: white !important;
        }
        @page { margin: 15mm 20mm; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `;
    document.head.appendChild(s);

    // Read URL parameters for client signature mode
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const modeParam = params.get("mode");

    if (idParam && modeParam === "sign") {
      setIsClientMode(true);
      setDocId(idParam);
      loadDocument(idParam);
    }
  }, []);

  const loadDocument = async (id) => {
    setIsLoadingDoc(true);
    try {
      const document = await db.getDocument(id);
      if (document) {
        setDoc(document.doc_type);
        
        // Merge the stored document data and signing metadata into state `f`
        const mergedFields = {
          ...document.data,
          status: document.status,
          signatureClient: document.signature_client,
          signedAt: document.signed_at,
          ipAddress: document.ip_address,
          userAgent: document.user_agent,
          documentId: document.id,
        };
        setF(mergedFields);
        
        // Prefill client signature input fields
        setClientFullName(mergedFields.clientName || "");
        setClientCc(mergedFields.clientId || "");
        setClientEmail(mergedFields.clientEmail || "");
      } else {
        alert("El documento solicitado no fue encontrado.");
      }
    } catch (e) {
      console.error(e);
      alert("Error al cargar el documento.");
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleCreateSignLink = async () => {
    setIsSavingDoc(true);
    try {
      const savedDoc = await db.createDocument(doc, f);
      const signUrl = `${window.location.origin}${window.location.pathname}?id=${savedDoc.id}&mode=sign`;
      setGeneratedSignUrl(signUrl);
    } catch (e) {
      console.error(e);
      alert("Hubo un error al guardar el documento y generar el enlace.");
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleSignDocument = async (e) => {
    e.preventDefault();
    if (!tempSignature) {
      alert("Por favor dibuja tu firma en el lienzo.");
      return;
    }
    if (!clientFullName || !clientCc || !clientEmail) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }
    if (!termsAccepted) {
      alert("Por favor acepta los términos de firma electrónica.");
      return;
    }

    setIsSubmittingSignature(true);
    try {
      // Get Client IP Address
      let ip = "127.0.0.1";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ip = ipData.ip;
      } catch (err) {
        console.warn("No se pudo capturar la IP pública, usando alternativa.");
      }

      const signatureData = {
        signatureClient: tempSignature,
        fullname: clientFullName,
        cc: clientCc,
        email: clientEmail,
        ip: ip,
        userAgent: navigator.userAgent
      };

      const updatedDoc = await db.signDocument(docId, signatureData);
      
      // Update local state `f` to render signed document immediately
      const updatedFields = {
        ...f,
        clientName: clientFullName,
        clientId: clientCc,
        clientEmail: clientEmail,
        status: "signed",
        signatureClient: tempSignature,
        signedAt: updatedDoc.signed_at,
        ipAddress: ip,
        userAgent: navigator.userAgent,
        documentId: docId
      };
      setF(updatedFields);
      
      alert("¡Documento firmado electrónicamente con éxito!");
    } catch (e) {
      console.error(e);
      alert("Error al firmar el documento. Intenta de nuevo.");
    } finally {
      setIsSubmittingSignature(false);
    }
  };

  // Imprimir: utiliza la función nativa con estilos CSS para impresión
  const handlePrint = () => {
    window.print();
  };

  const DocComp = RENDERERS[doc];
  const needProject = ["propuesta", "contrato", "acta_inicio", "acta_entrega", "factura"].includes(doc);
  const needFinancial = ["propuesta", "contrato"].includes(doc);
  const needDates = ["contrato", "acta_inicio"].includes(doc);
  const needFactura = doc === "factura";
  const needKit = doc === "requerimientos";

  if (isLoadingDoc) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        height: "100vh", background: BG, color: TX, fontFamily: "'Sora',sans-serif"
      }}>
        <div style={{
          border: "4px solid rgba(124,58,237,0.1)", borderTop: `4px solid ${P}`,
          borderRadius: "50%", width: 40, height: 40, animation: "spin 1s linear infinite",
          marginBottom: 16
        }} />
        <div style={{ fontSize: 14, color: PL }}>Cargando documento seguro...</div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", height: "100vh", background: BG, color: TX,
      fontFamily: "'Sora',system-ui,sans-serif", overflow: "hidden"
    }}>

      {/* ── PANEL IZQUIERDO ── */}
      {!isClientMode && (
        <div style={{
          width: 292, display: "flex", flexDirection: "column",
          borderRight: `1px solid ${BD}`, background: BG2, flexShrink: 0
        }}>

          {/* Logo */}
          <div style={{
            padding: "18px 16px 14px", borderBottom: `1px solid ${BD}`,
            background: "rgba(124,58,237,0.04)"
          }}>
            <div style={{
              fontFamily: "Orbitron,monospace", fontSize: 22, fontWeight: 900,
              color: P, letterSpacing: 4, lineHeight: 1,
              textShadow: `0 0 20px rgba(124,58,237,0.5)`
            }}>NODO</div>
            <div style={{ fontSize: 7, color: MT, letterSpacing: 5, textTransform: "uppercase", marginTop: 2 }}>
              TECH &amp; GROWTH
            </div>
            <div style={{ fontSize: 10, color: MT, marginTop: 6, letterSpacing: 0.3 }}>
              📄 Kit de Documentos Oficiales
            </div>
          </div>

          {/* Selector de documento */}
          <div style={{ padding: "12px 10px 0", borderBottom: `1px solid ${BD}`, paddingBottom: 10 }}>
            {DOCS.map(d => (
              <button key={d.id} onClick={() => setDoc(d.id)} style={{
                width: "100%", textAlign: "left", padding: "9px 11px", marginBottom: 3,
                borderRadius: 7, cursor: "pointer", fontSize: 12,
                background: doc === d.id ? "rgba(124,58,237,0.2)" : "transparent",
                border: doc === d.id ? `1px solid rgba(124,58,237,0.45)` : "1px solid transparent",
                color: doc === d.id ? PL : MT, transition: "all 0.15s",
              }}>
                <span style={{ marginRight: 8 }}>{d.icon}</span>{d.label}
              </button>
            ))}
          </div>

          {/* Formulario */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 0" }}>

            <Sec title="Tu información (Nodo)">
              <Field label="Nombre del representante" value={f.repName} onChange={set("repName")} />
              <Field label="Teléfono" value={f.repPhone} onChange={set("repPhone")} />
              <Field label="Correo" value={f.repEmail} onChange={set("repEmail")} />
              {doc === "contrato" &&
                <Field label="NIT empresa" value={f.nit} onChange={set("nit")} placeholder="XXX.XXX.XXX-X" />}
            </Sec>

            <Sec title="Datos del cliente">
              <Field label="Nombre completo" value={f.clientName} onChange={set("clientName")} />
              <Field label="Empresa" value={f.clientCompany} onChange={set("clientCompany")} />
              <Field label="Correo" value={f.clientEmail} onChange={set("clientEmail")} />
              {doc === "contrato" &&
                <Field label="C.C. / NIT" value={f.clientId} onChange={set("clientId")} />}
            </Sec>

            <Field label="Fecha del documento" value={f.date} onChange={set("date")} />

            {needProject && (
              <Sec title="Proyecto">
                {["acta_inicio", "acta_entrega"].includes(doc) &&
                  <Field label="Nombre del proyecto" value={f.projectName} onChange={set("projectName")} />}
                {doc === "propuesta" &&
                  <Field label="Nicho / Industria" value={f.clientNiche} onChange={set("clientNiche")} placeholder="Ej. Odontología, Inmobiliaria" />}
                <Field label="Servicio" value={f.service} onChange={set("service")} />
                <Field label="Descripción" value={f.description} onChange={set("description")} type="textarea" />
                <Field label="Entregable 1" value={f.deliverable1} onChange={set("deliverable1")} />
                <Field label="Entregable 2" value={f.deliverable2} onChange={set("deliverable2")} />
                <Field label="Entregable 3" value={f.deliverable3} onChange={set("deliverable3")} />
              </Sec>
            )}

            {needFinancial && (
              <Sec title="Inversión">
                <Field label="Valor total" value={f.totalValue} onChange={set("totalValue")} placeholder="2.000.000" />
                <Field label="Moneda (COP / USD)" value={f.currency} onChange={set("currency")} />
                <Field label="% de anticipo" value={f.advance} onChange={set("advance")} />
                <Field label="Duración del proyecto" value={f.duration} onChange={set("duration")} />
                {doc === "propuesta" &&
                  <Field label="Validez (días)" value={f.validityDays} onChange={set("validityDays")} />}
              </Sec>
            )}

            {needDates && (
              <Sec title="Fechas">
                <Field label="Fecha de inicio" value={f.startDate} onChange={set("startDate")} placeholder="1 de junio de 2025" />
                <Field label="Fecha de entrega" value={f.endDate} onChange={set("endDate")} placeholder="30 de junio de 2025" />
              </Sec>
            )}

            {needKit && (
              <Sec title="Opciones del Kit">
                <Field label="Días Opción Estándar" value={f.kitStandardDays} onChange={set("kitStandardDays")} placeholder="10 a 15" />
                <Field label="Días Opción Urgente" value={f.kitUrgentDays} onChange={set("kitUrgentDays")} placeholder="5 a 7" />
                <Field label="Recargo Urgencia (%)" value={f.kitUrgentSurcharge} onChange={set("kitUrgentSurcharge")} placeholder="30" />
                <Field label="Feedback Urgente (Horas)" value={f.kitFeedbackHours} onChange={set("kitFeedbackHours")} placeholder="12" />
              </Sec>
            )}

            {needFactura && (
              <>
                <Sec title="Documento de Cobro">
                  <Field label="N° de documento" value={f.invoiceNum} onChange={set("invoiceNum")} placeholder="001" />
                  <Field label="Moneda (COP / USD)" value={f.currency} onChange={set("currency")} />
                  <Field label="C.C. / NIT del cliente" value={f.clientId} onChange={set("clientId")} />
                </Sec>
                <Sec title="Ítem 1">
                  <Field label="Descripción" value={f.invoiceItem1} onChange={set("invoiceItem1")} placeholder="Servicio de pauta digital" />
                  <Field label="Cantidad" value={f.invoiceQty1} onChange={set("invoiceQty1")} placeholder="1" />
                  <Field label="Valor unitario" value={f.invoiceUnit1} onChange={set("invoiceUnit1")} placeholder="2.000.000" />
                </Sec>
                <Sec title="Ítem 2 (opcional)">
                  <Field label="Descripción" value={f.invoiceItem2} onChange={set("invoiceItem2")} placeholder="Dejar vacío si no aplica" />
                  <Field label="Cantidad" value={f.invoiceQty2} onChange={set("invoiceQty2")} placeholder="1" />
                  <Field label="Valor unitario" value={f.invoiceUnit2} onChange={set("invoiceUnit2")} placeholder="0" />
                </Sec>
                <Sec title="Ítem 3 (opcional)">
                  <Field label="Descripción" value={f.invoiceItem3} onChange={set("invoiceItem3")} placeholder="Dejar vacío si no aplica" />
                  <Field label="Cantidad" value={f.invoiceQty3} onChange={set("invoiceQty3")} placeholder="1" />
                  <Field label="Valor unitario" value={f.invoiceUnit3} onChange={set("invoiceUnit3")} placeholder="0" />
                </Sec>
                <Sec title="Datos bancarios">
                  <Field label="Banco" value={f.bankName} onChange={set("bankName")} placeholder="Bancolombia" />
                  <Field label="Tipo de cuenta" value={f.bankType} onChange={set("bankType")} placeholder="Cuenta de Ahorros" />
                  <Field label="Número de cuenta" value={f.bankAccount} onChange={set("bankAccount")} placeholder="000-000000-00" />
                </Sec>
                <Sec title="Nota del documento">
                  <Field label="Nota / instrucciones de pago" value={f.invoiceNote} onChange={set("invoiceNote")} type="textarea" placeholder="Pago por transferencia bancaria…" />
                </Sec>
              </>
            )}

            {generatedSignUrl && (
              <div style={{
                margin: "12px 0",
                padding: "12px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid #10B981",
                borderRadius: 8,
                color: TX
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 6 }}>
                  ✓ ¡Enlace de Firma Creado!
                </div>
                <input type="text" readOnly value={generatedSignUrl} style={{
                  width: "100%",
                  padding: "6px 8px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid #555",
                  borderRadius: 4,
                  color: "#FFF",
                  fontSize: 10,
                  marginBottom: 8
                }} onClick={e => e.target.select()} />
                
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(generatedSignUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }} style={{
                    flex: 1, padding: "6px 0", background: "#10B981", border: "none", borderRadius: 4,
                    color: "white", fontSize: 10, fontWeight: 700, cursor: "pointer"
                  }}>
                    {copied ? "¡Copiado!" : "Copiar Enlace"}
                  </button>
                  
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola, te comparto el documento para tu firma electrónica: ${generatedSignUrl}`)}`}
                     target="_blank" rel="noreferrer" style={{
                       flex: 1, padding: "6px 0", background: "#25D366", border: "none", borderRadius: 4,
                       color: "white", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none",
                       display: "inline-block"
                     }}>
                    WhatsApp
                  </a>
                </div>
                
                <button onClick={() => setGeneratedSignUrl("")} style={{
                  width: "100%", marginTop: 8, background: "none", border: "none", color: "#888",
                  fontSize: 9, cursor: "pointer", textDecoration: "underline"
                }}>
                  Cerrar
                </button>
              </div>
            )}

            <div style={{ height: 12 }} />
          </div>

          {/* Panel de Botones de Control */}
          <div style={{ padding: "12px", borderTop: `1px solid ${BD}` }}>
            <button onClick={handlePrint} style={{
              width: "100%", padding: "11px 0",
              background: `linear-gradient(135deg,${P},${PD})`,
              border: "none", borderRadius: 8, color: "white",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 18px rgba(124,58,237,0.4)`,
              letterSpacing: 0.3,
              marginBottom: 8
            }}>
              🖨️ Imprimir / Guardar PDF
            </button>
            
            <button onClick={handleCreateSignLink} disabled={isSavingDoc} style={{
              width: "100%", padding: "11px 0",
              background: `linear-gradient(135deg, #10B981, #047857)`,
              border: "none", borderRadius: 8, color: "white",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 18px rgba(16,185,129,0.3)`,
              letterSpacing: 0.3,
            }}>
              {isSavingDoc ? "Generando Enlace..." : "✍️ Enviar para Firma"}
            </button>
            
            <p style={{ fontSize: 9, color: MT, textAlign: "center", marginTop: 6 }}>
              El cliente podrá firmar digitalmente sin imprimir
            </p>
          </div>
        </div>
      )}

      {/* ── PANEL DERECHO — PREVIEW ── */}
      <div style={{ flex: 1, overflowY: "auto", background: "#EEEBF8", padding: "28px 28px" }}>
        
        {/* Banner de firma electrónica en modo cliente */}
        {isClientMode && (
          <div style={{
            maxWidth: 700,
            margin: "0 auto 20px",
            background: `linear-gradient(135deg, ${P}, ${PD})`,
            borderRadius: 8,
            padding: "16px 20px",
            boxShadow: "0 4px 20px rgba(124,58,237,0.25)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 10, color: PL, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>
                Firma Electrónica de Documentos
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "white", marginTop: 2 }}>
                {f.status === "signed" ? "✓ Documento Firmado" : "✍️ Firma Pendiente"}
              </div>
            </div>
            {f.status === "signed" && (
              <button onClick={handlePrint} style={{
                background: "white",
                color: PD,
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                🖨️ Descargar PDF Firmado
              </button>
            )}
          </div>
        )}

        {/* Etiqueta del documento (Ocultar al imprimir) */}
        {!isClientMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }} className="no-print">
            <span style={{ fontSize: 18 }}>{DOCS.find(d => d.id === doc)?.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: "#8B87A8", letterSpacing: 0.5 }}>
                Vista previa del documento
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1830" }}>
                {DOCS.find(d => d.id === doc)?.label}
              </div>
            </div>
          </div>
        )}

        {/* Hoja del documento */}
        <div id="doc-preview-wrapper" style={{
          maxWidth: 700, margin: "0 auto", background: "white", borderRadius: 8,
          padding: "46px 56px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.13), 0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div id="doc-preview-inner">
            <DocComp f={f} />
            <AuditTrail f={f} />
          </div>
        </div>

        {/* Panel de firma del cliente */}
        {isClientMode && f.status !== "signed" && (
          <div style={{
            maxWidth: 700,
            margin: "24px auto 0",
            background: "white",
            borderRadius: 8,
            padding: "24px 32px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            color: "#1a1830"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: PD, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span>✍️</span> Completar Firma Electrónica
            </h3>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
              Por favor, verifica tus datos y firma en el recuadro a continuación. Tu firma se estampará en el documento.
            </p>
            
            <form onSubmit={handleSignDocument}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#666", fontWeight: 600, marginBottom: 4 }}>NOMBRE COMPLETO</label>
                  <input type="text" required value={clientFullName} onChange={e => setClientFullName(e.target.value)} style={{
                    width: "100%", padding: "8px 10px", border: "1px solid #CCC", borderRadius: 6, fontSize: 12
                  }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#666", fontWeight: 600, marginBottom: 4 }}>IDENTIFICACIÓN (C.C. / NIT)</label>
                  <input type="text" required value={clientCc} onChange={e => setClientCc(e.target.value)} style={{
                    width: "100%", padding: "8px 10px", border: "1px solid #CCC", borderRadius: 6, fontSize: 12
                  }} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, color: "#666", fontWeight: 600, marginBottom: 4 }}>CORREO ELECTRÓNICO</label>
                <input type="email" required value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={{
                  width: "100%", padding: "8px 10px", border: "1px solid #CCC", borderRadius: 6, fontSize: 12
                }} />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, color: "#666", fontWeight: 600, marginBottom: 4 }}>DIBUJAR FIRMA</label>
                <SignaturePad 
                  onSave={(dataUrl) => setTempSignature(dataUrl)} 
                  onClear={() => setTempSignature("")} 
                />
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 20 }}>
                <input type="checkbox" required id="terms" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: 2 }} />
                <label htmlFor="terms" style={{ fontSize: 11, color: "#444", cursor: "pointer", lineHeight: 1.4 }}>
                  Certifico que la firma dibujada corresponde a mi firma autógrafa y acepto vincularme electrónicamente a este documento según lo establecido en la Ley 527 de 1999.
                </label>
              </div>

              <button type="submit" disabled={isSubmittingSignature} style={{
                width: "100%", padding: "12px",
                background: `linear-gradient(135deg, ${P}, ${PD})`,
                color: "white", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)"
              }}>
                {isSubmittingSignature ? "Guardando y Firmando..." : "Firmar Documento Oficialmente"}
              </button>
            </form>
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
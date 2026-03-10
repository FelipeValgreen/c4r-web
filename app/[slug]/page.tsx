import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Clock3,
  Cookie,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  Search,
  Shield,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import TrackedLink from "@/components/TrackedLink";
import { marketingSlugs } from "@/lib/site";
import { blogCategories, blogPosts } from "@/lib/blog-posts";

type MarketingSlug = (typeof marketingSlugs)[number];

type Cta = {
  href: string;
  label: string;
  eventName: string;
};

type Highlight = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Step = {
  title: string;
  description: string;
};

type ShowcaseCard = {
  title: string;
  description: string;
  image: string;
  href: string;
  cta: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type Metric = {
  value: string;
  label: string;
};

type StandardPageContent = {
  kind: "standard";
  title: string;
  description: string;
  badge: string;
  heroImage: string;
  heroAlt: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  metrics: Metric[];
  highlightsTitle: string;
  highlights: Highlight[];
  stepsTitle: string;
  steps: Step[];
  showcaseTitle: string;
  showcase: ShowcaseCard[];
  faqTitle: string;
  faqs: FaqItem[];
  finalTitle: string;
  finalDescription: string;
  finalPrimary: Cta;
  finalSecondary?: Cta;
};

type PricingPlan = {
  name: string;
  subtitle: string;
  price: string;
  features: string[];
  popular?: boolean;
  cta: Cta;
};

type PricingPageContent = {
  kind: "pricing";
  title: string;
  description: string;
  badge: string;
  plans: PricingPlan[];
  benefitsTitle: string;
  benefits: Highlight[];
  faqs: FaqItem[];
  finalTitle: string;
  finalDescription: string;
  finalPrimary: Cta;
  finalSecondary: Cta;
};

type BlogPostPreview = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  cta: Cta;
};

type BlogPageContent = {
  kind: "blog";
  title: string;
  description: string;
  badge: string;
  categories: string[];
  posts: BlogPostPreview[];
  finalTitle: string;
  finalDescription: string;
  finalPrimary: Cta;
  finalSecondary: Cta;
};

type ContactMethod = {
  title: string;
  detail: string;
  helper: string;
  href: string;
  icon: LucideIcon;
};

type ContactPageContent = {
  kind: "contact";
  title: string;
  description: string;
  badge: string;
  methods: ContactMethod[];
  supportHours: string[];
  finalTitle: string;
  finalDescription: string;
  finalPrimary: Cta;
  finalSecondary: Cta;
};

type FaqCategory = {
  title: string;
  items: FaqItem[];
};

type FaqPageContent = {
  kind: "faq";
  title: string;
  description: string;
  badge: string;
  categories: FaqCategory[];
  finalTitle: string;
  finalDescription: string;
  finalPrimary: Cta;
  finalSecondary: Cta;
};

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalPageContent = {
  kind: "legal";
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
  finalTitle: string;
  finalDescription: string;
  finalPrimary: Cta;
  finalSecondary: Cta;
};

type PageContent =
  | StandardPageContent
  | PricingPageContent
  | BlogPageContent
  | ContactPageContent
  | FaqPageContent
  | LegalPageContent;

const pages: Record<MarketingSlug, PageContent> = {
  "compra-segura": {
    kind: "standard",
    title: "Compra segura en C4R",
    description:
      "Compra autos usados con verificacion obligatoria, pago protegido y garantia C4R Shield para evitar estafas.",
    badge: "Compra segura C4R",
    heroImage:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    heroAlt: "Auto verificado listo para compra segura",
    primaryCta: {
      href: "/app/explorar",
      label: "Explorar autos verificados",
      eventName: "compra_segura_primary_cta",
    },
    secondaryCta: {
      href: "/como-funciona",
      label: "Ver como funciona",
      eventName: "compra_segura_secondary_cta",
    },
    metrics: [
      { value: "15.000+", label: "Compradores activos" },
      { value: "98%", label: "Satisfaccion reportada" },
      { value: "7 dias", label: "Garantia C4R Shield" },
      { value: "24/7", label: "Soporte especializado" },
    ],
    highlightsTitle: "Proteccion en cada etapa de tu compra",
    highlights: [
      {
        title: "Chequeo obligatorio C4R Check",
        description: "Validamos documentos, historial legal, multas, prendas y alertas de robo antes de publicar.",
        icon: Search,
      },
      {
        title: "Pago protegido en escrow",
        description: "Tu dinero se libera solo cuando recibes el auto en las condiciones acordadas.",
        icon: CreditCard,
      },
      {
        title: "Garantia C4R Shield",
        description: "Cobertura de 7 dias o 300 km para devolucion en casos elegibles.",
        icon: Shield,
      },
    ],
    stepsTitle: "Como compras sin riesgo en C4R",
    steps: [
      {
        title: "1. Revisa el catalogo verificado",
        description: "Filtra por presupuesto, ciudad y kilometraje sobre autos ya validados.",
      },
      {
        title: "2. Analiza reporte y score",
        description: "Consulta C4R Check y C4R Score para decidir con informacion completa.",
      },
      {
        title: "3. Cierra con pago protegido",
        description: "Formaliza la compra, recibe tu vehiculo y activa automaticamente la garantia.",
      },
    ],
    showcaseTitle: "Ejemplos de vehiculos verificados",
    showcase: [
      {
        title: "Toyota Corolla 2020",
        description: "Historial limpio, 45.000 km y verificacion legal al dia.",
        image:
          "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/app/explorar",
        cta: "Ver en catalogo",
      },
      {
        title: "Kia Sportage 2021",
        description: "Inspeccion tecnica vigente y documentacion validada.",
        image:
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/app/explorar",
        cta: "Ver en catalogo",
      },
      {
        title: "Hyundai Tucson 2020",
        description: "Reporte de mantenimiento y score alto de confianza.",
        image:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/app/explorar",
        cta: "Ver en catalogo",
      },
    ],
    faqTitle: "Preguntas frecuentes sobre compra segura",
    faqs: [
      {
        question: "Como funciona la garantia C4R Shield?",
        answer:
          "La cobertura aplica durante 7 dias o 300 km desde la entrega para casos elegibles de fallas no declaradas y discrepancias relevantes.",
      },
      {
        question: "Puedo revisar el auto antes de pagar?",
        answer:
          "Si. Coordinas visita o inspeccion y el pago protegido se libera solo tras confirmacion de recepcion.",
      },
      {
        question: "Que pasa si detecto un problema despues de comprar?",
        answer:
          "Debes reportarlo dentro del plazo de garantia. El equipo C4R evalua evidencia y gestiona la resolucion.",
      },
      {
        question: "Puedo financiar la compra?",
        answer:
          "Si, puedes iniciar evaluacion financiera y cerrar la operacion en la misma plataforma con soporte comercial.",
      },
    ],
    finalTitle: "Compra tu proximo auto con respaldo real",
    finalDescription:
      "Empieza hoy con vehiculos verificados, pagos protegidos y soporte experto durante todo el proceso.",
    finalPrimary: {
      href: "/app/explorar",
      label: "Explorar autos ahora",
      eventName: "compra_segura_final_primary",
    },
    finalSecondary: {
      href: "/contacto",
      label: "Hablar con un asesor",
      eventName: "compra_segura_final_secondary",
    },
  },
  "vende-rapido": {
    kind: "standard",
    title: "Vende rapido y con respaldo",
    description:
      "Publica tu auto en minutos, recibe ofertas reales y cierra la venta con pago protegido y trazabilidad.",
    badge: "Venta inteligente C4R",
    heroImage:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    heroAlt: "Vehiculo listo para publicarse y venderse rapido",
    primaryCta: {
      href: "/contacto",
      label: "Publicar mi auto",
      eventName: "vende_rapido_primary_cta",
    },
    secondaryCta: {
      href: "/precios",
      label: "Ver planes y comisiones",
      eventName: "vende_rapido_secondary_cta",
    },
    metrics: [
      { value: "15-30 dias", label: "Tiempo promedio de venta" },
      { value: "3-5%", label: "Comision referencial" },
      { value: "100%", label: "Pago protegido en escrow" },
      { value: "24h", label: "Tiempo de respuesta comercial" },
    ],
    highlightsTitle: "Todo lo que necesitas para vender mejor",
    highlights: [
      {
        title: "Publicacion guiada",
        description: "Te ayudamos con fotos, datos clave y posicionamiento para recibir mas interesados.",
        icon: Upload,
      },
      {
        title: "Compradores verificados",
        description: "Recibes consultas de usuarios con identidad validada y mayor intencion de compra.",
        icon: Users,
      },
      {
        title: "Cobro seguro",
        description: "Gestionamos el flujo de pago y liberacion para que no asumas riesgo de fraude.",
        icon: CreditCard,
      },
    ],
    stepsTitle: "Flujo de venta en 4 pasos",
    steps: [
      {
        title: "1. Carga de informacion y fotos",
        description: "Sube datos del auto, kilometraje y estado general en un formulario simple.",
      },
      {
        title: "2. Validacion C4R Check",
        description: "Verificamos antecedentes para dar confianza y acelerar la conversion.",
      },
      {
        title: "3. Gestion de interesados",
        description: "Recibe ofertas y coordina visitas desde un canal ordenado.",
      },
      {
        title: "4. Cierre con respaldo",
        description: "Firma digital, pago protegido y trazabilidad de toda la operacion.",
      },
    ],
    showcaseTitle: "Resultados reales de vendedores C4R",
    showcase: [
      {
        title: "Venta cerrada en 7 dias",
        description: "Sedan 2020 publicado con reporte C4R y cierre en una semana.",
        image:
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/contacto",
        cta: "Quiero replicar este resultado",
      },
      {
        title: "Mas visibilidad para tu auto",
        description: "Publicaciones optimizadas para destacar en busquedas internas.",
        image:
          "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/contacto",
        cta: "Solicitar asesoria",
      },
      {
        title: "Pago protegido sin sorpresas",
        description: "Cobros trazables y seguros para vendedor y comprador.",
        image:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/como-funciona",
        cta: "Ver proceso de pago",
      },
    ],
    faqTitle: "Preguntas frecuentes sobre venta",
    faqs: [
      {
        question: "Cuanto demora publicar mi auto?",
        answer: "La carga inicial toma pocos minutos y luego el equipo valida la informacion antes de publicar.",
      },
      {
        question: "Puedo editar precio y descripcion?",
        answer: "Si. Puedes ajustar condiciones para reaccionar al mercado y mejorar conversion.",
      },
      {
        question: "Cuando recibo el pago?",
        answer:
          "El pago se libera una vez confirmada la entrega conforme del vehiculo segun el flujo protegido.",
      },
      {
        question: "Hay costo por no vender?",
        answer:
          "No hay penalizacion por retirar la publicacion. Pagas comision cuando concretas la venta.",
      },
    ],
    finalTitle: "Vende con velocidad y control",
    finalDescription:
      "Activa tu publicacion hoy y recibe apoyo comercial para cerrar de forma segura y transparente.",
    finalPrimary: {
      href: "/contacto",
      label: "Empezar mi publicacion",
      eventName: "vende_rapido_final_primary",
    },
    finalSecondary: {
      href: "/faq",
      label: "Resolver dudas frecuentes",
      eventName: "vende_rapido_final_secondary",
    },
  },
  "dealers-hub": {
    kind: "standard",
    title: "Dealers Hub C4R",
    description:
      "Herramientas para concesionarios y flotas: inventario validado, leads calificados y analitica comercial.",
    badge: "Solucion B2B",
    heroImage:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    heroAlt: "Gestion profesional de inventario para dealers",
    primaryCta: {
      href: "/dealers",
      label: "Abrir dashboard dealers",
      eventName: "dealers_hub_primary_cta",
    },
    secondaryCta: {
      href: "/dealer-registro",
      label: "Iniciar registro dealer",
      eventName: "dealers_hub_secondary_cta",
    },
    metrics: [
      { value: "30+", label: "Publicaciones activas por plan Pro" },
      { value: "2-5%", label: "Comision para volumen" },
      { value: "API", label: "Integracion con sistemas internos" },
      { value: "24/7", label: "Soporte de operaciones" },
    ],
    highlightsTitle: "Capacidades clave para equipos de venta",
    highlights: [
      {
        title: "Gestion de inventario",
        description: "Centraliza stock, estado de unidades, dias en patio y rendimiento por modelo.",
        icon: ClipboardList,
      },
      {
        title: "Leads calificados",
        description: "Prioriza oportunidades con mayor probabilidad de cierre y trazabilidad comercial.",
        icon: Users,
      },
      {
        title: "Reportes y control",
        description: "Mide conversion, ticket promedio y tiempos de venta con paneles ejecutivos.",
        icon: BarChart3,
      },
    ],
    stepsTitle: "Onboarding de dealers en 4 fases",
    steps: [
      {
        title: "1. Diagnostico inicial",
        description: "Levantamos necesidades de inventario, equipo y procesos comerciales.",
      },
      {
        title: "2. Configuracion de cuenta",
        description: "Estructuramos roles, publicaciones, reglas de aprobacion y branding.",
      },
      {
        title: "3. Carga masiva o sincronizacion",
        description: "Incorporamos unidades via panel o integracion para salir rapido al mercado.",
      },
      {
        title: "4. Acompanamiento de resultados",
        description: "Monitoreamos conversion y ajustamos estrategia de captacion con tu equipo.",
      },
    ],
    showcaseTitle: "Casos de uso para concesionarios",
    showcase: [
      {
        title: "Inventario con trazabilidad completa",
        description: "Estado por unidad, revisiones y embudo comercial en una sola vista.",
        image:
          "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/dealers/inventory",
        cta: "Ver inventario dealers",
      },
      {
        title: "Leads B2B priorizados",
        description: "Calificacion y seguimiento para reducir tiempo de cierre.",
        image:
          "https://images.unsplash.com/photo-1549317336-206569e8475c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/dealers/leads",
        cta: "Abrir gestion de leads",
      },
      {
        title: "Analitica para gerencia",
        description: "Indicadores diarios de performance comercial por canal y sucursal.",
        image:
          "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/dealers/reports",
        cta: "Revisar reportes",
      },
    ],
    faqTitle: "Preguntas frecuentes para dealers",
    faqs: [
      {
        question: "Puedo integrar mi CRM o DMS actual?",
        answer: "Si, el plan Enterprise contempla integraciones y soporte tecnico dedicado para implementacion.",
      },
      {
        question: "Existe limite de publicaciones?",
        answer:
          "Depende del plan. Pro contempla un volumen definido y Enterprise permite una operacion mas amplia.",
      },
      {
        question: "Que soporte incluye el servicio?",
        answer:
          "Incluye onboarding, soporte operativo y acompanamiento comercial para mejorar el cierre de oportunidades.",
      },
      {
        question: "Que perfil de equipo necesita usar la plataforma?",
        answer:
          "Puede operar equipo comercial y administrativo con roles separados para mantener control interno.",
      },
    ],
    finalTitle: "Escala tu negocio automotriz con C4R",
    finalDescription:
      "Transforma tu operacion de ventas con una plataforma enfocada en confianza, trazabilidad y conversion.",
    finalPrimary: {
      href: "/dealers",
      label: "Entrar al dashboard",
      eventName: "dealers_hub_final_primary",
    },
    finalSecondary: {
      href: "/dealer-registro",
      label: "Crear cuenta dealer",
      eventName: "dealers_hub_final_secondary",
    },
  },
  "como-funciona": {
    kind: "standard",
    title: "Como funciona C4R",
    description:
      "Conoce el flujo completo de compra y venta segura: chequeo, publicacion, pago protegido y garantia.",
    badge: "Proceso C4R",
    heroImage:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    heroAlt: "Proceso de compra y venta segura en C4R",
    primaryCta: {
      href: "/app/explorar",
      label: "Ver autos verificados",
      eventName: "como_funciona_primary_cta",
    },
    secondaryCta: {
      href: "/c4r-check",
      label: "Probar C4R Check",
      eventName: "como_funciona_secondary_cta",
    },
    metrics: [
      { value: "3 pasos", label: "Flujo principal de compra" },
      { value: "100%", label: "Transacciones con pago protegido" },
      { value: "7 dias", label: "Cobertura de garantia" },
      { value: "24/7", label: "Canal de soporte" },
    ],
    highlightsTitle: "Pilares del modelo de confianza C4R",
    highlights: [
      {
        title: "Validacion previa de vehiculos",
        description: "Revisamos antecedentes legales y tecnicos para reducir riesgo desde el origen.",
        icon: Search,
      },
      {
        title: "Dinero protegido",
        description: "El pago se mantiene retenido hasta confirmar recepcion conforme del vehiculo.",
        icon: CreditCard,
      },
      {
        title: "Garantia post entrega",
        description: "Activas C4R Shield para resolver incidencias dentro del plazo establecido.",
        icon: Shield,
      },
    ],
    stepsTitle: "El flujo operativo en C4R",
    steps: [
      {
        title: "1. Publicacion y verificacion",
        description: "El vendedor ingresa datos y C4R valida informacion clave antes de mostrar el aviso.",
      },
      {
        title: "2. Negociacion y pago protegido",
        description: "Comprador y vendedor acuerdan condiciones con soporte transaccional de la plataforma.",
      },
      {
        title: "3. Entrega y confirmacion",
        description: "Se libera el pago tras recepcion conforme y queda habilitada la garantia C4R Shield.",
      },
    ],
    showcaseTitle: "Herramientas que soportan el proceso",
    showcase: [
      {
        title: "C4R Check",
        description: "Reporte legal y tecnico por patente para tomar decisiones informadas.",
        image:
          "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/c4r-check",
        cta: "Consultar reporte",
      },
      {
        title: "C4R Score",
        description: "Indice de riesgo para priorizar revisiones y detectar alertas tempranas.",
        image:
          "https://images.unsplash.com/photo-1549317336-206569e8475c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/c4r-score",
        cta: "Calcular score",
      },
      {
        title: "Catalogo verificado",
        description: "Publicaciones con estandar de calidad y trazabilidad documental.",
        image:
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/app/explorar",
        cta: "Explorar catalogo",
      },
    ],
    faqTitle: "Preguntas frecuentes sobre el proceso",
    faqs: [
      {
        question: "C4R reemplaza la revision mecanica presencial?",
        answer: "No. La verificacion digital complementa la inspeccion fisica para reducir riesgo de forma integral.",
      },
      {
        question: "El pago protegido tiene costo adicional?",
        answer: "El costo se informa en el flujo de transaccion segun tipo de operacion y plan contratado.",
      },
      {
        question: "Que incluye exactamente C4R Shield?",
        answer:
          "Cobertura para casos elegibles de fallas no declaradas y discrepancias relevantes en los primeros dias.",
      },
      {
        question: "Que pasa si hay disputa entre comprador y vendedor?",
        answer:
          "C4R activa mediacion con evidencia y definicion de ruta de solucion segun politicas vigentes.",
      },
    ],
    finalTitle: "Empieza tu operacion segura hoy",
    finalDescription:
      "Ya sea para comprar o vender, C4R te entrega un marco claro para operar con menos riesgo.",
    finalPrimary: {
      href: "/app/explorar",
      label: "Ir a explorar",
      eventName: "como_funciona_final_primary",
    },
    finalSecondary: {
      href: "/contacto",
      label: "Contactar equipo C4R",
      eventName: "como_funciona_final_secondary",
    },
  },
  precios: {
    kind: "pricing",
    title: "Precios claros para personas y empresas",
    description:
      "Elige un plan segun tu volumen: desde publicar sin costo hasta soluciones para equipos comerciales.",
    badge: "Planes C4R",
    plans: [
      {
        name: "Gratis",
        subtitle: "Para particulares",
        price: "$0",
        features: [
          "Publicacion inicial de vehiculo",
          "1 validacion C4R Check incluida",
          "Acceso a soporte por email",
          "Panel basico de seguimiento",
        ],
        cta: {
          href: "/contacto",
          label: "Comenzar gratis",
          eventName: "pricing_plan_gratis",
        },
      },
      {
        name: "Pro",
        subtitle: "Para dealers en crecimiento",
        price: "$89.000 / mes",
        popular: true,
        features: [
          "Hasta 30 publicaciones activas",
          "Validaciones ilimitadas",
          "Leads calificados",
          "Dashboard comercial",
          "Soporte prioritario",
        ],
        cta: {
          href: "/contacto",
          label: "Solicitar plan Pro",
          eventName: "pricing_plan_pro",
        },
      },
      {
        name: "Enterprise",
        subtitle: "Para flotas y grupos",
        price: "Precio personalizado",
        features: [
          "Publicaciones de alto volumen",
          "Integraciones API/CRM",
          "Analitica avanzada",
          "Soporte dedicado 24/7",
          "Onboarding especializado",
        ],
        cta: {
          href: "/contacto",
          label: "Hablar con ventas Enterprise",
          eventName: "pricing_plan_enterprise",
        },
      },
    ],
    benefitsTitle: "Beneficios transversales en todos los planes",
    benefits: [
      {
        title: "Pago protegido",
        description: "Escrow para reducir riesgo en transacciones de compra y venta.",
        icon: CreditCard,
      },
      {
        title: "Validacion de datos",
        description: "Estandares de calidad en publicaciones y antecedentes de vehiculos.",
        icon: CheckCircle2,
      },
      {
        title: "Acompanamiento comercial",
        description: "Soporte de expertos para resolver dudas y acelerar conversion.",
        icon: Users,
      },
      {
        title: "Escalabilidad",
        description: "Estructura preparada para crecer desde personas hasta grandes flotas.",
        icon: TrendingUp,
      },
    ],
    faqs: [
      {
        question: "Puedo cambiar de plan en cualquier momento?",
        answer: "Si, puedes migrar de plan segun tu volumen y necesidad operativa.",
      },
      {
        question: "Hay permanencia minima?",
        answer: "No hay permanencia forzosa en los planes estandar. El detalle exacto se informa al contratar.",
      },
      {
        question: "Enterprise incluye integraciones?",
        answer: "Si, contempla integraciones con sistemas de gestion previa evaluacion tecnica.",
      },
      {
        question: "Como solicito una cotizacion formal?",
        answer: "Puedes hacerlo desde Contacto y el equipo comercial te responde con propuesta personalizada.",
      },
    ],
    finalTitle: "Elige el plan que mejor se ajusta a tu operacion",
    finalDescription:
      "Compara alternativas y define la estructura comercial adecuada para tu etapa de crecimiento.",
    finalPrimary: {
      href: "/contacto",
      label: "Solicitar asesoria de planes",
      eventName: "pricing_final_primary",
    },
    finalSecondary: {
      href: "/faq",
      label: "Revisar FAQ de planes",
      eventName: "pricing_final_secondary",
    },
  },
  comunidad: {
    kind: "standard",
    title: "Comunidad C4R",
    description:
      "Conecta con compradores y vendedores que priorizan transparencia, respaldo y buenas practicas automotrices.",
    badge: "Comunidad de confianza",
    heroImage:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    heroAlt: "Comunidad automotriz conectada en C4R",
    primaryCta: {
      href: "/comunidad-c4r",
      label: "Ir a Comunidad C4R",
      eventName: "community_route_primary_cta",
    },
    secondaryCta: {
      href: "/blog",
      label: "Leer contenido de la comunidad",
      eventName: "community_route_secondary_cta",
    },
    metrics: [
      { value: "15.000+", label: "Miembros activos" },
      { value: "98%", label: "Satisfaccion reportada" },
      { value: "4.9/5", label: "Valoracion promedio" },
      { value: "24/7", label: "Acompanamiento y soporte" },
    ],
    highlightsTitle: "Por que unirte a la comunidad",
    highlights: [
      {
        title: "Contenido util y aplicable",
        description: "Guias y checklists para comprar o vender con mas criterio.",
        icon: FileText,
      },
      {
        title: "Red de usuarios validados",
        description: "Intercambia experiencias con personas y empresas verificadas.",
        icon: Users,
      },
      {
        title: "Beneficios exclusivos",
        description: "Acceso a alertas, novedades y servicios prioritarios.",
        icon: Shield,
      },
    ],
    stepsTitle: "Como aprovechar la comunidad C4R",
    steps: [
      {
        title: "1. Crea tu perfil y preferencias",
        description: "Define tus objetivos para recibir recomendaciones de contenido y oportunidades.",
      },
      {
        title: "2. Participa en contenido y foros",
        description: "Consulta casos reales, aprende practicas y comparte tus dudas.",
      },
      {
        title: "3. Activa beneficios",
        description: "Usa descuentos, prioridad de soporte y acceso anticipado segun tu plan.",
      },
    ],
    showcaseTitle: "Historias y recursos destacados",
    showcase: [
      {
        title: "Checklist de compra segura",
        description: "Documento practico para evaluar un auto usado antes de cerrar trato.",
        image:
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/blog",
        cta: "Ver contenido",
      },
      {
        title: "Guia de financiamiento",
        description: "Comparativa de alternativas para decidir con menos costo total.",
        image:
          "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/blog",
        cta: "Leer guia",
      },
      {
        title: "Caso real de compra protegida",
        description: "Operacion resuelta en 7 dias con soporte completo de C4R.",
        image:
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
        href: "/comunidad-c4r",
        cta: "Ver comunidad",
      },
    ],
    faqTitle: "Preguntas frecuentes sobre comunidad",
    faqs: [
      {
        question: "La comunidad tiene costo?",
        answer: "Existe nivel gratuito y niveles con beneficios extendidos segun plan.",
      },
      {
        question: "Puedo acceder sin haber comprado en C4R?",
        answer: "Si, puedes unirte para aprender y preparar una futura compra o venta.",
      },
      {
        question: "Que tipo de contenido se publica?",
        answer: "Guias, casos reales, novedades del mercado y recomendaciones para operar con mas seguridad.",
      },
      {
        question: "Como reporto una mala experiencia?",
        answer: "Desde contacto o soporte, detallando el caso para activar revision interna.",
      },
    ],
    finalTitle: "Construye confianza junto a la comunidad C4R",
    finalDescription:
      "Participa activamente y accede a contenido experto para tus proximas decisiones automotrices.",
    finalPrimary: {
      href: "/comunidad-c4r",
      label: "Ir a comunidad completa",
      eventName: "community_route_final_primary",
    },
    finalSecondary: {
      href: "/contacto",
      label: "Hablar con soporte",
      eventName: "community_route_final_secondary",
    },
  },
  blog: {
    kind: "blog",
    title: "Blog C4R",
    description:
      "Guias, noticias y casos reales para comprar y vender autos usados con menos riesgo y mejor informacion.",
    badge: "Contenido C4R",
    categories: blogCategories,
    posts: blogPosts.map((post) => ({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      date: post.date,
      image: post.image,
      cta: {
        href: `/blog/${post.slug}`,
        label: "Leer articulo completo",
        eventName: `blog_post_${post.slug}`,
      },
    })),
    finalTitle: "Recibe contenido util para tus proximas decisiones",
    finalDescription:
      "Te enviamos guias practicas y novedades para comprar o vender autos usados con mas criterio.",
    finalPrimary: {
      href: "/contacto",
      label: "Suscribirme a novedades",
      eventName: "blog_final_primary",
    },
    finalSecondary: {
      href: "/comunidad-c4r",
      label: "Unirme a la comunidad",
      eventName: "blog_final_secondary",
    },
  },
  contacto: {
    kind: "contact",
    title: "Contacto C4R",
    description:
      "Habla con el equipo C4R para soporte, alianzas comerciales, dudas de compra o gestiones de venta.",
    badge: "Estamos para ayudarte",
    methods: [
      {
        title: "Soporte general",
        detail: "soporte@c4r.com",
        helper: "Consultas de compra, venta y uso de plataforma",
        href: "mailto:soporte@c4r.com",
        icon: Mail,
      },
      {
        title: "Ventas B2B",
        detail: "b2b@c4r.com",
        helper: "Implementaciones para dealers, flotas y empresas",
        href: "mailto:b2b@c4r.com",
        icon: Users,
      },
      {
        title: "Telefono comercial",
        detail: "+56 2 2345 6789",
        helper: "Atencion de lunes a viernes en horario de oficina",
        href: "tel:+56223456789",
        icon: Phone,
      },
      {
        title: "WhatsApp soporte",
        detail: "+56 9 1234 5678",
        helper: "Canal rapido para seguimiento de casos",
        href: "https://wa.me/56912345678",
        icon: MessageCircle,
      },
    ],
    supportHours: [
      "Lunes a viernes: 09:00 a 18:00",
      "Sabado: 10:00 a 14:00",
      "Domingo y festivos: atencion por tickets criticos",
      "Sede: Av. Apoquindo 1234, Las Condes, Santiago",
    ],
    finalTitle: "Prefieres que te contactemos nosotros?",
    finalDescription:
      "Deja el contexto de tu caso y el equipo correcto se comunicara contigo en menos de 24 horas habiles.",
    finalPrimary: {
      href: "/contacto#formulario-contacto",
      label: "Completar formulario",
      eventName: "contact_final_primary",
    },
    finalSecondary: {
      href: "/faq",
      label: "Revisar preguntas frecuentes",
      eventName: "contact_final_secondary",
    },
  },
  faq: {
    kind: "faq",
    title: "Preguntas frecuentes C4R",
    description:
      "Respuestas claras sobre verificacion, pagos protegidos, garantia C4R Shield y operacion de la plataforma.",
    badge: "Centro de ayuda",
    categories: [
      {
        title: "Compra segura",
        items: [
          {
            question: "Como funciona C4R Shield?",
            answer:
              "Protege compras elegibles durante 7 dias o 300 km para resolver discrepancias relevantes o fallas no declaradas.",
          },
          {
            question: "Es seguro comprar un auto online en C4R?",
            answer:
              "Si. El flujo combina C4R Check, validacion de usuarios y pago protegido para reducir riesgo de fraude.",
          },
          {
            question: "Puedo inspeccionar el auto antes de cerrar?",
            answer:
              "Si. Puedes coordinar visita, prueba y revisiones tecnicas antes de confirmar la operacion.",
          },
        ],
      },
      {
        title: "Venta de vehiculos",
        items: [
          {
            question: "Cuanto demora vender en C4R?",
            answer: "El tiempo depende del mercado, pero el promedio reportado va entre 15 y 30 dias.",
          },
          {
            question: "Que costo tiene publicar?",
            answer:
              "Existen opciones de entrada sin costo y planes escalables para mayor volumen, segun necesidades.",
          },
          {
            question: "Puedo editar una publicacion activa?",
            answer: "Si. Puedes actualizar precio, fotos y detalles para mejorar performance.",
          },
        ],
      },
      {
        title: "Pagos y transacciones",
        items: [
          {
            question: "Cuando se libera el pago al vendedor?",
            answer:
              "Tras la confirmacion de entrega conforme y cumplimiento del flujo definido en la plataforma.",
          },
          {
            question: "Que pasa si hay disputa?",
            answer:
              "El equipo C4R analiza evidencia y activa mediacion para resolver segun politicas vigentes.",
          },
          {
            question: "Aceptan distintos medios de pago?",
            answer:
              "Si. El detalle depende de la operacion y se informa en el proceso de cierre con transparencia.",
          },
        ],
      },
      {
        title: "Cuenta, seguridad y privacidad",
        items: [
          {
            question: "Como se protege mi informacion personal?",
            answer:
              "Aplicamos medidas de seguridad y politicas de privacidad alineadas con normativa local.",
          },
          {
            question: "Puedo eliminar mi cuenta?",
            answer: "Si. Puedes solicitarlo por soporte y se procesa segun politicas de retencion vigentes.",
          },
          {
            question: "Donde reviso terminos y privacidad?",
            answer:
              "Desde las secciones legales del sitio: Terminos, Privacidad, Cookies y Devoluciones.",
          },
        ],
      },
    ],
    finalTitle: "No encontraste tu respuesta?",
    finalDescription:
      "Contacta al equipo C4R y te ayudaremos a resolver tu caso con el contexto de tu compra o venta.",
    finalPrimary: {
      href: "/contacto",
      label: "Contactar soporte",
      eventName: "faq_final_primary",
    },
    finalSecondary: {
      href: "/como-funciona",
      label: "Ver como funciona C4R",
      eventName: "faq_final_secondary",
    },
  },
  terminos: {
    kind: "legal",
    title: "Terminos y condiciones",
    description:
      "Condiciones de uso de la plataforma C4R, obligaciones de usuarios y alcance de los servicios ofrecidos.",
    updatedAt: "15 de diciembre de 2024",
    sections: [
      {
        title: "1. Alcance del servicio",
        paragraphs: [
          "C4R facilita operaciones de compra y venta de vehiculos usados mediante herramientas de verificacion, pagos protegidos y soporte transaccional.",
          "El uso de la plataforma implica aceptacion de estas condiciones y de las politicas complementarias publicadas en el sitio.",
        ],
      },
      {
        title: "2. Requisitos de uso",
        paragraphs: [
          "Para operar en C4R debes entregar informacion veraz, mantener tus datos actualizados y utilizar la plataforma para fines legitimos.",
        ],
        bullets: [
          "Ser mayor de edad o actuar con representacion valida.",
          "No publicar vehiculos con informacion falsa o incompleta.",
          "No usar la plataforma para actividades fraudulentas.",
        ],
      },
      {
        title: "3. Publicaciones, pagos y cierre",
        paragraphs: [
          "Las publicaciones pueden estar sujetas a validaciones previas para proteger a compradores y vendedores.",
          "Las transacciones pueden requerir pago protegido para resguardar cumplimiento de condiciones acordadas.",
        ],
        bullets: [
          "C4R puede solicitar documentacion adicional en operaciones de riesgo.",
          "La liberacion de fondos ocurre segun reglas de entrega y confirmacion.",
          "Las comisiones y cargos se informan antes de confirmar la operacion.",
        ],
      },
      {
        title: "4. Limitaciones y responsabilidad",
        paragraphs: [
          "C4R actua como intermediario tecnologico y no sustituye la debida diligencia mecanica y legal que cada parte debe realizar.",
          "Ante disputas, C4R puede mediar conforme politicas internas y evidencia disponible.",
        ],
      },
      {
        title: "5. Cambios y contacto legal",
        paragraphs: [
          "Estos terminos pueden actualizarse para reflejar cambios regulatorios o de operacion.",
          "Consultas legales: legal@c4r.com.",
        ],
      },
    ],
    finalTitle: "Necesitas aclarar un punto legal?",
    finalDescription: "Nuestro equipo puede orientarte sobre el uso correcto de la plataforma y sus condiciones.",
    finalPrimary: {
      href: "/contacto",
      label: "Contactar equipo legal",
      eventName: "terminos_final_primary",
    },
    finalSecondary: {
      href: "/privacidad",
      label: "Ver politica de privacidad",
      eventName: "terminos_final_secondary",
    },
  },
  privacidad: {
    kind: "legal",
    title: "Politica de privacidad",
    description:
      "Como recopilamos, usamos y protegemos tus datos personales al operar dentro de la plataforma C4R.",
    updatedAt: "15 de diciembre de 2024",
    sections: [
      {
        title: "1. Datos que recopilamos",
        paragraphs: [
          "Recolectamos datos de registro, contacto y operacion necesarios para habilitar transacciones seguras.",
        ],
        bullets: [
          "Datos de identidad y contacto.",
          "Informacion de vehiculos y publicaciones.",
          "Eventos de uso para mejorar servicio y seguridad.",
        ],
      },
      {
        title: "2. Finalidad del tratamiento",
        paragraphs: [
          "Usamos tus datos para operar la plataforma, prevenir fraude, soportar transacciones y brindar acompanamiento.",
        ],
        bullets: [
          "Gestion de cuentas y soporte.",
          "Validaciones de seguridad y cumplimiento.",
          "Comunicaciones operativas y comerciales autorizadas.",
        ],
      },
      {
        title: "3. Conservacion y seguridad",
        paragraphs: [
          "Aplicamos controles tecnicos y organizacionales para proteger la informacion en transito y almacenamiento.",
          "Retenemos datos solo por el tiempo necesario para fines operativos, legales y regulatorios.",
        ],
      },
      {
        title: "4. Derechos del titular",
        paragraphs: [
          "Puedes solicitar acceso, rectificacion, eliminacion u oposicion respecto de tus datos personales.",
          "Consultas y solicitudes: privacidad@c4r.com.",
        ],
      },
      {
        title: "5. Comparticion con terceros",
        paragraphs: [
          "Compartimos informacion solo cuando es necesario para ejecutar el servicio o cumplir exigencias legales.",
          "No comercializamos datos personales para fines ajenos a la operacion de C4R.",
        ],
      },
    ],
    finalTitle: "Quieres ejercer tus derechos de datos?",
    finalDescription: "Escribenos y te guiaremos con el procedimiento correspondiente.",
    finalPrimary: {
      href: "/contacto",
      label: "Solicitar gestion de datos",
      eventName: "privacidad_final_primary",
    },
    finalSecondary: {
      href: "/cookies",
      label: "Revisar politica de cookies",
      eventName: "privacidad_final_secondary",
    },
  },
  cookies: {
    kind: "legal",
    title: "Politica de cookies",
    description:
      "Detalles de cookies usadas para experiencia, analitica y seguridad, junto con tus opciones de control.",
    updatedAt: "15 de diciembre de 2024",
    sections: [
      {
        title: "1. Que son y para que sirven",
        paragraphs: [
          "Las cookies son archivos que permiten recordar preferencias y mejorar funcionamiento del sitio.",
          "En C4R las usamos para seguridad, experiencia de navegacion y medicion de rendimiento.",
        ],
      },
      {
        title: "2. Tipos de cookies utilizadas",
        paragraphs: [
          "Utilizamos cookies necesarias para operacion, de preferencia para personalizacion y analiticas para mejora continua.",
        ],
        bullets: [
          "Cookies esenciales de sesion y autenticacion.",
          "Cookies de preferencias de usuario.",
          "Cookies analiticas y de rendimiento.",
          "Cookies de marketing cuando hay consentimiento.",
        ],
      },
      {
        title: "3. Gestion de preferencias",
        paragraphs: [
          "Puedes ajustar el uso de cookies desde configuracion del navegador y herramientas del sitio cuando esten disponibles.",
          "Desactivar cookies esenciales puede afectar funciones criticas como inicio de sesion o checkout.",
        ],
      },
      {
        title: "4. Proveedores de terceros",
        paragraphs: [
          "Algunas herramientas externas pueden establecer cookies para analitica o soporte.",
          "Recomendamos revisar las politicas de esos proveedores para conocer sus practicas.",
        ],
      },
      {
        title: "5. Actualizaciones de esta politica",
        paragraphs: [
          "Podemos ajustar esta politica para reflejar cambios regulatorios o tecnicos.",
          "Las modificaciones relevantes se comunican en el sitio.",
        ],
      },
    ],
    finalTitle: "Necesitas ayuda para gestionar cookies?",
    finalDescription: "Nuestro equipo puede orientarte sobre privacidad y configuracion de tu experiencia.",
    finalPrimary: {
      href: "/contacto",
      label: "Contactar soporte de privacidad",
      eventName: "cookies_final_primary",
    },
    finalSecondary: {
      href: "/privacidad",
      label: "Volver a privacidad",
      eventName: "cookies_final_secondary",
    },
  },
  devoluciones: {
    kind: "legal",
    title: "Politica de devoluciones y garantia C4R Shield",
    description:
      "Condiciones, plazos y alcance de C4R Shield para gestionar devoluciones elegibles de forma transparente.",
    updatedAt: "15 de diciembre de 2024",
    sections: [
      {
        title: "1. Cobertura C4R Shield",
        paragraphs: [
          "C4R Shield aplica durante 7 dias o 300 km desde la entrega para casos elegibles definidos por politica.",
          "La evaluacion considera evidencia, antecedentes de publicacion y reporte tecnico cuando corresponda.",
        ],
      },
      {
        title: "2. Casos cubiertos",
        paragraphs: [
          "La garantia se activa ante discrepancias relevantes respecto de lo informado o fallas no declaradas.",
        ],
        bullets: [
          "Problemas mecanicos relevantes no informados.",
          "Diferencias sustantivas con la descripcion del aviso.",
          "Incidencias documentales criticas que impidan operacion normal.",
        ],
      },
      {
        title: "3. Proceso de solicitud",
        paragraphs: [
          "Debes reportar el caso dentro del plazo de cobertura entregando evidencia clara del problema.",
        ],
        bullets: [
          "Contacto inicial con soporte C4R.",
          "Revision documental y tecnica del caso.",
          "Definicion de resolucion y coordinacion operativa.",
        ],
      },
      {
        title: "4. Exclusiones y limites",
        paragraphs: [
          "No se cubren casos de desgaste normal, danos posteriores a la entrega o intervenciones no autorizadas.",
          "Las condiciones completas se informan en el flujo contractual de cada transaccion.",
        ],
      },
      {
        title: "5. Reembolsos y tiempos",
        paragraphs: [
          "Una vez aprobada una devolucion, se procesan reembolsos segun medio de pago y tiempos operativos del sistema financiero.",
          "C4R mantiene comunicacion activa durante todo el seguimiento.",
        ],
      },
    ],
    finalTitle: "Necesitas activar C4R Shield?",
    finalDescription:
      "Contacta soporte con tu numero de operacion para revisar cobertura y pasos de resolucion.",
    finalPrimary: {
      href: "/contacto",
      label: "Iniciar solicitud de soporte",
      eventName: "devoluciones_final_primary",
    },
    finalSecondary: {
      href: "/faq",
      label: "Revisar FAQ de garantia",
      eventName: "devoluciones_final_secondary",
    },
  },
};

const isMarketingSlug = (value: string): value is MarketingSlug => marketingSlugs.includes(value as MarketingSlug);

const isExternalHref = (href: string) =>
  href.startsWith("http://") ||
  href.startsWith("https://") ||
  href.startsWith("mailto:") ||
  href.startsWith("tel:");

export const dynamicParams = false;

export function generateStaticParams() {
  return marketingSlugs.map((slug) => ({ slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isMarketingSlug(slug)) {
    return { title: "C4R" };
  }

  const page = pages[slug];

  return {
    title: `${page.title} | C4R`,
    description: page.description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: `${page.title} | C4R`,
      description: page.description,
      url: `/${slug}`,
      type: "website",
      images: [
        {
          url: "/og-c4r.svg",
          width: 1200,
          height: 630,
          alt: "C4R",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${page.title} | C4R`,
      description: page.description,
      images: ["/og-c4r.svg"],
    },
  };
}

function CtaButton({
  cta,
  className,
  variant = "primary",
}: {
  cta: Cta;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const baseClass =
    variant === "primary"
      ? "inline-flex h-11 items-center justify-center rounded-md bg-khaki px-6 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
      : "inline-flex h-11 items-center justify-center rounded-md border border-ink px-6 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white";

  return (
    <TrackedLink href={cta.href} eventName={cta.eventName} className={`${baseClass} ${className ?? ""}`}>
      {cta.label}
    </TrackedLink>
  );
}

function renderStandardPage(page: StandardPageContent, slug: MarketingSlug) {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(176,161,110,0.18),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
              {page.badge}
            </span>
            <h1 className="mt-5 font-heading text-4xl font-bold text-ink sm:text-5xl">{page.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">{page.description}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <CtaButton cta={page.primaryCta} />
              {page.secondaryCta ? <CtaButton cta={page.secondaryCta} variant="secondary" /> : null}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-platinum shadow-[0_30px_90px_-40px_rgba(44,44,44,0.5)]">
            <Image src={page.heroImage} alt={page.heroAlt} width={1200} height={800} className="h-auto w-full object-cover" />
            <span className="absolute right-4 top-4 rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
              C4R Verificado
            </span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-4 lg:px-8">
          {page.metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-platinum bg-white p-5 text-center shadow-sm">
              <p className="font-heading text-2xl font-bold text-khaki">{metric.value}</p>
              <p className="mt-1 text-sm text-gray-600">{metric.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-platinum py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">{page.highlightsTitle}</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {page.highlights.map((item) => (
              <article key={item.title} className="rounded-xl border border-platinum bg-white p-6 shadow-sm">
                <item.icon className="h-8 w-8 text-khaki" />
                <h3 className="mt-4 font-heading text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">{page.stepsTitle}</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {page.steps.map((step, index) => (
              <article key={step.title} className="rounded-xl border border-platinum bg-white p-6 shadow-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-khaki text-sm font-semibold text-ink">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-platinum py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">{page.showcaseTitle}</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {page.showcase.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-xl border border-platinum bg-white shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="space-y-3 p-5">
                  <h3 className="font-heading text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <TrackedLink
                    href={item.href}
                    eventName={`${slug}_showcase_cta`}
                    eventParams={{ card: item.title }}
                    className="inline-flex items-center text-sm font-semibold text-khaki transition-colors hover:text-khaki-dark"
                  >
                    {item.cta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </TrackedLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">{page.faqTitle}</h2>
          <div className="mt-10 space-y-4">
            {page.faqs.map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-platinum bg-white p-5 shadow-sm">
                <summary className="cursor-pointer list-none font-semibold text-ink">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white">{page.finalTitle}</h2>
          <p className="mt-4 text-lg text-gray-300">{page.finalDescription}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <CtaButton cta={page.finalPrimary} />
            {page.finalSecondary ? (
              <CtaButton
                cta={page.finalSecondary}
                variant="secondary"
                className="border-white text-white hover:bg-white hover:text-ink"
              />
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function renderPricingPage(page: PricingPageContent) {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <span className="inline-flex rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
            {page.badge}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold text-ink sm:text-5xl">{page.title}</h1>
          <p className="mt-6 text-lg text-gray-600">{page.description}</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-3 lg:px-8">
          {page.plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm ${
                plan.popular ? "border-khaki ring-2 ring-khaki/30" : "border-platinum"
              }`}
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-khaki px-3 py-1 text-xs font-semibold text-ink">
                  Mas elegido
                </span>
              ) : null}
              <h2 className="font-heading text-xl font-semibold text-ink">{plan.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{plan.subtitle}</p>
              <p className="mt-4 font-heading text-3xl font-bold text-khaki">{plan.price}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={`${plan.name}-${feature}`} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-khaki" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <CtaButton cta={plan.cta} className="mt-7 w-full" />
            </article>
          ))}
        </div>
      </section>

      <section className="bg-platinum py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">{page.benefitsTitle}</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {page.benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-xl border border-platinum bg-white p-6 shadow-sm">
                <benefit.icon className="h-7 w-7 text-khaki" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{benefit.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">Preguntas frecuentes sobre precios</h2>
          <div className="mt-10 space-y-4">
            {page.faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-platinum bg-white p-5 shadow-sm">
                <summary className="cursor-pointer list-none font-semibold text-ink">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white">{page.finalTitle}</h2>
          <p className="mt-4 text-lg text-gray-300">{page.finalDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton cta={page.finalPrimary} />
            <CtaButton
              cta={page.finalSecondary}
              variant="secondary"
              className="border-white text-white hover:bg-white hover:text-ink"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function renderBlogPage(page: BlogPageContent) {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <span className="inline-flex rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
            {page.badge}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold text-ink sm:text-5xl">{page.title}</h1>
          <p className="mt-6 text-lg text-gray-600">{page.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {page.categories.map((category) => (
              <span key={category} className="rounded-full border border-platinum bg-white px-3 py-1 text-sm text-gray-700">
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {page.posts.map((post) => (
            <article key={post.title} className="overflow-hidden rounded-xl border border-platinum bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h2 className="font-heading text-lg font-semibold text-ink">{post.title}</h2>
                <p className="text-sm text-gray-600">{post.excerpt}</p>
                <CtaButton cta={post.cta} className="h-10 w-full" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-platinum py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-ink">{page.finalTitle}</h2>
          <p className="mt-4 text-lg text-gray-600">{page.finalDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton cta={page.finalPrimary} />
            <CtaButton cta={page.finalSecondary} variant="secondary" />
          </div>
        </div>
      </section>
    </main>
  );
}

function renderContactPage(page: ContactPageContent) {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <span className="inline-flex rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
            {page.badge}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold text-ink sm:text-5xl">{page.title}</h1>
          <p className="mt-6 text-lg text-gray-600">{page.description}</p>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {page.methods.map((method) => (
            <article key={method.title} className="rounded-xl border border-platinum bg-white p-6 shadow-sm">
              <method.icon className="h-7 w-7 text-khaki" />
              <h2 className="mt-4 font-heading text-lg font-semibold text-ink">{method.title}</h2>
              <a
                href={method.href}
                className="mt-2 block text-sm font-semibold text-khaki transition-colors hover:text-khaki-dark"
                target={isExternalHref(method.href) && method.href.startsWith("http") ? "_blank" : undefined}
                rel={isExternalHref(method.href) && method.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {method.detail}
              </a>
              <p className="mt-2 text-sm text-gray-600">{method.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <ContactForm />

      <section className="bg-platinum py-14">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-bold text-ink">Horarios y ubicacion de atencion</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {page.supportHours.map((line) => (
              <article key={line} className="rounded-xl border border-platinum bg-white p-4 text-sm text-gray-700">
                <span className="inline-flex items-center gap-2">
                  {line.includes("Sede") ? (
                    <MapPin className="h-4 w-4 text-khaki" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-khaki" />
                  )}
                  {line}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white">{page.finalTitle}</h2>
          <p className="mt-4 text-lg text-gray-300">{page.finalDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton cta={page.finalPrimary} />
            <CtaButton
              cta={page.finalSecondary}
              variant="secondary"
              className="border-white text-white hover:bg-white hover:text-ink"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function renderFaqPage(page: FaqPageContent) {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <span className="inline-flex rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
            {page.badge}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold text-ink sm:text-5xl">{page.title}</h1>
          <p className="mt-6 text-lg text-gray-600">{page.description}</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-5xl space-y-8 px-6 lg:px-8">
          {page.categories.map((category) => (
            <article key={category.title} className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
              <h2 className="inline-flex items-center gap-2 font-heading text-2xl font-semibold text-ink">
                <CircleHelp className="h-5 w-5 text-khaki" />
                {category.title}
              </h2>
              <div className="mt-6 space-y-4">
                {category.items.map((item) => (
                  <details key={item.question} className="rounded-xl border border-platinum bg-white p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-ink">{item.question}</summary>
                    <p className="mt-3 text-sm leading-7 text-gray-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white">{page.finalTitle}</h2>
          <p className="mt-4 text-lg text-gray-300">{page.finalDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton cta={page.finalPrimary} />
            <CtaButton
              cta={page.finalSecondary}
              variant="secondary"
              className="border-white text-white hover:bg-white hover:text-ink"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function renderLegalPage(page: LegalPageContent, slug: MarketingSlug) {
  const iconBySlug: Partial<Record<MarketingSlug, LucideIcon>> = {
    terminos: Scale,
    privacidad: Shield,
    cookies: Cookie,
    devoluciones: ClipboardList,
  };

  const HeroIcon = iconBySlug[slug] ?? FileText;

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-platinum bg-white py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
            <HeroIcon className="h-4 w-4" />
            Documento legal C4R
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold text-ink sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">{page.description}</p>
          <p className="mt-3 text-sm text-gray-500">Ultima actualizacion: {page.updatedAt}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-5xl space-y-8 px-6 lg:px-8">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl font-semibold text-ink">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={`${section.title}-${paragraph}`}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={`${section.title}-${bullet}`}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white">{page.finalTitle}</h2>
          <p className="mt-4 text-lg text-gray-300">{page.finalDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton cta={page.finalPrimary} />
            <CtaButton
              cta={page.finalSecondary}
              variant="secondary"
              className="border-white text-white hover:bg-white hover:text-ink"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default async function GenericPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isMarketingSlug(slug)) {
    notFound();
  }

  const page = pages[slug];

  if (page.kind === "standard") {
    return renderStandardPage(page, slug);
  }

  if (page.kind === "pricing") {
    return renderPricingPage(page);
  }

  if (page.kind === "blog") {
    return renderBlogPage(page);
  }

  if (page.kind === "contact") {
    return renderContactPage(page);
  }

  if (page.kind === "faq") {
    return renderFaqPage(page);
  }

  return renderLegalPage(page, slug);
}

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  author: string;
  readTime: string;
  seoDescription: string;
  keyTakeaways: string[];
  sections: BlogSection[];
  finalCtaLabel: string;
  finalCtaHref: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "checklist-compra-auto-usado",
    title: "Checklist para comprar un auto usado sin sorpresas",
    excerpt:
      "Una guia paso a paso para validar documentos, estado mecanico y condiciones de pago antes de cerrar.",
    category: "Compra segura",
    date: "15 Ene 2026",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=700&q=80",
    author: "Equipo Editorial C4R",
    readTime: "6 min",
    seoDescription:
      "Checklist practico para revisar un auto usado antes de comprar y reducir riesgo legal, tecnico y financiero.",
    keyTakeaways: [
      "Verifica identidad del vendedor y coincidencia con los documentos del vehiculo.",
      "Solicita reporte legal y tecnico antes de cualquier reserva.",
      "No cierres sin prueba en ruta e inspeccion mecanica independiente.",
      "Usa pago protegido para evitar fraudes en transferencia.",
    ],
    sections: [
      {
        heading: "1. Validacion documental",
        paragraphs: [
          "Pide padron, permisos y revisa que los datos coincidan con chasis, motor y patente.",
          "Confirma multas, prendas y prohibiciones de enajenar en el historial legal actualizado.",
        ],
      },
      {
        heading: "2. Inspeccion tecnica",
        paragraphs: [
          "Realiza inspeccion visual completa y prueba de manejo en ciudad y carretera.",
          "Un informe mecanico independiente puede ahorrarte costos altos despues de la compra.",
        ],
        bullets: [
          "Estado de frenos, suspension y direccion",
          "Fugas, ruidos anormales y temperatura de motor",
          "Neumaticos con desgaste parejo",
        ],
      },
      {
        heading: "3. Cierre seguro",
        paragraphs: [
          "Define por escrito condiciones de entrega, kilometraje y accesorios incluidos.",
          "Prioriza metodos de pago con trazabilidad y liberacion condicionada a recepcion conforme.",
        ],
      },
    ],
    finalCtaLabel: "Probar C4R Check",
    finalCtaHref: "/c4r-check",
  },
  {
    slug: "vender-auto-rapido-sin-bajar-precio",
    title: "Como vender en menos tiempo sin bajar demasiado el precio",
    excerpt:
      "Estrategias de publicacion, fotos y negociacion para mejorar conversion manteniendo margen.",
    category: "Venta inteligente",
    date: "12 Ene 2026",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=700&q=80",
    author: "Equipo Comercial C4R",
    readTime: "5 min",
    seoDescription:
      "Recomendaciones para vender un auto usado mas rapido sin castigar el precio final.",
    keyTakeaways: [
      "Publica con fotos claras y datos tecnicos completos.",
      "Define precio competitivo con margen de negociacion realista.",
      "Responde rapido para no perder leads calientes.",
      "Usa score y verificacion para aumentar confianza del comprador.",
    ],
    sections: [
      {
        heading: "Presentacion que convierte",
        paragraphs: [
          "Las publicaciones con fotos en buena luz y descripcion precisa generan mejor tasa de contacto.",
          "Incluye kilometraje real, mantenciones recientes y puntos a mejorar para evitar fricciones en visitas.",
        ],
      },
      {
        heading: "Precio con estrategia",
        paragraphs: [
          "Compara al menos 5 referencias de mercado del mismo segmento y ano.",
          "Define tu piso de cierre antes de negociar para no improvisar bajo presion.",
        ],
      },
      {
        heading: "Gestion de interesados",
        paragraphs: [
          "Filtra consultas por seriedad y capacidad de pago.",
          "Agenda visitas con checklists para mostrar el estado real del auto en menos tiempo.",
        ],
      },
    ],
    finalCtaLabel: "Publicar mi auto",
    finalCtaHref: "/vende-rapido",
  },
  {
    slug: "errores-financiar-auto-usado",
    title: "Errores comunes al financiar un auto usado",
    excerpt:
      "Que variables comparar para no comprometer flujo de caja y evitar costos ocultos en el credito.",
    category: "Financiamiento",
    date: "10 Ene 2026",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=700&q=80",
    author: "Mesa Financiera C4R",
    readTime: "7 min",
    seoDescription:
      "Errores frecuentes al financiar un auto usado y como compararlos correctamente.",
    keyTakeaways: [
      "No compares solo cuota: revisa CAE, seguros y comisiones.",
      "Evita plazos excesivos que eleven costo total.",
      "Incluye mantenciones y seguro en el flujo mensual.",
      "Preaprueba financiamiento antes de reservar.",
    ],
    sections: [
      {
        heading: "Comparacion correcta de creditos",
        paragraphs: [
          "Dos cuotas parecidas pueden tener costos totales muy distintos por tasa y comisiones.",
          "Solicita hoja de costos completa antes de firmar cualquier documento.",
        ],
      },
      {
        heading: "Impacto en flujo de caja",
        paragraphs: [
          "La cuota no deberia consumir tu liquidez operativa mensual.",
          "Considera gastos fijos del vehiculo: combustible, seguro, permisos y mantenciones.",
        ],
      },
      {
        heading: "Buenas practicas antes de cerrar",
        paragraphs: [
          "Negocia el pie segun tu capacidad real y no por presion de cierre.",
          "Mantener margen para imprevistos reduce mora y decisiones apresuradas.",
        ],
      },
    ],
    finalCtaLabel: "Evaluar planes",
    finalCtaHref: "/precios",
  },
  {
    slug: "documentacion-clave-transferencia",
    title: "Documentacion critica antes de transferir",
    excerpt:
      "Resumen de revisiones legales para evitar rechazos, multas pendientes o conflictos posteriores.",
    category: "Legal y documentacion",
    date: "08 Ene 2026",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=700&q=80",
    author: "Legal C4R",
    readTime: "6 min",
    seoDescription:
      "Documentos imprescindibles para una transferencia de auto usado sin bloqueos legales.",
    keyTakeaways: [
      "Padron y permiso de circulacion al dia son base del proceso.",
      "Confirma que no existan prendas, prohibiciones o multas activas.",
      "Firma y respaldo documental deben quedar trazables.",
      "No cierres sin verificar identidad y titularidad.",
    ],
    sections: [
      {
        heading: "Documentos minimos",
        paragraphs: [
          "Antes de transferir, valida padron vigente y permiso del periodo actual.",
          "Verifica certificado de anotaciones para detectar limitaciones legales.",
        ],
      },
      {
        heading: "Validaciones de identidad",
        paragraphs: [
          "El firmante debe coincidir con el propietario registrado o representante autorizado.",
          "Evita firmar con poderes incompletos o documentos vencidos.",
        ],
      },
      {
        heading: "Trazabilidad de cierre",
        paragraphs: [
          "Guarda comprobantes de pago y respaldo de entrega.",
          "Una carpeta digital con todo el expediente simplifica reclamos futuros.",
        ],
      },
    ],
    finalCtaLabel: "Generar C4R Check",
    finalCtaHref: "/c4r-check",
  },
  {
    slug: "tendencias-autos-usados-chile-2026",
    title: "Tendencias 2026 en autos usados en Chile",
    excerpt:
      "Modelos con mayor demanda, variaciones de precio y señales para anticipar mejores oportunidades.",
    category: "Mercado automotriz",
    date: "05 Ene 2026",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=700&q=80",
    author: "Analitica C4R",
    readTime: "5 min",
    seoDescription:
      "Panorama 2026 del mercado de autos usados en Chile: demanda, precios y segmentos en crecimiento.",
    keyTakeaways: [
      "SUV compactos y sedanes eficientes lideran la demanda.",
      "La brecha de precio se amplifica segun historial verificable.",
      "Vehiculos con score alto cierran en menos dias.",
      "La transparencia documental influye mas que la oferta inicial.",
    ],
    sections: [
      {
        heading: "Segmentos con mayor movimiento",
        paragraphs: [
          "SUV compactos mantienen rotacion alta por equilibrio entre espacio y consumo.",
          "Sedanes confiables siguen siendo la puerta de entrada para compra familiar.",
        ],
      },
      {
        heading: "Comportamiento de precios",
        paragraphs: [
          "La diferencia entre unidades verificadas y no verificadas aumenta con la incertidumbre macro.",
          "Historial claro y mantenciones comprobables sostienen mejor el precio objetivo.",
        ],
      },
      {
        heading: "Recomendaciones operativas",
        paragraphs: [
          "Publica con datos completos y reportes adjuntos para acelerar contactos de calidad.",
          "Monitorea tiempos de respuesta y conversion semanal por canal.",
        ],
      },
    ],
    finalCtaLabel: "Explorar catalogo",
    finalCtaHref: "/app/explorar",
  },
  {
    slug: "caso-real-compra-protegida-7-dias",
    title: "Caso real: compra protegida resuelta en 7 dias",
    excerpt:
      "Como un comprador uso C4R Check, escrow y garantia para cerrar una compra con total respaldo.",
    category: "Compra segura",
    date: "03 Ene 2026",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=700&q=80",
    author: "Historias C4R",
    readTime: "4 min",
    seoDescription:
      "Caso real de compra de auto usado con validacion documental, pago protegido y garantia activa.",
    keyTakeaways: [
      "Reporte previo redujo incertidumbre antes de visitar el vehiculo.",
      "Pago protegido ordeno tiempos y entregables entre partes.",
      "Garantia corto plazo dio respaldo ante diferencias post entrega.",
      "Proceso completo se cerro en una semana.",
    ],
    sections: [
      {
        heading: "Contexto inicial",
        paragraphs: [
          "El comprador buscaba un auto familiar con presupuesto acotado y baja tolerancia al riesgo.",
          "Antes de agendar visita, reviso antecedentes legales y score de confianza.",
        ],
      },
      {
        heading: "Ejecucion del cierre",
        paragraphs: [
          "Se acordo pago protegido con hitos claros de recepcion y validacion.",
          "La documentacion quedo respaldada digitalmente para ambas partes.",
        ],
      },
      {
        heading: "Resultado",
        paragraphs: [
          "La entrega se confirmo sin observaciones criticas y el pago se libero segun condiciones.",
          "El comprador activo cobertura y mantuvo seguimiento durante la primera semana.",
        ],
      },
    ],
    finalCtaLabel: "Ver como funciona",
    finalCtaHref: "/como-funciona",
  },
];

export const blogCategories = Array.from(new Set(blogPosts.map((post) => post.category)));

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

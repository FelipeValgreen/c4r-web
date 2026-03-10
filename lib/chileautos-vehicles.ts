export type VehiclePriceItem = {
  type: string;
  amount: number;
};

export type C4RVehicle = {
  id: string;
  slug: string;
  sourceUrl: string;
  make: string;
  model: string;
  year: number;
  title: string;
  bodyStyle: string;
  fuelType: string;
  transmission: string;
  drive: string;
  engine: string | null;
  engineCc: number | null;
  fuelCombined: number | null;
  doors: number | null;
  condition: "Nuevo" | "Usado";
  km: number | null;
  priceClp: number;
  reservationFeeClp: number;
  estimatedMonthlyClp: number;
  versionsAvailable: number;
  dealer: string;
  location: string;
  coverImage: string;
  gallery: string[];
  description: string;
  highlights: string[];
  priceBreakdown: VehiclePriceItem[];
  source: string;
};

export const c4rVehicles: C4RVehicle[] = [
  {
    id: "CL-JATO-ITM-77093502024",
    slug: "jac-js2-2024-502024",
    sourceUrl: "https://www.chileautos.cl/catalogo/SUV/JAC/Js2/CL-JATO-ITM-77093502024",
    make: "JAC",
    model: "Js2",
    year: 2024,
    title: "JAC Js2 2024",
    bodyStyle: "SUV",
    fuelType: "Bencina",
    transmission: "manual",
    drive: "delantera",
    engine: "1.5L",
    engineCc: 1499,
    fuelCombined: 17.6,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 11790000,
    reservationFeeClp: 240000,
    estimatedMonthlyClp: 210000,
    versionsAvailable: 5,
    dealer: "Concesionario oficial Chileautos",
    location: "Santiago",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77093502024/7yztehlbbhzhe3ft8i23v7a3e.jpg",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77093502024/7yztehlbbhzhe3ft8i23v7a3e.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77093502024/8lynm5dyes01gdi3o4tnbvl9d.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77093502024/v3764dasujp8pg68sxooy0tda.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77093502024/00n4hrhximqyhb3hxey8w6qc9.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77093502024/ola59y156m025g3b9rb4iuu51.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77093502024/wlplvzxz9j1jhhpbf3ahuvh2e.jpg"
    ],
    description: "Descubre el JAC JS2, el SUV ideal como primer auto. Equipado con un motor de 1.5 litros VVT que entrega 111 caballos de fuerza y 146 Nm de torque, disponible en transmisión manual y CVT. Su interior sofisticado ofrece espacio para 5 pasajeros y una pantalla táctil compatible con Android Auto y Apple CarPlay. Además, cuenta con luces LED diurnas y neblineros alargados que realzan su aspecto aerodinámico, mientras que su maletero de 450 litros asegura espacio más que suficiente para tus viajes.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 4",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Consumo combustible - extraurbano (km/l)",
      "Consumo combustible - mixto (km/l)"
    ],
    priceBreakdown: [
      {
        type: "JATO",
        amount: 11790000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-83866062025",
    slug: "dongfeng-aeolus-gs-cross-2025-062025",
    sourceUrl: "https://www.chileautos.cl/catalogo/SUV/Dongfeng/Aeolus%20Gs%20Cross/CL-JATO-ITM-83866062025",
    make: "Dongfeng",
    model: "Aeolus Gs Cross",
    year: 2025,
    title: "Dongfeng Aeolus Gs Cross 2025",
    bodyStyle: "SUV",
    fuelType: "Bencina",
    transmission: "automático",
    drive: "delantera",
    engine: "1.5L",
    engineCc: 1496,
    fuelCombined: 15.6,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 11990000,
    reservationFeeClp: 240000,
    estimatedMonthlyClp: 220000,
    versionsAvailable: 1,
    dealer: "Concesionario oficial Chileautos",
    location: "Concepción",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83866062024/2gl8vb1mdfrw82scos2yjsqs5.jpg",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83866062024/2gl8vb1mdfrw82scos2yjsqs5.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83866062024/7yn0u3qtslzc25dye5jrpk5ta.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83866062024/z1gsfartdyaw6o1om72vdyk69.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83866062024/3cryy0dm6y8mn7gqgo1vdte72.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83866062024/u7egzt239kyijcpwsvwotd1dd.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83866062024/nbwqi7k1hvqhlpcm2de1xe336.jpg"
    ],
    description: "Dongfeng presenta su modelo más reciente, el AEOLUS GS, que sobresale por su diseño inteligente, conectividad total y seguridad. Este modelo ofrece una propuesta innovadora con un diseño frontal que realza tanto el parachoques como su imponente parrilla, creando una presencia visual distintiva.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal cuero sintético",
      "Parlantes - número 6",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Consumo combustible - extraurbano (km/l)",
      "Consumo combustible - mixto (km/l)"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 11990000
      },
      {
        type: "JATO",
        amount: 12690000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-83865392025",
    slug: "dongfeng-aeolus-y3-2025-392025",
    sourceUrl: "https://www.chileautos.cl/catalogo/Sed%C3%A1n/Dongfeng/Aeolus%20Y3/CL-JATO-ITM-83865412025",
    make: "Dongfeng",
    model: "Aeolus Y3",
    year: 2025,
    title: "Dongfeng Aeolus Y3 2025",
    bodyStyle: "Sedán",
    fuelType: "Bencina",
    transmission: "manual",
    drive: "delantera",
    engine: "1.5L",
    engineCc: 1496,
    fuelCombined: 14.6,
    doors: 4,
    condition: "Nuevo",
    km: 0,
    priceClp: 10390000,
    reservationFeeClp: 210000,
    estimatedMonthlyClp: 190000,
    versionsAvailable: 3,
    dealer: "Concesionario oficial Chileautos",
    location: "Valparaíso",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83865412024/znaxlr11ay7mb6yztqmteu0p5.png",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83865412024/znaxlr11ay7mb6yztqmteu0p5.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83865392024/q8udh1hy0by6iv2jvep6jwg2c.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83865392024/z60vq6jsutbq2m8fvdhr5qio7.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83865392024/w1yn47dle8sgx3izk178ric25.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83865392024/noji3f73oymhctqbzt7tb6ij8.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83865392024/jgcshfhn3gbqt2nrwxlrbk84c.jpg"
    ],
    description: "Dongfeng presenta el AEOLUS Y3, un sedán que encarna la modernidad y la amplitud con su diseño meticuloso y vanguardista. Este vehículo ofrece un viaje cómodo, tecnología de seguridad avanzada y conectividad integral. El AEOLUS Y3 fusiona un diseño contemporáneo junto con una experiencia de conducción única.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal cuero sintético",
      "Parlantes - número 4",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Consumo combustible - extraurbano (km/l)",
      "Consumo combustible - mixto (km/l)"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 10390000
      },
      {
        type: "JATO",
        amount: 10590000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-77108952025",
    slug: "foton-midi-2025-952025",
    sourceUrl: "https://www.chileautos.cl/catalogo/Media%20Barandas/Foton/Midi/CL-JATO-ITM-77108942025",
    make: "Foton",
    model: "Midi",
    year: 2025,
    title: "Foton Midi 2025",
    bodyStyle: "Media Barandas",
    fuelType: "Bencina",
    transmission: "manual",
    drive: "trasera",
    engine: "1.2L",
    engineCc: 1249,
    fuelCombined: 13.3,
    doors: 2,
    condition: "Nuevo",
    km: 0,
    priceClp: 6990000,
    reservationFeeClp: 200000,
    estimatedMonthlyClp: 130000,
    versionsAvailable: 2,
    dealer: "Concesionario oficial Chileautos",
    location: "Viña del Mar",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77108942024/bvkssh9ujsprjh0y3pkb6wm43.png",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77108942024/bvkssh9ujsprjh0y3pkb6wm43.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77108952024/tfg16lb3xmqowc6gwa0zwfac7.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77108952024/8eons0qni91yjzjx663fn2lca.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77108952024/k03a1dp64xz1op3kowbmjxava.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77108952024/dnzmr4sqta0ebn0bqxh7358j9.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-77108952024/uwx4qzs7b48n1ep00gectwss7.jpg"
    ],
    description: "Foton Midi Cabina Simple, está diseñada y equipada para otorgar la máxima capacidad de carga y gran seguridad al manejar. Todo lo que necesitas para potenciar tu negocio: útil, liviano y estable. Su espacio interior asegura que puedas transportar más productos de forma segura y cómoda; tanto mercancías, herramientas, productos alimenticios, realizar fletes y otras opciones para dar el impulso que necesita tu pyme.",
    highlights: [
      "Asientos - número de plazas 2",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 2",
      "Depósito de combustible - capacidad",
      "Consumo combustible - extraurbano (km/l)",
      "Consumo combustible - mixto (km/l)",
      "Consumo combustible - urbano (km/l)",
      "Potencia - Potencia máxima HP"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 6990000
      },
      {
        type: "JATO",
        amount: 9508100
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-83009542025",
    slug: "opel-mokka-2025-542025",
    sourceUrl: "https://www.chileautos.cl/catalogo/SUV/Opel/Mokka/CL-JATO-ITM-83009562025",
    make: "Opel",
    model: "Mokka",
    year: 2025,
    title: "Opel Mokka 2025",
    bodyStyle: "SUV",
    fuelType: "Bencina",
    transmission: "automático",
    drive: "delantera",
    engine: "1.2L",
    engineCc: 1199,
    fuelCombined: 20.8,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 18690000,
    reservationFeeClp: 370000,
    estimatedMonthlyClp: 340000,
    versionsAvailable: 3,
    dealer: "Concesionario oficial Chileautos",
    location: "La Serena",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83009562024/igzk64sedcr8pe9eg46myg58.jpg",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83009562024/igzk64sedcr8pe9eg46myg58.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83009542024/lmt4e7acf9y342uxrs9ksd3mb.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83009542024/fpjl6chziodxsn9tf2druc2h2.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83009542024/qt77ktnu3h045n783bb9j7m9b.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83009542024/tzts3jkmunpcvedciirlnzwvb.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83009542024/vx7664ppnp994y5m4d15qv092.jpg"
    ],
    description: "¿preparado para descubrir la audaz evolución de la marca Opel? El Nuevo Mokka combina su impresionante diseño con un sorprendente interior y lo último en tecnología alemana, haciendo de este revolucionario modelo algo único y nunca visto. Es la pieza clave para llevar la conducción a otro nivel.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 6",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Consumo combustible - extraurbano (km/l)",
      "Consumo combustible - mixto (km/l)"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 18690000
      },
      {
        type: "JATO",
        amount: 21490000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-82497442025",
    slug: "peugeot-208-2025-442025",
    sourceUrl: "https://www.chileautos.cl/catalogo/Hatchback/Peugeot/208/CL-JATO-ITM-82574292025",
    make: "Peugeot",
    model: "208",
    year: 2025,
    title: "Peugeot 208 2025",
    bodyStyle: "Hatchback",
    fuelType: "Bencina",
    transmission: "manual",
    drive: "delantera",
    engine: "1.2L",
    engineCc: 1199,
    fuelCombined: 16.8,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 14090000,
    reservationFeeClp: 280000,
    estimatedMonthlyClp: 250000,
    versionsAvailable: 3,
    dealer: "Concesionario oficial Chileautos",
    location: "Temuco",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-82574292024/093y83smdacnf3vnsyvt2g7h2.png",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-82574292024/093y83smdacnf3vnsyvt2g7h2.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-82497442024/rk9bifo18xzsm3nlnvgidf9jd.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-82497442024/3mr7fb6miiklcee5bl9ipzle9.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-82497442024/52gopbx9lu7vqxsfvy2h0tx7b.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-82497442024/kirouv6ddmq57nmmo452eq9t4.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-82497442024/mefvp38g88v2y1biw9euz4x01.jpg"
    ],
    description: "PEUGEOT 208 afirma su juventud con su silueta distintiva que evoca deportividad. Su interior presenta el PEUGEOT i Cockpit ® 3D Disponibilidad según versión inédito. Vive unas sensaciones de conducción intensas con las motorizaciones gasolina y diésel de última generación Euro 6 eficientes de alto rendimiento. Más económicas gracias a su consumo optimizado, todas estas motorizaciones están, además, equipadas con el sistema Stop & Start.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 6",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Smart card / smart key - incluye encendido sin llave",
      "Consumo combustible - extraurbano (km/l)"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 14090000
      },
      {
        type: "JATO",
        amount: 16890000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-75846372025",
    slug: "peugeot-partner-2025-372025",
    sourceUrl: "https://www.chileautos.cl/catalogo/Furg%C3%B3n/Peugeot/Partner/CL-JATO-ITM-83546762025",
    make: "Peugeot",
    model: "Partner",
    year: 2025,
    title: "Peugeot Partner 2025",
    bodyStyle: "Furgón",
    fuelType: "Diesel",
    transmission: "manual",
    drive: "delantera",
    engine: "1.5L",
    engineCc: 1499,
    fuelCombined: 22,
    doors: 4,
    condition: "Nuevo",
    km: 0,
    priceClp: 16390000,
    reservationFeeClp: 330000,
    estimatedMonthlyClp: 300000,
    versionsAvailable: 3,
    dealer: "Concesionario oficial Chileautos",
    location: "Antofagasta",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83546762024/43wutwcgp4pfzjb4deqmkuv11.png",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83546762024/43wutwcgp4pfzjb4deqmkuv11.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-75846372024/798ap82sco60sphl1kl6nz425.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-75846372024/gf43jcwtcv3m3ls455y3au2n5.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-75846372024/v39g549o43t9yhoehwk2c0lp8.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-75846372024/1140wmuzsbgikxdkosbu4di6c.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-75846372024/1nfxlin68d86y7sraef7xxare.jpg"
    ],
    description: "Respaldado por más de 20 años de pruebas por parte de profesionales con una calidad referencia de mercado, la última generación de PEUGEOT Partners te ofrece un nivel de confort y conveniencia sin precedentes en el segmento de vehículos comerciales con el PEUGEOT i-Cockpit®. Independientes o flotistas , cada profesión tiene sus propias expectativas. Para satisfacer tus necesidades y usos específicos, PEUGEOT Partner está disponible en 2 tamaños: L1 y L2.",
    highlights: [
      "Asientos - número de plazas 3",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 2",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Consumo combustible - extraurbano (km/l)",
      "Consumo combustible - mixto (km/l)",
      "Consumo combustible - urbano (km/l)"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 16390000
      },
      {
        type: "JATO",
        amount: 21051100
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-83533452025",
    slug: "jac-js6-2025-452025",
    sourceUrl: "https://www.chileautos.cl/catalogo/SUV/JAC/Js6/CL-JATO-ITM-83533442025",
    make: "JAC",
    model: "Js6",
    year: 2025,
    title: "JAC Js6 2025",
    bodyStyle: "SUV",
    fuelType: "Bencina",
    transmission: "automático",
    drive: "delantera",
    engine: "1.5L",
    engineCc: 1499,
    fuelCombined: 12,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 20990000,
    reservationFeeClp: 420000,
    estimatedMonthlyClp: 380000,
    versionsAvailable: 3,
    dealer: "Concesionario oficial Chileautos",
    location: "Rancagua",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83533442023/7fxfsl1q42yna5pnrchgt0we4.png",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83533442023/7fxfsl1q42yna5pnrchgt0we4.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83533452023/azz61x0h1m4zx04zogxzokfj4.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83533452023/w2pxnudsjm1k9t2xjft1hw4e8.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83533452023/n3qviqehiidugca1sbdiamnh4.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83533452023/owyshf55o64xouc117fds6obb.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83533452023/u8umi71kenycfllzdd8pss4m.jpg"
    ],
    description: "Este increíble SUV no pasa desapercibido, ya que todo en él llama la atención y te hace sentir ganas de vivir una vida llena de la sofisticación. Podrás viajar con seguridad y entretención, ya que todas sus versiones incluyen 6 Airbags ubicados en puntos estratégicos y una gran pantalla dual de 24,6” con Apple CarPlay / Android Auto. También cuenta con cámara de retroceso o 360°, sistema ADAS de asistencia a la conducción nivel 2 y mucho más.  No esperes más y conócelo hoy mismo.",
    highlights: [
      "Asientos - número de plazas 5",
      "Asientos delanteros - ajustables eléctricamente",
      "Tapicería de los asientos - material principal cuero sintético",
      "Parlantes - número 6",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Smart card / smart key - incluye encendido sin llave"
    ],
    priceBreakdown: [
      {
        type: "JATO",
        amount: 20990000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-81498202025",
    slug: "jac-js4-2025-202025",
    sourceUrl: "https://www.chileautos.cl/catalogo/SUV/JAC/Js4/CL-JATO-ITM-81498202025",
    make: "JAC",
    model: "Js4",
    year: 2025,
    title: "JAC Js4 2025",
    bodyStyle: "SUV",
    fuelType: "Bencina",
    transmission: "manual",
    drive: "delantera",
    engine: "1.6L",
    engineCc: 1590,
    fuelCombined: 14.5,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 13940000,
    reservationFeeClp: 280000,
    estimatedMonthlyClp: 250000,
    versionsAvailable: 8,
    dealer: "Concesionario oficial Chileautos",
    location: "Talca",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-81498202024/vdromsnhirguk5kfwhu8cdx9.jpg",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-81498202024/vdromsnhirguk5kfwhu8cdx9.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-81498202024/42vpeft214mnb2r0usjgzvgd2.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-81498202024/8d0hyqkw6wqvmc2z0jcd8vuae.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-81498202024/9fezcluqz7jo6sqg28jfw0cy6.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-81498202024/jcojr5nxx454vtyrqr2fll1r3.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-81498202024/3r1x2lnruxf3bqu92pq2jqo38.jpg"
    ],
    description: "Conoce el JAC JS4 y su diseño vanguardista, un SUV ideal para tus aventuras diarias. Equipado con un motor de 1.6 litros que entrega 118 caballos de fuerza y 150 Nm de torque, disponible en transmisión manual y CVT. Su interior combina confort, tecnología y seguridad, ofreciendo espacio para 5 ocupantes, un volante multifunción deportivo, aire acondicionado touch, una pantalla táctil compatible con Android Auto y Apple CarPlay, y hasta 6 airbags para asegurar tu tranquilidad en cada viaje.",
    highlights: [
      "Asientos - número de plazas 5",
      "Asientos delanteros - ajustables eléctricamente",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 2",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Smart card / smart key - incluye encendido sin llave"
    ],
    priceBreakdown: [
      {
        type: "JATO",
        amount: 13940000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-84243642025",
    slug: "jac-e-js1-2025-642025",
    sourceUrl: "https://www.chileautos.cl/catalogo/Hatchback/JAC/E-Js1/CL-JATO-ITM-84243642025",
    make: "JAC",
    model: "E-Js1",
    year: 2025,
    title: "JAC E-Js1 2025",
    bodyStyle: "Hatchback",
    fuelType: "Eléctrico",
    transmission: "automático",
    drive: "delantera",
    engine: null,
    engineCc: null,
    fuelCombined: null,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 15990000,
    reservationFeeClp: 320000,
    estimatedMonthlyClp: 290000,
    versionsAvailable: 1,
    dealer: "Concesionario oficial Chileautos",
    location: "Puerto Montt",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84243642024/gv9v1uu2stslt0vnblcj6cr9e.jpg",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84243642024/gv9v1uu2stslt0vnblcj6cr9e.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84243642024/9twhlwrxyztwxyuee4zj2l299.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84243642024/b22h3m11mx5z1zejxxz1odwf.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84243642024/7lbuvui7qk0x3nuqfza0ny0ta.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84243642024/zdrq1qqngo921jpg7a87ccqz6.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84243642024/h9ea8zsrzxoxrn8gx966gzrv4.jpg"
    ],
    description: "El JAC E-JS1 es el city car 100% eléctrico de JAC, con un diseño innovador que combina estilo, eficiencia y tecnología. Ofrece una autonomía de hasta 330 kilómetros y 60 caballos de fuerza. Con capacidad para cinco pasajeros, cuenta con una pantalla táctil de 10.25 pulgadas compatible con Android Auto y Apple CarPlay, junto con un amplio maletero de 140 litros, expandible a 400 litros gracias a sus asientos abatibles. Ideal para una conducción cómoda y sostenible en entornos urbanos.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal cuero sintético",
      "Parlantes - número 4",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Smart card / smart key - incluye encendido sin llave",
      "Potencia - Potencia máxima HP",
      "Dimensiones exteriores - alto"
    ],
    priceBreakdown: [
      {
        type: "JATO",
        amount: 15990000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-84258402025",
    slug: "chevrolet-sail-hb-2025-402025",
    sourceUrl: "https://www.chileautos.cl/catalogo/Hatchback/Chevrolet/Sail%20Hb/CL-JATO-ITM-84258422025",
    make: "Chevrolet",
    model: "Sail Hb",
    year: 2025,
    title: "Chevrolet Sail Hb 2025",
    bodyStyle: "Hatchback",
    fuelType: "Bencina",
    transmission: "manual",
    drive: "delantera",
    engine: "1.5L",
    engineCc: 1485,
    fuelCombined: 15,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 10990000,
    reservationFeeClp: 220000,
    estimatedMonthlyClp: 200000,
    versionsAvailable: 3,
    dealer: "Concesionario oficial Chileautos",
    location: "Iquique",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84258422024/l8cy2d1zhk3zhjjx5fkp23p1d.png",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84258422024/l8cy2d1zhk3zhjjx5fkp23p1d.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84258402024/j1qmjjcr1ysrtemxlbt91mmf8.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84258402024/1evyt03tgonts8glspf2odk8d.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84258402024/zzob0kqxi127dl7bh8cysttob.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84258402024/326woqylafrhpt7x38zrrcbc2.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-84258402024/nf68rq6g8no8llvcvcctuln0d.jpg"
    ],
    description: "Sail Hatchback 2024, reinterpretamos nuestro camino. El Chevrolet Sail Hatchback 2024, totalmente rediseñado, llega en su mejor versión, con un diseño atractivo, conectividad, excelente equipamiento de seguridad y por primera vez en Chile, una versión Hatchback. No es solo un auto, reinventamos la forma de ver la vida. Te ves bien y te sientes todavía mejor. El Chevrolet Sail Hatchback 2024, totalmente rediseñado, es el reflejo de esa versión de ti que siempre soñaste: libre, vibrante y único.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 4",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Consumo combustible - extraurbano (km/l)",
      "Consumo combustible - mixto (km/l)",
      "Consumo combustible - urbano (km/l)"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 10990000
      },
      {
        type: "JATO",
        amount: 12090000
      }
    ],
    source: "Chileautos catálogo 0km"
  },
  {
    id: "CL-JATO-ITM-72198722024",
    slug: "chevrolet-tracker-2024-722024",
    sourceUrl: "https://www.chileautos.cl/catalogo/SUV/Chevrolet/Tracker/CL-JATO-ITM-83554012025",
    make: "Chevrolet",
    model: "Tracker",
    year: 2024,
    title: "Chevrolet Tracker 2024",
    bodyStyle: "SUV",
    fuelType: "Bencina",
    transmission: "manual",
    drive: "delantera",
    engine: "1.2L",
    engineCc: 1198,
    fuelCombined: 16.7,
    doors: 5,
    condition: "Nuevo",
    km: 0,
    priceClp: 16490000,
    reservationFeeClp: 330000,
    estimatedMonthlyClp: 300000,
    versionsAvailable: 4,
    dealer: "Concesionario oficial Chileautos",
    location: "Calama",
    coverImage: "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83554012024/h924ste7cricfb81vf0crr6i7.png",
    gallery: [
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-83554012024/h924ste7cricfb81vf0crr6i7.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-72198722024/61l3imscogyquioksttgxxbwe.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-72198722024/suunaqb1ljpz3ch42bnere9v7.jpg",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-72198722024/v7epaze4x9sot8mx9hggn3yob.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-72198722024/1ygsg000bo8y7moacl9t0v4cd.png",
      "https://chileautos.pxcrush.net/showroom/details/CL-JATO-ITM-72198722024/maatmpnw128i24j29dpal6pn5.jpg"
    ],
    description: "Sé dueño de tus nuevos caminos. Cuando sabes lo que quieres, la Chevrolet Tracker te ayuda a lograrlo. Con diseño exterior dinámico y detalles interiores bien pensados, esta SUV es la compañera perfecta para que disfrutes cada momento. Su exterior combina un nuevo diseño, rines de aluminio de 17” y rieles de techo cromado que la hacen sobresalir del resto, mientras que en su interior, el Sunroof panorámico y todo su confort no dejan lugar a dudas: estás en la camioneta perfecta para ti.",
    highlights: [
      "Asientos - número de plazas 5",
      "Tapicería de los asientos - material principal tela",
      "Parlantes - número 4",
      "Depósito de combustible - capacidad",
      "Bluetooth - estándar",
      "Control de crucero - estándar",
      "Smart card / smart key - incluye encendido sin llave",
      "Consumo combustible - extraurbano (km/l)"
    ],
    priceBreakdown: [
      {
        type: "ShowRoom",
        amount: 16490000
      },
      {
        type: "JATO",
        amount: 15990000
      }
    ],
    source: "Chileautos catálogo 0km"
  }
];

export function getVehicleBySlug(slug: string): C4RVehicle | null {
  return c4rVehicles.find((vehicle) => vehicle.slug === slug) ?? null;
}

export function formatCurrencyClp(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(value: number | null): string {
  if (value === null) {
    return "Kilometraje por confirmar";
  }

  return `${new Intl.NumberFormat("es-CL").format(value)} km`;
}

export const featuredVehicleSlugs = c4rVehicles.slice(0, 6).map((vehicle) => vehicle.slug);

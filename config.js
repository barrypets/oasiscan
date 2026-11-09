// ÚNICO archivo que se toca por cliente. index.html no se toca nunca.
// Sección sin datos = sección que desaparece sola. Deja [] o borra la clave.
// Textos sacados de su web actual (oasiscan.es, 9 nov 2026). Nada inventado: sin reseñas ni horario hasta que nos los pase.
const CONFIG = {
  url: "https://barrypets.github.io/oasiscan",
  demo: true,
  nombre: "Oasis Can",
  claim: "Aquí tu peludo no se siente en una jaula. Se siente en casa.",
  subclaim: "Residencia canina familiar y educación canina en El Espinar, en plena Sierra de Guadarrama (Segovia). Sin jaulas, con cuidados de enfermera veterinaria.",
  color: "#9c6b62",
  logo: "assets/logo.png",
  logoAlto: 58,                      // su logo es casi cuadrado: necesita más alto que los 40 px por defecto

  telefono: "+34 622 555 468",
  whatsapp: "34622555468",
  whatsappMensaje: "Hola, he visto vuestra web y quería contaros quién es mi peludo",
  email: "oasiscansegovia@gmail.com",
  direccion: "El Espinar, Sierra de Guadarrama (Segovia)",
  mapa: "https://maps.google.com/?q=El+Espinar,+Segovia",
  instagram: "",

  hero: "assets/hero.jpg",

  barrypets: {
    negocio: "XP9180KnKLSehlfZD7PJ2nGihg83",
    widget: "local",                 // TEMPORAL: copia en assets/ hasta poder publicar barrypets.es. Luego, borra esta línea y assets/barrypets.js
    formato: "servicios",
    local: "",
    tarjeta: false,
    titulo: "Reserva su estancia en un minuto",
    texto: "Elige el servicio y los días. Te confirmamos al momento."
  },

  cifras: [
    ["7 años", "como enfermera veterinaria"],
    ["150+", "mascotas felices"],
    ["100+", "familias contentas"],
    ["0", "jaulas"]
  ],

  servicios: [
    { icono: "house",          titulo: "Residencia canina familiar", texto: "Estancias en casa, cómodas y seguras, adaptadas al tamaño y las necesidades de cada perro." },
    { icono: "paw-print",      titulo: "Guardería por horas",        texto: "Guardería de día con socialización y cuidado constante." },
    { icono: "heart",          titulo: "Cuidado a domicilio",        texto: "Paseos tranquilos, comidas a su hora y compañía sin prisas. Para perros, gatos y otras mascotas." },
    { icono: "stethoscope",    titulo: "Postoperatorio y reposo",    texto: "Entorno tranquilo, supervisión diaria y medicación si hace falta, por una enfermera veterinaria." },
    { icono: "graduation-cap", titulo: "Educación canina",           texto: "No adiestramos: construimos equilibrio. Ansiedad por separación, miedos, socialización." },
    { icono: "truck",          titulo: "Recogida y entrega",         texto: "Lo recogemos y lo llevamos a casa o al veterinario. El Espinar, Otero de Herreros y San Rafael." },
    { icono: "leaf",           titulo: "Comida natural",             texto: "Pienso y latas 100% naturales, sin aditivos, para seguir en casa con lo que ha probado aquí." }
  ],

  puntos: [
    "Sin jaulas: conviven en casa con nuestra familia perruna",
    "Atención de enfermera veterinaria, también para medicación y convalecencias",
    "En plena naturaleza, en la Sierra de Guadarrama",
    "Recogida y entrega a domicilio en El Espinar y alrededores"
  ],

  galeria: ["assets/1.jpg", "assets/2.jpg", "assets/3.jpg"],

  resenas: [],

  faq: [
    { p: "¿Los perros están en jaulas?",          r: "No. Conviven en casa, en un ambiente familiar y tranquilo, con nuestros perros y nuestra cacatúa Lolo." },
    { p: "¿Podéis darle su medicación?",           r: "Sí. Somos enfermera veterinaria y cuidamos también de convalecencias y postoperatorios." },
    { p: "¿Venís a recogerlo?",                    r: "Sí, en El Espinar, Otero de Herreros y San Rafael. Para otras zonas, pregúntanos." },
    { p: "¿Qué incluyen los programas de educación?", r: "Trabajo diario personalizado, informe final, un plan de trabajo para casa y seguimiento." }
  ],

  horario: [],

  formulario: {
    intro: "Hola, os cuento quién es mi peludo:",
    boton: "Enviar por WhatsApp",
    campos: [
      { id: "nombre", etiqueta: "Tu nombre",        tipo: "texto", requerido: true },
      { id: "perro",  etiqueta: "Nombre de tu perro", tipo: "texto", requerido: true },
      { id: "asunto", etiqueta: "Qué necesitas", tipo: "lista", requerido: true,
        opciones: ["Residencia", "Guardería por horas", "Cuidado a domicilio", "Postoperatorio o reposo",
                   "Educación canina", "Comida natural", "Otra cosa"] },
      { id: "como",   etiqueta: "Cuéntanos cómo es", tipo: "area", max: 400,
        pista: "Edad, carácter, si se lleva bien con otros perros..." }
    ]
  },

  cta: "Cuéntanos quién es tu peludo",
  ctaTexto: "Escríbenos por WhatsApp y te contamos todo.",

  // Rellenar al vender (demo: false). Datos de Bea, pendientes.
  legal: { razonSocial: "", nif: "", domicilio: "", registro: "" }
};

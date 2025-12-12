// modules/data.js (Versión con datos en memoria)

// Datos Iniciales (quemados en el código)
export const feeds = [
  { id: 'f1', title: 'Tech & Café', url:'https://techcafe.example', logo:'https://picsum.photos/seed/tech/64' },
  { id: 'f2', title: 'Diseño Diario', url:'https://disenodiario.example', logo:'https://picsum.photos/seed/design/64' },
  { id: 'f3', title: 'Productividad Hoy', url:'https://productividad.example', logo:'https://picsum.photos/seed/product/64' },
];

export const posts = [
  { id:'p1', title:'Cómo aprender HTML5 rápido', excerpt:'Guía práctica con ejercicios y mini-proyectos para fijar conceptos.', content:'<p>HTML5 es la base de la web...</p>', author:'Lucía R.', feedId:'f1', tags:['web','aprendizaje'], date:'2025-10-12' },
  { id:'p2', title:'Microinteracciones que enamoran', excerpt:'Pequeños detalles de UI que mejoran la experiencia dramáticamente.', content:'<p>Las microinteracciones son...</p>', author:'Mateo G.', feedId:'f2', tags:['diseño','ux'], date:'2025-11-02' },
  { id:'p3', title:'Rutina matutina para máxima productividad', excerpt:'Rutinas sencillas y comprobadas por creadores.', content:'<p>Un buen comienzo del día...</p>', author:'Ana P.', feedId:'f3', tags:['productividad','hábitos'], date:'2025-11-27' },
  { id:'p4', title:'SEO técnico: checklist rápido', excerpt:'Los puntos técnicos de SEO que casi nadie revisa.', content:'<p>El SEO técnico cubre desde...</p>', author:'Lucía R.', feedId:'f1', tags:['web','seo'], date:'2025-09-14' },
  { id:'p5', title:'Colores y accesibilidad en interfaces', excerpt:'Cómo elegir contrastes y paletas que funcionen.', content:'<p>Accesibilidad no es una carga...</p>', author:'Mateo G.', feedId:'f2', tags:['diseño','accesibilidad'], date:'2025-08-30' }
];

/* Estado Global */
export let state = {
  activeTags: new Set(),
  query: '',
  user: null, 
  feedList: [...feeds], // ⬅️ Usa los datos iniciales
  postList: [...posts]  // ⬅️ Usa los datos iniciales
};

// Función para formatear fechas (sin cambios)
export function humanDate(iso){
  try { return new Date(iso).toLocaleDateString('es-CO',{year:'numeric',month:'short',day:'numeric'}) }
  catch(e){ return iso }
}
// modules/feed-management.js (Modificado para añadir PROYECTOS/POSTS)
import { state } from './data.js';
import { renderMain, $ } from './render.js';
import { openAuthModal } from './auth.js'; // 1. Importamos el modal de autenticación

export function setupFeedForm(){
 const addPrompt = $('#addFeedPrompt');

 // 2. Modificamos el botón para verificar sesión
 $('#openAddFeed').onclick = () => {
   if (!state.user) {
     openAuthModal(); // Si no hay usuario, abre Login
     return;
   }
   
   // Si hay usuario, mostramos el formulario
   addPrompt.style.display = 'block';
   
   // (Opcional) Autocompletamos el nombre del autor
   const f = $('#feedForm');
   if (state.user.name && f.author) {
     f.author.value = state.user.name;
   }
 };

 $('#cancelAdd').onclick = ()=> addPrompt.style.display = 'none';

 $('#feedForm').onsubmit = (e)=>{
   e.preventDefault();
   const f = e.target;

   // Generación de ID local para el nuevo post
   const newPostId = 'p'+Math.random().toString(36).substr(2,5);

   // 🎯 FECHA Y HORA AUTOMÁTICAS
   const now = new Date();
   const isoDate = now.toISOString();

   // SIMULAR y GUARDAR el nuevo POST/PROYECTO
   state.postList.push({
     id: newPostId,
     title: f.title.value,
     excerpt: f.content.value.substring(0, 100) + '...',
     content: f.content.value,
     author: f.author.value,
     feedId: 'f_user_manual',
     tags: ['usuario', 'manual'],
     date: isoDate,
     url: f.url.value || null
   });

   // Ocultar el formulario, resetear y volver a renderizar todo
   addPrompt.style.display='none';
   f.reset();
   renderMain();

   // Mensaje de confirmación detallado
   alert(`¡Proyecto publicado! Fecha y Hora de registro: ${now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} a las ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
 };
}
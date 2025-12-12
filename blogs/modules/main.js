// modules/main.js (Versión síncrona)
import { state } from './data.js';
import { initSession } from './auth.js';
import { renderMain, $ } from './render.js';
import { setupFeedForm } from './feed-management.js';

// Función de inicialización
function initApp() { // La función vuelve a ser síncrona
  // 1. Configurar listener para la búsqueda
  $('#searchInput').addEventListener('input', (e)=>{ 
    state.query = e.target.value; 
    renderMain(); 
  });

  // 2. Inicializar lógica de Autenticación
  initSession(); 

  // 3. Inicializar lógica de gestión de Feeds
  setupFeedForm(); 

  // 4. Primer renderizado de la UI
  renderMain();  
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', initApp);
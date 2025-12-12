// modules/auth.js
import { state } from './data.js';
import { $, create } from './render.js'; // Importar helpers de DOM

// 1. Inicializar sesión (Local Storage)
export function initSession(){
  const stored = localStorage.getItem('agoraUser');
  if(stored) state.user = JSON.parse(stored);
  renderAuthWidget();
}

// 2. Renderizar el widget del Header
export function renderAuthWidget(){
  const container = $('#authContainer');
  container.innerHTML = '';

  if(state.user){
    // Estado Logueado: Badge Usuario
    const badge = create('button',{class:'user-badge'});
    badge.innerHTML = `
      <div class="user-avatar">${state.user.name.charAt(0).toUpperCase()}</div>
      <span style="font-size:0.9rem;font-weight:600">${state.user.name.split(' ')[0]}</span>
      <span class="material-symbols-rounded" style="font-size:1.1rem;color:var(--gris-80)">expand_more</span>
    `;
    
    // Menú desplegable
    const menu = create('div',{class:'user-menu'});
    menu.innerHTML = `
      <button class="menu-item">Mi Perfil</button>
      <button class="menu-item">Ajustes</button>
      <div style="height:1px;background:var(--gris-10);margin:4px 0"></div>
      <button class="menu-item logout" id="btnLogout">Cerrar sesión</button>
    `;

    // Toggle menú
    badge.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle('show');
    };

    // Logout logic
    menu.querySelector('#btnLogout').onclick = () => {
      state.user = null;
      localStorage.removeItem('agoraUser');
      renderAuthWidget();
      alert("Sesión cerrada correctamente");
    };

    // Cerrar menú si click fuera
    document.addEventListener('click', () => menu.classList.remove('show'), {once:true});

    container.appendChild(badge);
    container.appendChild(menu);

  } else {
    // Estado Guest: Botón Acceder
    const btn = create('button',{class:'btn-primary auth-btn'});
    btn.innerHTML = `<span class="material-symbols-rounded">person</span> Acceder`;
    btn.onclick = openAuthModal;
    container.appendChild(btn);
  }
}

// 3. Modal de Autenticación
export function openAuthModal(){
  // Crear backdrop y modal manual
  const bd = create('div',{class:'modal-backdrop'});
  const modal = create('div',{class:'modal auth-modal-content'});
  
  // HTML Interno (Login por defecto)
  let isRegister = false;
  
  const renderForm = () => {
    modal.innerHTML = `
      <div style="margin-bottom:20px">
        <h2 style="font-family:'Maven Pro';margin:0">${isRegister ? 'Crear cuenta' : 'Bienvenido'}</h2>
        <p class="small">Accede a tus fuentes favoritas</p>
      </div>
      
      <div class="auth-tabs">
        <button class="auth-tab ${!isRegister?'active':''}" id="tabLogin">Iniciar Sesión</button>
        <button class="auth-tab ${isRegister?'active':''}" id="tabReg">Registrarse</button>
      </div>

      <form id="authForm">
        ${isRegister ? `
        <div class="form-group">
          <label>Nombre completo</label>
          <input type="text" name="name" class="form-input" placeholder="Tu nombre" required>
        </div>` : ''}
        
        <div class="form-group">
          <label>Correo electrónico</label>
          <input type="email" name="email" class="form-input" placeholder="ejemplo@correo.com" required>
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" name="password" class="form-input" placeholder="••••••••" required>
        </div>

        <button type="submit" class="btn-submit">
          ${isRegister ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>
      <button id="closeAuth" style="margin-top:12px;background:none;border:none;color:var(--gris-80);cursor:pointer">Cancelar</button>
    `;

    // Bind events
    modal.querySelector('#tabLogin').onclick = () => { isRegister=false; renderForm(); }
    modal.querySelector('#tabReg').onclick = () => { isRegister=true; renderForm(); }
    modal.querySelector('#closeAuth').onclick = () => bd.remove();
    
    // Handle Submit
    modal.querySelector('#authForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = isRegister ? fd.get('name') : fd.get('email').split('@')[0];
      
      // Simular delay y login exitoso
      const btn = e.target.querySelector('button[type="submit"]');
      btn.textContent = "Procesando...";
      
      setTimeout(() => {
        state.user = { name: name, email: fd.get('email') };
        localStorage.setItem('agoraUser', JSON.stringify(state.user));
        renderAuthWidget();
        bd.remove();
        alert(isRegister ? `¡Bienvenido, ${name}!` : `¡Hola de nuevo, ${name}!`);
      }, 800);
    };
  };

  renderForm();
  bd.appendChild(modal);
  
  bd.onclick = (e) => { if(e.target === bd) bd.remove(); }
  document.body.appendChild(bd);
}
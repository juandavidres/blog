/* === carrito.js — versión mejorada con modal vaciar restaurado === */
document.addEventListener("DOMContentLoaded", () => {
  const KEY = "carrito_benigno";
  const panel = document.getElementById("carrito-panel");
  const overlay = document.getElementById("carrito-overlay") || document.getElementById("overlay");
  const icon = document.getElementById("carrito-icono");
  const countEl = document.getElementById("carrito-count");
  const listEl = document.getElementById("carrito-items") || document.getElementById("carrito-lista");
  const vaciarBtn = document.getElementById("vaciar-carrito");
  const finalizarBtn = document.getElementById("btn-finalizar");

  let carrito = JSON.parse(localStorage.getItem(KEY) || "[]");

  /* === Helpers === */
  function parsePrice(value) {
    if (!value) return 0;
    const s = String(value).trim();
    const match = s.match(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)/);
    const num = match ? match[0].replace(/[.,\s]/g, "") : s.replace(/[^\d]/g, "");
    return parseInt(num || "0", 10) || 0;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, ch => (
      {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]
    ));
  }

  function normalizeAll() {
    carrito = carrito.map(it => {
      const title = it.title || it.nombre || it.titulo || it.name || "";
      const priceNumber = parsePrice(it.priceNumber ?? it.price ?? it.precio ?? it.valor ?? it.priceText);
      const img = it.img || it.imagen || it.image || "";
      const cantidad = Number(it.cantidad || it.qty || 1);
      return { title, priceNumber, img, cantidad };
    });
  }

  function saveAndRender() {
    localStorage.setItem(KEY, JSON.stringify(carrito));
    render();
  }

  function updateTotalDisplay(totalNumber) {
    const formatted = `$${Number(totalNumber || 0).toLocaleString()}`;
    const el = document.getElementById("carrito-total") ||
               document.querySelector(".carrito-total strong") ||
               document.querySelector(".carrito-total");

    if (el) {
      el.textContent = formatted;
    } else if (panel) {
      let badge = panel.querySelector(".carrito-total-badge");
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "carrito-total-badge";
        badge.style.cssText = "color:#fff;font-weight:700;padding:8px 12px;border-top:1px solid rgba(255,255,255,0.06)";
        panel.appendChild(badge);
      }
      badge.textContent = `Total: ${formatted}`;
    }
  }

  /* === Render === */
  function render() {
    normalizeAll();
    if (!listEl) return;

    listEl.innerHTML = "";
    let total = 0, totalCount = 0;

    carrito.forEach((item, idx) => {
      const subtotal = item.priceNumber * item.cantidad;
      total += subtotal;
      totalCount += item.cantidad;

      const div = document.createElement("div");
      div.className = "carrito-item";
      div.innerHTML = `
        <img src="${item.img}" alt="${escapeHtml(item.title)}" />
        <div class="info">
          <strong>${escapeHtml(item.title)}</strong>
          <div>Cantidad: <span class="cantidad">${item.cantidad}</span></div>
          <div>Precio: $${item.priceNumber.toLocaleString()}</div>
          <div class="subtotal">Subtotal: $${subtotal.toLocaleString()}</div>
        </div>
        <div class="controles">
          <button class="btn-menos" data-index="${idx}">−</button>
          <button class="btn-mas" data-index="${idx}">+</button>
          <button class="btn-eliminar" data-index="${idx}">✖</button>
        </div>`;
      listEl.appendChild(div);
    });

    if (countEl) countEl.textContent = String(totalCount);
    updateTotalDisplay(total);
  }

  /* === Control de cantidades === */
  listEl?.addEventListener("click", (e) => {
    const idx = Number(e.target.dataset.index);
    if (isNaN(idx)) return;

    if (e.target.classList.contains("btn-mas")) carrito[idx].cantidad++;
    else if (e.target.classList.contains("btn-menos")) carrito[idx].cantidad--;
    else if (e.target.classList.contains("btn-eliminar")) carrito.splice(idx, 1);

    carrito = carrito.filter(it => it.cantidad > 0);
    saveAndRender();
  });

  /* === API pública === */
  window.addToCart = function (prod) {
    const title = prod.title || prod.nombre || prod.titulo || prod.name || "";
    const priceNumber = parsePrice(prod.priceNumber ?? prod.price ?? prod.precio ?? prod.valor ?? prod.priceText);
    const img = prod.img || prod.imagen || prod.image || "";

    let found = carrito.find(i => i.title === title);
    if (found) found.cantidad++;
    else carrito.push({ title, priceNumber, img, cantidad: 1 });

    saveAndRender();
    showNotification(`${title || "Producto"} agregado ✅`);
    panel?.classList.add("visible");
    overlay?.classList.add("visible");
  };

  /* === Botones agregar al carrito === */
  document.querySelectorAll(".agregar-carrito").forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll(".agregar-carrito").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const prodEl = e.currentTarget.closest(".producto");
      if (!prodEl) return;
      const title = prodEl.dataset.nombre || prodEl.querySelector("h4")?.textContent.trim() || "";
      const priceAttr = prodEl.dataset.precio || prodEl.querySelector(".valor")?.textContent || "";
      const img = prodEl.querySelector("img")?.src || "";
      window.addToCart({ title, valor: priceAttr, img });
    });
  });

  /* === Vaciar carrito (modal restaurado) === */
  vaciarBtn?.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.className = "modal-vaciar visible";
    modal.innerHTML = `
      <div class="modal-contenido" style="background:#000; color:#fff; border-radius:10px; padding:20px; text-align:center;">
        <h3>¿Deseas vaciar el carrito?</h3>
        <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
          <button id="confirmar-si" style="background:#e60000; color:#fff; padding:8px 14px; border:none; border-radius:6px;">Sí, vaciar</button>
          <button id="confirmar-no" style="background:#555; color:#fff; padding:8px 14px; border:none; border-radius:6px;">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#confirmar-no").onclick = () => modal.remove();
    modal.querySelector("#confirmar-si").onclick = () => {
      carrito = [];
      localStorage.removeItem(KEY);
      saveAndRender();
      showNotification("🧹 Carrito vaciado correctamente");
      modal.remove();
    };
  });

/* === Finalizar pedido (rutas absolutas Apache) === */
finalizarBtn?.addEventListener("click", () => {
  const modal = document.createElement("div");
  modal.className = "modal-entrega visible";
  modal.innerHTML = `
    <div class="contenido" 
         style="text-align:center; background:#000; color:#fff; border-radius:15px; padding:25px; max-width:420px; width:90%; box-shadow:0 0 20px rgba(255,0,0,0.3);">
      
      <!-- Imagen centrada -->
      <img src="/BENIGNO/static/img/delivery_moderno.png" 
           alt="Entrega" 
           style="display:block; margin:0 auto 20px auto; width:180px; border-radius:12px;">

      <h3 style="margin-bottom:15px; color:#ff1a1a;">Tipo de entrega</h3>

      <div style="text-align:left; margin-bottom:15px;">
        <label style="display:block; margin:8px 0;">
          <input type="radio" name="entrega" value="recoger" checked> Recoger en local
        </label>
        <label style="display:block; margin:8px 0;">
          <input type="radio" name="entrega" value="domicilio"> Domicilio (+$3.000)
        </label>
      </div>

      <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
        <button id="confirmar_pedido" 
                style="flex:1; background:#e60000; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold;">
          Confirmar
        </button>
        <button id="cancelar_pedido" 
                style="flex:1; background:#444; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold;">
          Cancelar
        </button>
      </div>
    </div>`;
  
  document.body.appendChild(modal);

  modal.querySelector("#cancelar_pedido").onclick = () => modal.remove();

  modal.querySelector("#confirmar_pedido").onclick = () => {
    const tipoEntrega = modal.querySelector('input[name="entrega"]:checked').value;
    localStorage.setItem("tipoEntrega", tipoEntrega);
    modal.remove();
    window.location.href = "facturacion.html";
  };
});



  /* === Notificación === */
  function showNotification(text) {
    const el = document.createElement("div");
    el.className = "notificacion-carrito";
    el.textContent = text;
    Object.assign(el.style, {
      position: "fixed",
      top: "12%",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0,0,0,0.86)",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "10px",
      fontSize: "15px",
      zIndex: 99999,
      opacity: 1,
      transition: "all .35s ease"
    });
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 420);
    }, 1700);
  }

  /* === Icono y overlay === */
  icon?.addEventListener("click", () => {
    panel?.classList.toggle("visible");
    overlay?.classList.toggle("visible");
  });
  overlay?.addEventListener("click", () => {
    panel?.classList.remove("visible");
    overlay?.classList.remove("visible");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      panel?.classList.remove("visible");
      overlay?.classList.remove("visible");
    }
  });



  /* === Ordenar solo este producto - handler específico para #btn-ordenar === */








  render();
});




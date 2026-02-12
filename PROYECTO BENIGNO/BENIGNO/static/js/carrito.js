/* === carrito.js — versión corregida: total robusto === */
document.addEventListener("DOMContentLoaded", () => {
  const KEY = "carrito_benigno";
  const panel = document.getElementById("carrito-panel");
  const overlay = document.getElementById("carrito-overlay") || document.getElementById("overlay");
  const icon = document.getElementById("carrito-icono");
  const countEl = document.getElementById("carrito-count");
  const listEl = document.getElementById("carrito-items") || document.getElementById("carrito-lista");
  // no confiar en una sola forma de total en el DOM — manejaremos en updateTotalDisplay
  const vaciarBtn = document.getElementById("vaciar-carrito");
  const finalizarBtn = document.getElementById("btn-finalizar");

  let carrito = JSON.parse(localStorage.getItem(KEY) || "[]");

  /* -----------------------
     Helpers
     ----------------------- */
  function parsePrice(value) {
    if (value == null) return 0;
    if (typeof value === "number" && !isNaN(value)) return Math.round(value);
    const s = String(value).trim();
    if (!s) return 0;
    // busca primer bloque numérico (acepta 12.345, 12,345.67, 12000)
    const m = s.match(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)/);
    let numStr = m ? m[0] : s.replace(/[^\d]/g, "");
    // eliminar puntos/comas y espacios (tratamos todo como entero)
    numStr = numStr.replace(/[.,\s]/g, "");
    const n = parseInt(numStr || "0", 10);
    return isNaN(n) ? 0 : n;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  /* -----------------------
     Normalizar y guardado
     ----------------------- */
  function normalizeAll() {
    carrito = carrito.map(it => {
      const title = it.title || it.nombre || it.titulo || it.name || "";
      const priceText = it.priceText || it.valor || it.precio || it.price || "";
      const priceNumber = (typeof it.priceNumber === "number" && it.priceNumber > 0)
        ? Math.round(it.priceNumber)
        : parsePrice(priceText);
      const img = it.img || it.imagen || it.image || "";
      const cantidad = Number(it.cantidad || it.qty || 1) || 1;
      return { title, priceNumber, priceText: String(priceText || priceNumber), img, cantidad };
    });
  }

  function saveAndRender() {
    localStorage.setItem(KEY, JSON.stringify(carrito));
    render();
  }

  /* -----------------------
     UPDATE TOTAL DISPLAY (robusta)
     ----------------------- */
  function updateTotalDisplay(totalNumber) {
    // intenta primeramente el strong#carrito-total
    const strong = document.getElementById("carrito-total");
    const formatted = `$${Number(totalNumber || 0).toLocaleString()}`;

    if (strong) {
      strong.textContent = formatted;
      return;
    }

    // si existe .carrito-total (contenedor), intenta actualizar su <strong> o el texto
    const cont = document.querySelector(".carrito-total");
    if (cont) {
      const innerStrong = cont.querySelector("#carrito-total") || cont.querySelector("strong");
      if (innerStrong) {
        innerStrong.textContent = formatted;
        return;
      } else {
        // si no hay strong, escribe el texto completo (por ejemplo: "Total: $X")
        cont.textContent = `Total: ${formatted}`;
        return;
      }
    }

    // fallback: si no hay nada, crear/actualizar un pequeño badge dentro del panel (no intrusivo)
    if (panel) {
      let badge = panel.querySelector(".carrito-total-badge");
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "carrito-total-badge";
        Object.assign(badge.style, {
          color: "#fff",
          fontWeight: "700",
          padding: "8px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)"
        });
        panel.appendChild(badge);
      }
      badge.textContent = `Total: ${formatted}`;
    } else {
      // si todo falla, simplemente loguea (para debugging)
      console.warn("No pude encontrar dónde mostrar el total. Total calculado:", formatted);
    }
  }

  /* -----------------------
     Render
     ----------------------- */
  function render() {
    normalizeAll();
    if (!listEl) return;

    listEl.innerHTML = "";
    let total = 0;
    let totalCount = 0;

    carrito.forEach((item, idx) => {
      const price = Number(item.priceNumber) || 0;
      const qty = Number(item.cantidad) || 1;
      const subtotal = price * qty;
      total += subtotal;
      totalCount += qty;

      const div = document.createElement("div");
      div.className = "carrito-item";
      div.innerHTML = `
        <img src="${item.img}" alt="${escapeHtml(item.title)}" />
        <div class="info">
          <strong>${escapeHtml(item.title)}</strong>
          <div>Cantidad: <span class="cantidad">${qty}</span></div>
          <div>Precio: $${price.toLocaleString()}</div>
          <div class="subtotal">Subtotal: $${subtotal.toLocaleString()}</div>
        </div>
        <div class="controles">
          <button class="btn-menos" data-index="${idx}">−</button>
          <button class="btn-mas" data-index="${idx}">+</button>
          <button class="btn-eliminar" data-index="${idx}">✖</button>
        </div>
      `;
      listEl.appendChild(div);
    });

    // actualizar contador
    if (countEl) countEl.textContent = String(totalCount);

    // actualizar total usando la función robusta
    updateTotalDisplay(total);
  }

  /* -----------------------
     Delegación lista
     ----------------------- */
  if (listEl) {
    listEl.addEventListener("click", (e) => {
      const idxAttr = e.target.dataset && e.target.dataset.index;
      const idx = idxAttr !== undefined ? Number(idxAttr) : NaN;
      if (e.target.classList.contains("btn-mas") && !isNaN(idx)) {
        carrito[idx].cantidad = (Number(carrito[idx].cantidad) || 0) + 1;
      } else if (e.target.classList.contains("btn-menos") && !isNaN(idx)) {
        carrito[idx].cantidad = (Number(carrito[idx].cantidad) || 1) - 1;
        if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
      } else if ((e.target.classList.contains("btn-eliminar") || e.target.classList.contains("eliminar")) && !isNaN(idx)) {
        carrito.splice(idx, 1);
      } else {
        return;
      }
      saveAndRender();
    });
  }

  /* -----------------------
     API addToCart (global)
     ----------------------- */
  window.addToCart = function (prod) {
    const title = prod.title || prod.nombre || prod.titulo || prod.name || "";
    const priceCandidate = prod.priceNumber ?? prod.valor ?? prod.precio ?? prod.price ?? prod.priceText ?? 0;
    const priceNumber = parsePrice(priceCandidate);
    const img = prod.img || prod.imagen || prod.image || "";

    // si hay título igual, sumar cantidad; si no, buscar por imagen+precio; si no, crear nuevo
    let found = null;
    if (title) found = carrito.find(i => i.title === title);
    if (!found) {
      found = carrito.find(i => i.img === img && i.priceNumber === priceNumber);
    }

    if (found) {
      found.cantidad = (Number(found.cantidad) || 0) + 1;
    } else {
      carrito.push({
        title: title || `Producto ${Date.now()}`,
        priceNumber,
        priceText: String(priceCandidate || priceNumber),
        img,
        cantidad: 1
      });
    }

    saveAndRender();
    showNotification(`${title || "Producto"} agregado ✅`);
    if (panel) panel.classList.add("visible");
    if (overlay) overlay.classList.add("visible");
  };

  /* -----------------------
     Asistente para botones .agregar-carrito y modal add
     ----------------------- */
  document.querySelectorAll(".agregar-carrito").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const prodEl = e.currentTarget.closest(".producto");
      if (!prodEl) return;
      const title = prodEl.dataset?.nombre || prodEl.dataset?.title || (prodEl.querySelector("h4")?.textContent || "").trim();
      const priceAttr = prodEl.dataset?.precio || prodEl.dataset?.valor || (prodEl.querySelector(".valor")?.textContent || "").trim() || (prodEl.querySelector("p")?.textContent || "").trim();
      const img = prodEl.querySelector("img")?.src || "";
      window.addToCart({ title, valor: priceAttr, img, element: prodEl });
    });
  });

  const modalBtnAgregar = document.getElementById("btn-agregar");
  if (modalBtnAgregar) {
    modalBtnAgregar.addEventListener("click", () => {
      const modal = document.getElementById("modal-producto");
      const title = document.getElementById("modal-title")?.textContent?.trim() || "";
      const priceAttr = document.getElementById("modal-valor")?.textContent?.trim() || "";
      const img = document.getElementById("modal-img")?.src || "";
      window.addToCart({ title, valor: priceAttr, img });
      if (modal) modal.style.display = "none";
    });
  }

  /* -----------------------
     Notificación (simple)
     ----------------------- */
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

  /* -----------------------
     Abrir / cerrar carrito y ESC
     ----------------------- */
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

  /* -----------------------
     Vaciar carrito (modal)
     ----------------------- */
  if (vaciarBtn) {
    vaciarBtn.addEventListener("click", () => {
      const modal = document.createElement("div");
      modal.className = "modal-vaciar visible";
      modal.innerHTML = `
        <div class="modal-contenido">
          <h3>¿Deseas vaciar el carrito?</h3>
          <div class="botones">
            <button id="confirmar-si" class="btn-rojo">Sí, vaciar</button>
            <button id="confirmar-no" class="btn-gris">Cancelar</button>
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
  }

  /* -----------------------
     Modal finalizar (tipo entrega)
     ----------------------- */
  if (finalizarBtn) {
    finalizarBtn.addEventListener("click", () => {
      const modal = document.createElement("div");
      modal.className = "modal-entrega visible";
      modal.innerHTML = `
        <div class="contenido" style="text-align:center; background:#000; color:#fff; border-radius:10px; padding:20px;">
          <img src="/static/img/delivery_moderno.png" alt="Entrega" style="width:160px; margin-bottom:15px; border-radius:12px;">
          <h3 style="color:#e60000;">Tipo de entrega</h3>
          <label style="display:block; margin:10px 0;"><input type="radio" name="entrega" value="recoger" checked> Recoger en local</label>
          <label style="display:block; margin:10px 0;"><input type="radio" name="entrega" value="domicilio"> Domicilio (+$3.000)</label>
          <div style="display:flex; gap:8px; margin-top:15px;">
            <button id="confirmar_pedido" style="flex:1; background:#e60000; color:#fff; border:none; padding:10px; border-radius:6px;">Confirmar</button>
            <button id="cancelar_pedido" style="flex:1; background:#555; color:#fff; border:none; padding:10px; border-radius:6px;">Cancelar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#cancelar_pedido").onclick = () => modal.remove();
      modal.querySelector("#confirmar_pedido").onclick = () => {
        const tipo = modal.querySelector('input[name="entrega"]:checked').value;
        showNotification(tipo === "domicilio" ? "🚗 Pedido confirmado con domicilio" : "🏠 Pedido confirmado para recoger en local");
        carrito = [];
        localStorage.removeItem(KEY);
        saveAndRender();
        modal.remove();
      };
    });
  }

  // render inicial
  render();
});

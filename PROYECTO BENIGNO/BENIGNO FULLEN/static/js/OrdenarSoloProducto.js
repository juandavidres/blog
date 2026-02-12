// === OrdenarSoloProducto.js ===
// Intercepta el click y muestra modal de tipo de entrega.
// Usa captura + stopImmediatePropagation para evitar otros listeners que redirigen.

(function () {
  function onClickHandler(e) {

      // 🥪 SI ES SANDUCHE, NO USAR ESTE FLUJO
  const modalSanduche = document.getElementById("modalSanduche");
  if (modalSanduche && modalSanduche.style.display === "flex") {
    return; // ⛔ dejar que el JS del sanduche maneje el click
  }





    // Asegurarnos de que el target o su ancestro es el botón correcto
    const btn = e.target.closest("#btn-ordenar");
    if (!btn) return;

    // Evitamos que cualquier otro listener (incluido el de carrito.js) se ejecute
    e.preventDefault();
    e.stopPropagation();
    try { e.stopImmediatePropagation(); } catch (err) { /* algunos navegadores ignoran */ }

    // Obtener datos del producto desde el modal actual
    const modalEl = document.getElementById("modal-producto");
    const imgEl = document.getElementById("modal-img");
    const titleEl = document.getElementById("modal-title");
    const priceEl = document.getElementById("modal-valor");

    const title = (titleEl?.textContent || "").trim();
    const img = (imgEl?.src || "").trim();
    const priceText = (priceEl?.textContent || "").trim();
    const priceNumber = parseInt(priceText.replace(/\D/g, ""), 10) || 0;

    const item = {
      nombre: title || "Producto sin nombre",
      precio: priceNumber,
      imagen: img,
      cantidad: 1,
    };

    // Guardar el producto seleccionado (mismo comportamiento que antes)
    localStorage.setItem("productoSeleccionado", JSON.stringify(item));
    localStorage.setItem("carrito_benigno", JSON.stringify([item]));

    // Cerrar modal del producto si existe
    if (modalEl) {
      modalEl.classList.remove("visible");
      modalEl.style.display = "none";
    }

    // Crear modal de tipo de entrega en la misma página
    const entregaModal = document.createElement("div");
    entregaModal.className = "modal-entrega visible";
    entregaModal.innerHTML = `
      <div class="contenido" 
           style="text-align:center; background:#000; color:#fff; border-radius:15px; padding:25px; 
                  max-width:420px; width:90%; box-shadow:0 0 20px rgba(255,0,0,0.3); position:fixed; 
                  top:50%; left:50%; transform:translate(-50%, -50%); z-index:9999;">
        
        <img src="/BENIGNO/static/img/delivery_moderno.png" alt="Entrega" style="display:block; margin:0 auto 20px auto; width:180px; border-radius:12px;">
        <h3 style="margin-bottom:15px; color:#ff1a1a;">Selecciona tipo de entrega</h3>

        <div style="text-align:left; margin-bottom:15px;">
          <label style="display:block; margin:8px 0;">
            <input type="radio" name="tipoEntrega" value="recoger" checked> Recoger en local
          </label>
          <label style="display:block; margin:8px 0;">
            <input type="radio" name="tipoEntrega" value="domicilio"> Domicilio (+$3.000)
          </label>
        </div>

        <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
          <button id="confirmarEntrega" style="flex:1; background:#e60000; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold;">
            Confirmar
          </button>
          <button id="cancelarEntrega" style="flex:1; background:#444; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold;">
            Cancelar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(entregaModal);

    // Cancelar → solo cerrar
    entregaModal.querySelector("#cancelarEntrega").onclick = () => entregaModal.remove();

    // Confirmar → guardar y redirigir
    entregaModal.querySelector("#confirmarEntrega").onclick = () => {
      const tipoEntrega = entregaModal.querySelector('input[name="tipoEntrega"]:checked').value;
      const costoEnvio = tipoEntrega === "domicilio" ? 3000 : 0;

      localStorage.setItem("tipoEntrega", tipoEntrega);
      localStorage.setItem("costoEnvio", costoEnvio.toString());

      console.log("✅ Producto guardado:", item);
      console.log("🚚 Tipo entrega:", tipoEntrega, " | Envío:", costoEnvio);

      entregaModal.remove();

      // Finalmente redirigimos a facturación
      window.location.href = "/BENIGNO/facturacion.html";
    };
  }

  // Registramos el listener en captura para interceptar antes que otros
  document.addEventListener("click", onClickHandler, true);
})();

// cancelarModal.js
// Cierra modales de producto y elimina el fondo gris correctamente.

(function () {
  document.addEventListener("click", (e) => {
    const t = e.target;

    // === 1. Botón cancelar del modal de producto ===
    if (t.matches("#btn-cancelar, .btn-cancelar, .cancelar")) {
      cerrarModalProducto();
      e.preventDefault();
      return;
    }

    // === 2. Botón de cerrar (X) ===
    if (t.matches(".close, .modal .close") || t.closest(".close")) {
      cerrarModalProducto();
      e.preventDefault();
      return;
    }

    // === 3. Clic fuera del contenido (overlay) ===
    if (t.classList.contains("modal")) {
      cerrarModalProducto();
      e.preventDefault();
      return;
    }
  });

  // === 4. Cerrar con tecla Escape ===
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarModalProducto();
    }
  });

  // === Función central para cerrar el modal ===
  function cerrarModalProducto() {
    // Cierra el modal principal del producto
    const modal = document.getElementById("modal-producto");
    if (modal) {
      modal.style.display = "none";
      modal.classList.remove("visible", "mostrar", "activo");
    }

    // Cierra cualquier modal dinámico que haya quedado
    document.querySelectorAll(".modal-entrega, .modal-vaciar, .modal.visible").forEach(m => {
      m.remove();
    });

    // Quita el fondo gris o overlay
    const overlays = [
      document.getElementById("carrito-overlay"),
      document.getElementById("overlay"),
      document.querySelector(".overlay")
    ];
    overlays.forEach(o => {
      if (o) {
        o.classList.remove("visible");
        o.style.display = "none";
      }
    });

    // Limpieza de scroll bloqueado (por si se bloqueó al abrir el modal)
    document.body.style.overflow = "auto";

    // Lanza un evento global opcional (por si otros scripts lo necesitan)
    window.dispatchEvent(new CustomEvent("modal_closed", { detail: { id: "modal-producto" } }));
  }
})();

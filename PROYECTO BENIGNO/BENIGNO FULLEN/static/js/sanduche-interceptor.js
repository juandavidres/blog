document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".sanduche-producto").forEach(producto => {
    producto.onclick = function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const modal = document.getElementById("modalSanduche");
      if (!modal) {
        console.error("❌ No existe modalSanduche");
        return;
      }

      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    };
  });
});

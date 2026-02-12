// === ResumenPedido.js ===
// Carga los datos del pedido desde localStorage y actualiza el resumen

document.addEventListener("DOMContentLoaded", () => {
  // Referencias en el HTML
  const productoEl = document.getElementById("resumen-producto");
  const precioEl = document.getElementById("resumen-precio");
  const entregaEl = document.getElementById("resumen-entrega");
  const envioEl = document.getElementById("resumen-envio");
  const totalEl = document.getElementById("resumen-total");

  // Datos almacenados
  const producto = JSON.parse(localStorage.getItem("productoSeleccionado")) || null;
  const tipoEntrega = localStorage.getItem("tipoEntrega") || "recoger";

  if (!producto) {
    productoEl.textContent = "Producto no disponible";
    precioEl.textContent = "$0";
    entregaEl.textContent = "No seleccionado";
    envioEl.textContent = "$0";
    totalEl.textContent = "$0";
    return;
  }

  // Datos del producto
  const nombreProducto = producto.title || "Producto sin nombre";
  const precioProducto = producto.priceNumber || 0;
  const envio = tipoEntrega === "domicilio" ? 3000 : 0;
  const total = precioProducto + envio;

  // Mostrar en el HTML
  productoEl.textContent = nombreProducto;
  precioEl.textContent = `$${precioProducto.toLocaleString()}`;
  entregaEl.textContent = tipoEntrega === "domicilio" ? "Domicilio" : "Recoger en local";
  envioEl.textContent = `$${envio.toLocaleString()}`;
  totalEl.textContent = `$${total.toLocaleString()}`;
});

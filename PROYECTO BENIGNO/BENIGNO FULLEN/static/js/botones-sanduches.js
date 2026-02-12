/* ============================
   PRECIOS POR TIPO DE PAN
============================ */
const PRECIOS_PAN = {
  brioche: 19500,
  baguette: 21500
};

function calcularPrecioSanduche(pan) {
  return PRECIOS_PAN[pan] || 17500;
}

/* ============================
   AGREGAR SANDUCHE AL CARRITO
============================ */
function agregarSanducheAlCarrito() {

  const pan = document.querySelector("#pan")?.value;
  const proteina = document.querySelector("#proteina")?.value;
  const queso = document.querySelector("#queso")?.value;
  const salsa = document.querySelector("#salsa")?.value;

  const vegetales = [];
  document.querySelectorAll(".vegetales input:checked").forEach(v => {
    vegetales.push(v.value);
  });

  if (vegetales.length > 3) {
    alert("Máximo 3 vegetales");
    return false;
  }

  const precioFinal = calcularPrecioSanduche(pan);

  const sanduche = {
    id: "sanduche_" + Date.now(),
    nombre: "Sanduche Artesanal",
    precio: precioFinal,
    detalles: {
      pan,
      proteina,
      queso,
      vegetales,
      salsa
    },
    cantidad: 1
  };

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(sanduche);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  return true;
}

/* ============================
   CERRAR MODAL SANDUCHE
============================ */
function cerrarModalSanduche() {
  const modal = document.querySelector("#modal-sanduche");
  if (modal) {
    modal.classList.remove("activo");
  }
}

/* ============================
   EVENTOS DOM
============================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ---- BOTÓN SEGUIR COMPRANDO ----
     ✔ Agrega al carrito
     ✔ Cierra modal
     ✔ NO abre carrito
  */
  const btnSeguir = document.querySelector(".btn-secundario");
  if (btnSeguir) {
    btnSeguir.addEventListener("click", () => {
      const guardado = agregarSanducheAlCarrito();
      if (guardado) cerrarModalSanduche();
    });
  }

  /* ---- BOTÓN CANCELAR / IR AL INICIO ----
     ✔ NO agrega nada
     ✔ Cierra modal
     ✔ Redirige al inicio
  */
  const btnSalir = document.querySelector(".btn-tercero");
  if (btnSalir) {
    btnSalir.addEventListener("click", () => {
      cerrarModalSanduche();
      window.location.href = "index.html";
    });
  }

  /* ---- BOTÓN AGREGAR AL PEDIDO ----
     ✔ Agrega al carrito
     ✔ Cierra modal
     ✔ Abre carrito
  */
  const btnPrincipal = document.querySelector(".btn-principal");
  if (btnPrincipal) {
    btnPrincipal.addEventListener("click", () => {
      const guardado = agregarSanducheAlCarrito();
      if (guardado) {
        cerrarModalSanduche();
        if (typeof abrirCarrito === "function") {
          abrirCarrito();
        }
      }
    });
  }

  /* ============================
     PRECIO DINÁMICO EN PANTALLA
  ============================ */
  const panSelect = document.getElementById("pan");
  const precioTxt = document.getElementById("precio-sanduche");

  if (panSelect && precioTxt) {

    function actualizarPrecio() {
      const precio = calcularPrecioSanduche(panSelect.value);
      precioTxt.textContent = "$" + precio.toLocaleString("es-CO");
    }

    actualizarPrecio(); // precio inicial
    panSelect.addEventListener("change", actualizarPrecio);
  }

});

// ====== Configuración ======
const tablaBody = document.querySelector("table tbody");
let pedidosActuales = [];

// Modal de confirmación
const modal = document.getElementById("confirm-modal");
const confirmText = document.getElementById("confirm-text");
let filaPendiente = null;
let estadoPendiente = null;

// ====== Función para obtener pedidos ======
async function obtenerPedidos() {
  try {
    const res = await fetch("/pedidos_json");
    const pedidos = await res.json();

    // Detectar nuevos pedidos
    if (pedidos.length > pedidosActuales.length) {
      reproducirNotificacion();
    }

    pedidosActuales = pedidos;
    actualizarTabla(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
  }
}

// ====== Función para actualizar la tabla ======
function actualizarTabla(pedidos) {
  tablaBody.innerHTML = ""; // Limpiar tabla

  pedidos.forEach(pedido => {
    const fila = document.createElement("tr");
    fila.dataset.id = pedido.id;

    fila.innerHTML = `
      <td>${pedido.id}</td>
      <td>${pedido.fecha_creacion}</td>
      <td>${pedido.nombre}</td>
      <td>${pedido.correo}</td>
      <td>${pedido.telefono}</td>
      <td>${pedido.direccion}</td>
      <td>
        ${pedido.productos.map(p => `${p.nombre} (${p.cantidad})`).join("<br>")}
      </td>
      <td>${pedido.total}</td>
      <td>
        <select class="estado-select" data-estado-actual="${pedido.estado}">
          <option value="Pendiente" ${pedido.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="En Proceso" ${pedido.estado === "En Proceso" ? "selected" : ""}>En Proceso</option>
          <option value="Completado" ${pedido.estado === "Completado" ? "selected" : ""}>Completado</option>
        </select>
      </td>
    `;

    tablaBody.appendChild(fila);
  });

  // Asignar eventos al select para modal
  document.querySelectorAll(".estado-select").forEach(select => {
    select.addEventListener("change", function() {
      const fila = this.closest("tr");
      const usuario = fila.querySelector("td:nth-child(3)").textContent;
      const pedidoId = fila.querySelector("td:first-child").textContent;
      const productos = fila.querySelector("td:nth-child(7)").innerText;
      estadoPendiente = this.value;
      filaPendiente = fila;

      confirmText.innerHTML = `
        ¿Está seguro de cambiar el estado del pedido <b>#${pedidoId}</b> del usuario <b>${usuario}</b> con productos:<br>${productos}?
      `;
      modal.style.display = "flex";
    });
  });
}

// ====== Confirmación del modal ======
document.getElementById("confirm-yes").addEventListener("click", async () => {
  const pedidoId = parseInt(filaPendiente.dataset.id);
  try {
    const res = await fetch("/actualizar_estado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pedidoId, estado: estadoPendiente })
    });
    const data = await res.json();
    if (!data.success) console.error("Error al actualizar estado:", data.error);
    filaPendiente.querySelector(".estado-select").dataset.estadoActual = estadoPendiente;
  } catch (error) {
    console.error("Error al actualizar estado:", error);
  }
  modal.style.display = "none";
  filaPendiente = null;
  estadoPendiente = null;
});

document.getElementById("confirm-no").addEventListener("click", () => {
  filaPendiente.querySelector(".estado-select").value = filaPendiente.querySelector(".estado-select").dataset.estadoActual;
  modal.style.display = "none";
  filaPendiente = null;
  estadoPendiente = null;
});

// ====== Notificación sonora ======
function reproducirNotificacion() {
  const audio = document.getElementById("notificacion");
  if (audio) audio.play();
}

// ====== Intervalo para refrescar pedidos ======
obtenerPedidos(); // Primera carga
setInterval(obtenerPedidos, 5000); // Cada 5 segundos

// guardar_pedido.js
// Envía los datos del pedido al servidor para guardarlos en MySQL

async function confirmarPedido() {

    // 🔹 Armar descripción completa del pedido
let descripcion = "";

// Producto(s) desde el carrito (ejemplo común)
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

if (carrito.length > 0) {
  carrito.forEach((item, index) => {
    descripcion += `Producto ${index + 1}: ${item.nombre}\n`;
    descripcion += `Cantidad: ${item.cantidad}\n`;

    if (item.adiciones && item.adiciones.length > 0) {
      descripcion += `Adiciones: ${item.adiciones.join(", ")}\n`;
    }

    if (item.modificaciones && item.modificaciones.trim() !== "") {
      descripcion += `Modificaciones: ${item.modificaciones}\n`;
    }

    descripcion += "\n";
  });
} else {
  descripcion = "Sin detalle de productos\n";
}

// Devuelta
if (metodoPago === "efectivo") {
  const valorDevuelta = document.getElementById('devuelta').value || 0;
  descripcion += `¿Necesita devuelta?: ${valorDevuelta > 0 ? "Sí ($" + valorDevuelta + ")" : "No"}\n`;
}


  const tipoEntrega = localStorage.getItem("tipoEntrega"); // 'local' o 'domicilio'
  const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value; // efectivo o transferencia

  const payload = {
    tipo_entrega: tipoEntrega,
    metodo_pago: metodoPago,
    nombre_cliente: document.getElementById('nombre').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    direccion: tipoEntrega === 'domicilio' ? document.getElementById('direccion').value.trim() : '',
    complementos: tipoEntrega === 'domicilio' ? document.getElementById('complementos').value.trim() : '',
    devuelta: metodoPago === 'efectivo' ? document.getElementById('devuelta').value || 0 : 0,
    descripcion: descripcion,
    total: parseFloat(localStorage.getItem("total_pedido") || 0)
  };

  const res = await fetch('guardar_pedido.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });



  const json = await res.json();
  console.log(json);
  alert(JSON.stringify(json));


if (json.status === 'ok') {

  alert('Pedido recibido correctamente. ¡Gracias por tu compra!');

  // 🔥 ENVIAR ID A LA FACTURA
  window.location.href = `factura.html?id=${json.id}`;

} else {
  alert('Error al registrar el pedido: ' + json.message);
}

}

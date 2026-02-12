const params = new URLSearchParams(window.location.search);
const idPedido = params.get("id");

/* DATOS GENERALES */
fetch(`obtener_factura.php?id=${idPedido}`)
.then(res => res.json())
.then(data => {
    if (data.error) {
        alert(data.error);
        return;
    }

    document.getElementById("cliente").textContent = data.cliente;
    document.getElementById("telefono").textContent = data.telefono;
    document.getElementById("total").textContent = "$" + data.total;
});

/* DETALLE DE PRODUCTOS */
fetch(`obtener_detalle_pedido.php?id=${idPedido}`)
.then(res => res.json())
.then(productos => {
    const contenedor = document.getElementById("detalle-productos");

    if (productos.length === 0) {
        contenedor.innerHTML = "<p>Sin detalle de productos</p>";
        return;
    }

    let html = `
        <table class="tabla-detalle">
            <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
            </tr>
    `;

    productos.forEach(p => {
        html += `
            <tr>
                <td>${p.producto}</td>
                <td>${p.cantidad}</td>
                <td>$${p.precio}</td>
                <td>$${p.precio * p.cantidad}</td>
            </tr>
        `;
    });

    html += "</table>";
    contenedor.innerHTML = html;
});

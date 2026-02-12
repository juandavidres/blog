<?php
require "conexion.php";

$id = intval($_GET["id"]);

$sql = "
    SELECT 
        id,
        nombre_cliente,
        telefono,
        metodo_pago,
        tipo_entrega,
        direccion,
        descripcion,
        total
    FROM pedidos_espera
    WHERE id = $id
    LIMIT 1
";

$result = $conn->query($sql);

if ($result->num_rows === 0) {
    echo json_encode(["error" => "Factura no encontrada"]);
    exit;
}

$pedido = $result->fetch_assoc();

echo json_encode($pedido);

<?php
session_start();
include 'conexion.php';

/* =========================
   LEER JSON DEL FRONTEND
========================= */
$data = json_decode(file_get_contents("php://input"), true);

$nombre     = $data['nombre_cliente'] ?? '';
$telefono   = $data['telefono'] ?? '';
$direccion  = $data['direccion'] ?? '';
$metodo     = $data['metodo_pago'] ?? '';
$tipo       = $data['tipo_entrega'] ?? '';
$total      = $data['total'] ?? 0;

/* =========================
   DESCRIPCIÓN DEL PEDIDO
========================= */
$descripcion = trim($data['descripcion'] ?? '');

if ($descripcion === '') {
    $descripcion = "Sin detalle de productos";
}

/* =========================
   GUARDAR PEDIDO
========================= */
$stmt = $conn->prepare("
    INSERT INTO pedidos_espera (
        nombre_cliente,
        telefono,
        direccion,
        metodo_pago,
        tipo_entrega,
        descripcion,
        total,
        estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
");

$stmt->bind_param(
    "ssssssd",
    $nombre,
    $telefono,
    $direccion,
    $metodo,
    $tipo,
    $descripcion,
    $total
);

$stmt->execute();

/* =========================
   RESPUESTA AL FRONTEND
========================= */
echo json_encode([
    "status" => "ok",
    "id" => $stmt->insert_id
]);
exit;

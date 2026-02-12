<?php
include('conexion.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $telefono = $_POST['telefono'];
    $metodo_pago = $_POST['metodo_pago'];
    $tipo_entrega = $_POST['tipo_entrega'];
    $descripcion = $_POST['descripcion'];
    $total = $_POST['total'];
    $estado = $_POST['estado'];

    $sql = "INSERT INTO pedidos (nombre_cliente, telefono, metodo_pago, tipo_entrega, descripcion, total, estado)
            VALUES ('$nombre', '$telefono', '$metodo_pago', '$tipo_entrega', '$descripcion', '$total', '$estado')";

    if ($conexion->query($sql) === TRUE) {
        echo "Pedido registrado correctamente";
    } else {
        echo "Error: " . $sql . "<br>" . $conexion->error;
    }

    $conexion->close();
}
?>

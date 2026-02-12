<?php
$servername = "localhost";
$username = "root";
$password = "admin123";
$dbname = "benigno_db";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
// echo "Conexión exitosa"; // Puedes activarlo para probar
?>

from flask import Flask, render_template, jsonify, request, redirect, url_for, session
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = "benigno_secret_key"  # Necesario para sesiones

PEDIDOS_FILE = "pedidos.json"

# ====== Usuario admin ======
USUARIO_ADMIN = "admin"
PASS_ADMIN = "1234"

# ====== Funciones de pedidos ======
def leer_pedidos():
    try:
        with open(PEDIDOS_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def guardar_pedidos(pedidos):
    with open(PEDIDOS_FILE, "w") as f:
        json.dump(pedidos, f, indent=2)

# ====== Login ======
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        usuario = request.form.get("usuario")
        password = request.form.get("password")
        if usuario == USUARIO_ADMIN and password == PASS_ADMIN:
            session["admin_logged"] = True
            return redirect(url_for("admin_panel"))
        else:
            return render_template("login.html", error="Usuario o contraseña incorrectos")
    return render_template("login.html", error="")

# ====== Panel de administración ======
@app.route("/admin")
def admin_panel():
    if not session.get("admin_logged"):
        return redirect(url_for("login"))
    pedidos = leer_pedidos()
    return render_template("admin.html", pedidos=pedidos)

# ====== Obtener pedidos en JSON ======
@app.route("/pedidos_json")
def pedidos_json():
    if not session.get("admin_logged"):
        return jsonify([])  # No autorizado devuelve vacío
    pedidos = leer_pedidos()
    return jsonify(pedidos)

# ====== Cambiar estado de un pedido ======
@app.route("/actualizar_estado", methods=["POST"])
def actualizar_estado():
    if not session.get("admin_logged"):
        return jsonify({"success": False, "error": "No autorizado"})
    
    data = request.get_json()
    pedido_id = data.get("id")
    nuevo_estado = data.get("estado")

    pedidos = leer_pedidos()
    for pedido in pedidos:
        if pedido["id"] == pedido_id:
            pedido["estado"] = nuevo_estado
            pedido["fecha_actualizacion"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            break

    guardar_pedidos(pedidos)
    return jsonify({"success": True})

# ====== Nuevo pedido (desde la página web) ======
@app.route("/nuevo_pedido", methods=["POST"])
def nuevo_pedido():
    data = request.get_json()
    pedidos = leer_pedidos()
    
    nuevo_id = pedidos[-1]["id"] + 1 if pedidos else 1
    pedido = {
        "id": nuevo_id,
        "nombre": data.get("nombre"),
        "correo": data.get("correo"),
        "telefono": data.get("telefono"),
        "direccion": data.get("direccion"),
        "productos": data.get("productos", []),
        "total": data.get("total", "$0"),
        "estado": "Pendiente",
        "fecha_creacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    pedidos.append(pedido)
    guardar_pedidos(pedidos)
    return jsonify({"success": True, "id": nuevo_id})

# ====== Cerrar sesión ======
@app.route("/logout")
def logout():
    session.pop("admin_logged", None)
    return redirect(url_for("login"))

# ====== Redirección raíz ======
@app.route("/")
def raiz():
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)

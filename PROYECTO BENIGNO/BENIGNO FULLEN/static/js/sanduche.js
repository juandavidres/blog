function confirmarSanduche() {
  const panSelect = document.getElementById("panSanduche");
  const precio = Number(panSelect.value);
  const panTexto = panSelect.options[panSelect.selectedIndex].text;
  const queso = document.getElementById("quesoSanduche").value;

  const vegetales = [];
  document.querySelectorAll(".vegetal:checked").forEach(v => {
    vegetales.push(v.value);
  });

  if (vegetales.length === 0 || vegetales.length > 3) {
    alert("Selecciona entre 1 y 3 vegetales");
    return;
  }

  const producto = {
    title: "Sánduche Artesanal",
    priceNumber: precio,
    cantidad: 1,
    descripcion: `
${panTexto}
Queso: ${queso}
Vegetales: ${vegetales.join(", ")}
    `
  };

  localStorage.setItem("carrito_benigno", JSON.stringify([producto]));
  window.location.href = "facturacion.html";
}

/* carousel.js - control de sliders, pestañas, modal y botón agregar al carrito
   TOLERANTE: lee distintos nombres de data-attributes y llama a window.addToCart si existe,
   si no existe guarda en localStorage y dispara evento "carrito_actualizado".
*/
document.addEventListener("DOMContentLoaded", () => {
  // ---- helper carousel starter ----
  function startCarousel(containerSelector, ms) {
    const imgs = document.querySelectorAll(containerSelector + " img");
    if (!imgs || imgs.length === 0) return;
    let i = 0;
    imgs.forEach((img, idx) => img.classList.toggle("active", idx === 0));
    setInterval(() => {
      imgs[i].classList.remove("active");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("active");
    }, ms);
  }

  // arrancar carruseles (si existen)
  startCarousel("#carrusel-centro", 4000);
  startCarousel("#carrusel-izquierdo", 2500);
  startCarousel("#carrusel-derecho", 2500);

  // ---- pestañas productos ----
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");
  tabLinks.forEach(link => {
    link.addEventListener("click", () => {
      tabLinks.forEach(l => l.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      link.classList.add("active");
      const tab = link.getAttribute("data-tab");
      const node = document.getElementById(tab);
      if (node) node.classList.add("active");
    });
  });

  // ---- modal producto ----
  const modal = document.getElementById("modal-producto");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalValor = document.getElementById("modal-valor");
  const modalClose = document.querySelector(".modal .close");

  // Si no existe el modal, no fallamos: simplemente no se abre
  const openProductModal = (prodElem) => {
    if (!modal) return;
    // coger atributos con tolerancia a nombres distintos
    const ds = prodElem.dataset || {};
    const img = ds.img || ds.image || ds.src || prodElem.querySelector("img")?.src || "";
    const title = ds.title || ds.nombre || ds.titulo || prodElem.querySelector("h4, h3, h2")?.textContent?.trim() || "";
    const desc = ds.desc || ds.description || ds.descripcion || "";
    const valor = ds.valor || ds.precio || ds.price || (prodElem.querySelector(".valor, .precio, p")?.textContent?.trim()) || "";

    modal.style.display = "block";
    if (modalImg) modalImg.src = img;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalValor) modalValor.textContent = valor;
  };

  // abrir modal cuando se hace click en .producto (pero evitar hacerlo cuando clic en un botón especifico dentro)
  document.querySelectorAll(".producto").forEach(prod => {
    prod.addEventListener("click", (e) => {
      // si el click vino de un botón "agregar directo", no abrimos modal
      if (e.target.closest(".agregar-carrito") || e.target.closest(".btn-agregar-directo")) return;
      openProductModal(prod);
    });
  });

  if (modalClose) modalClose.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
  window.addEventListener("keydown", e => { if (e.key === "Escape" && modal && modal.style.display === "block") modal.style.display = "none"; });

  // ---- botón agregar dentro del modal ----
  const modalAddBtn = document.getElementById("btn-agregar") || document.getElementById("add-to-cart") || null;
  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", () => {
      // recoger datos desde modal (si modal no existe, intentamos abortar)
      const title = (modalTitle && modalTitle.textContent) ? modalTitle.textContent.trim() : "";
      const valor = (modalValor && modalValor.textContent) ? modalValor.textContent.trim() : "";
      const img = (modalImg && modalImg.src) ? modalImg.src : "";

      const producto = { title, valor, img };
      if (window.addToCart && typeof window.addToCart === "function") {
        window.addToCart(producto);
      } else {
        // fallback: guardar en localStorage y notificar al carrito
        const key = "carrito_benigno";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push({ title: producto.title, valor: producto.valor, img: producto.img });
        localStorage.setItem(key, JSON.stringify(list));
        window.dispatchEvent(new Event("carrito_actualizado"));
      }

      if (modal) modal.style.display = "none";
    });
  }

  // ---- botones "agregar directo" (si hay botones dentro de .producto con clase .agregar-carrito) ----
  document.querySelectorAll(".agregar-carrito").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // que no abra el modal
      const prod = e.target.closest(".producto");
      if (!prod) return;
      const ds = prod.dataset || {};
      const title = ds.title || ds.nombre || ds.titulo || prod.querySelector("h4, h3, h2")?.textContent?.trim() || "";
      const valor = ds.valor || ds.precio || ds.price || (prod.querySelector(".valor, .precio, p")?.textContent?.trim()) || "";
      const img = ds.img || ds.image || prod.querySelector("img")?.src || "";
      const producto = { title, valor, img };
      if (window.addToCart && typeof window.addToCart === "function") {
        window.addToCart(producto);
      } else {
        const key = "carrito_benigno";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push({ title: producto.title, valor: producto.valor, img: producto.img });
        localStorage.setItem(key, JSON.stringify(list));
        window.dispatchEvent(new Event("carrito_actualizado"));
      }
    });
  });
});

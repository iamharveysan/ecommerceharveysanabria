const productos = [
  { id: 1, nombre: "Batman: The Killing Joke", precio: 25.00, categoria: "DC", img: "https://upload.wikimedia.org/wikipedia/en/3/32/Killingjoke.JPG" },
  { id: 2, nombre: "Spider-Man: Blue", precio: 30.00, categoria: "Marvel", img: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Spider-Man-Blue.png/250px-Spider-Man-Blue.png" },
  { id: 3, nombre: "Watchmen", precio: 40.00, categoria: "Independiente", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Watchmen-cover.svg/330px-Watchmen-cover.svg.png" },
  { id: 4, nombre: "X-Men: Days of Future Past", precio: 35.00, categoria: "Marvel", img: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/X-Men_Days_of_Future_Past_poster.jpg/250px-X-Men_Days_of_Future_Past_poster.jpg" },
  { id: 5, nombre: "The Sandman: Preludes & Nocturnes", precio: 50.00, categoria: "Independiente", img: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Sandman_Preludes_and_Nocturnes.jpg/250px-Sandman_Preludes_and_Nocturnes.jpg" },
  { id: 6, nombre: "Superman: Red Son", precio: 28.00, categoria: "DC", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Superman_Red_Son_logo.png/330px-Superman_Red_Son_logo.png" },
  { id: 7, nombre: "Daredevil: Born Again", precio: 32.00, categoria: "Marvel", img: "daredevil.jpg" },
];

let carrito = new Map();

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const contenedorPayPal = document.getElementById("paypal-button-container");

function filtrarPorCategoria() {
  const seleccion = document.getElementById("categoria").value;
  const productosFiltrados = seleccion === "todos"
    ? productos
    : productos.filter(p => p.categoria === seleccion);

  contenedorProductos.innerHTML = "";

  productosFiltrados.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  cantidadCarrito.textContent = cantidadTotal;
  contenedorPayPal.style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
  if (!carrito.has(id)) return;

  let item = carrito.get(id);
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (carrito.size === 0) return;

  if (confirm("¿Seguro que quieres vaciar el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.size === 0) {
    alert("Tu carrito está vacío. Agrega cómics antes de comprar.");
    return;
  }

  alert("¡Gracias por tu compra! 📚 Tu pedido está en camino.");
  vaciarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(Array.from(carrito.entries())));
}

function cargarCarrito() {
  const data = localStorage.getItem("carrito");
  if (data) {
    carrito = new Map(JSON.parse(data));
    actualizarCarrito();
  }
}

// PayPal Smart Button
if (window.paypal) {
  paypal.Buttons({
    createOrder: function (data, actions) {
      const total = Array.from(carrito.values()).reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toFixed(2)
          }
        }]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert(`¡Gracias ${details.payer.name.given_name}, tu pago fue exitoso! 📚`);
        vaciarCarrito();
      });
    },
    onError: function (err) {
      console.error("Error con PayPal:", err);
      alert("Hubo un problema con el pago. Intenta de nuevo.");
    }
  }).render('#paypal-button-container');
}

// Inicializar
filtrarPorCategoria();
cargarCarrito();



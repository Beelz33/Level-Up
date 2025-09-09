// --- Control de menú de usuario en la barra de navegación ---
document.addEventListener('DOMContentLoaded', function() {
  const navUser = document.getElementById('nav-user-action');
  const email = localStorage.getItem('usuarioActivoLevelUp');
  if (navUser) {
    if (email) {
      navUser.innerHTML = `
        <a class="btn btn-outline-light me-2" href="perfil.html">Perfil</a>
        <button class="btn btn-danger me-2" id="logoutBtn">Cerrar sesión</button>
        <a class="btn btn-success ms-2" href="logueo.html">Registro/Login</a>
      `;
      setTimeout(() => {
        const btn = document.getElementById('logoutBtn');
        if(btn) btn.onclick = function() {
          localStorage.removeItem('usuarioActivoLevelUp');
          window.location.reload();
        };
      }, 100);
    } else {
      navUser.innerHTML = `<a class="btn btn-success ms-2" href="logueo.html">Login</a>`;
    }
  }
});
// --- Catálogo: filtro y carrito ---
function filterProducts() {
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const priceRange = document.getElementById('priceFilter').value;
  const products = document.querySelectorAll('.product-card');
  let visibleCount = 0;
  products.forEach(product => {
    const productName = product.getAttribute('data-name').toLowerCase();
    const productCategory = product.getAttribute('data-category');
    const productPrice = parseInt(product.getAttribute('data-price'));
    const matchesSearch = productName.includes(searchText);
    const matchesCategory = category === 'all' || productCategory === category;
    let matchesPrice = true;
    if (priceRange !== 'all') {
      if (priceRange === '0-30000') {
        matchesPrice = productPrice <= 30000;
      } else if (priceRange === '30000-100000') {
        matchesPrice = productPrice > 30000 && productPrice <= 100000;
      } else if (priceRange === '100000-500000') {
        matchesPrice = productPrice > 100000 && productPrice <= 500000;
      } else if (priceRange === '500000+') {
        matchesPrice = productPrice > 500000;
      }
    }
    if (matchesSearch && matchesCategory && matchesPrice) {
      product.classList.remove('hidden');
      visibleCount++;
    } else {
      product.classList.add('hidden');
    }
  });
  const noResults = document.getElementById('noResults');
  if (noResults) {
    if (visibleCount === 0) {
      noResults.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
    }
  }
}

function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem('carritoLevelUp') || '[]');
  const existente = carrito.find(p => p.name === producto.name);
  if (existente) {
    existente.qty += 1;
  } else {
    carrito.push({...producto, qty: 1});
  }
  localStorage.setItem('carritoLevelUp', JSON.stringify(carrito));
  window.location.href = 'carrito.html';
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('productsContainer')) {
    filterProducts();
    document.querySelectorAll('.agregar-carrito').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const card = btn.closest('.product-card');
        const producto = {
          name: card.querySelector('h5').innerText,
          price: parseInt(card.getAttribute('data-price')),
          category: card.getAttribute('data-category'),
          img: card.querySelector('img').src
        };
        agregarAlCarrito(producto);
      });
    });
  }
});
// --- Navegación a detalle de producto desde catálogo ---
function goToProduct(img) {
  const card = img.closest('.product-card');
  const name = card.getAttribute('data-name').toLowerCase();
  // Si existe productosLevelUp, buscar el id por nombre
  if (typeof productosLevelUp !== 'undefined') {
    const prod = productosLevelUp.find(p => p.nombre.toLowerCase() === name);
    if (prod) {
      window.location.href = `productos.html?id=${prod.id}`;
      return;
    }
  }
  // Fallback: mapeo manual si no existe productosLevelUp
  let id = 1;
  switch(name) {
    case 'poleron gamer personalizado': id=10; break;
    case 'servicio tecnico': id=11; break;
    case 'catan': id=1; break;
    case 'carcassonne': id=2; break;
    case 'controlador xbox': id=3; break;
    case 'auriculares hyperx': id=4; break;
    case 'playstation 5': id=5; break;
    case 'pc gamer asus': id=6; break;
    case 'silla secretlab': id=7; break;
    case 'mouse logitech': id=8; break;
    case 'mousepad razer': id=9; break;
    case 'polera level-up': id=12; break;
  }
  window.location.href = `productos.html?id=${id}`;
}
// --- Reseñas y Calificaciones ---
function getReviews() {
  return JSON.parse(localStorage.getItem('levelupReviews') || '{}');
}
function setReviews(obj) {
  localStorage.setItem('levelupReviews', JSON.stringify(obj));
}

function usuarioPuedeReseniar(productoName) {
  // Solo usuarios logueados y que hayan comprado el producto
  const email = localStorage.getItem('usuarioActivoLevelUp');
  if (!email) return false;
  const compras = JSON.parse(localStorage.getItem('comprasLevelUp') || '[]');
  return compras.some(c => c.email === email && c.productos.some(p => p.name === productoName));
}

function mostrarReviews(productoName, container) {
  const reviews = getReviews();
  const arr = reviews[productoName] || [];
  if (arr.length === 0) {
    container.innerHTML = '<div class="text-muted small">Sin reseñas aún.</div>';
    return;
  }
  container.innerHTML = arr.map(r =>
    `<div class="border rounded p-2 mb-1 bg-light text-dark">
      <div><b>${r.usuario}</b> <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div>
      <div>${r.texto}</div>
    </div>`
  ).join('');
}

function dejarReview(productoName, container) {
  if (!usuarioPuedeReseniar(productoName)) {
    alert('Solo puedes dejar reseña si compraste este producto e iniciaste sesión.');
    return;
  }
  const usuario = localStorage.getItem('usuarioActivoLevelUp') || 'Anónimo';
  let rating = prompt('Califica el producto (1-5 estrellas):');
  rating = parseInt(rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    alert('Calificación inválida.');
    return;
  }
  const texto = prompt('Escribe tu reseña:');
  if (!texto || texto.length < 3) {
    alert('La reseña es muy corta.');
    return;
  }
  const reviews = getReviews();
  if (!reviews[productoName]) reviews[productoName] = [];
  reviews[productoName].push({usuario, rating, texto});
  setReviews(reviews);
  mostrarReviews(productoName, container);
}

document.addEventListener('DOMContentLoaded', function() {
  // Mostrar reseñas y botones en catálogo
  document.querySelectorAll('.product-card').forEach(card => {
    const productoName = card.querySelector('h5').innerText;
    const reviewsContainer = card.querySelector('.reviews-container');
    if (reviewsContainer) mostrarReviews(productoName, reviewsContainer);
    const btn = card.querySelector('.leave-review-btn');
    if (btn) {
      btn.addEventListener('click', function() {
        dejarReview(productoName, reviewsContainer);
      });
    }
  });
});
// --- Registro con referidos y gamificación ---
function generarCodigoRef() {
  return 'LEVEL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getUsuarios() {
  return JSON.parse(localStorage.getItem('usuariosLevelUp') || '[]');
}
function setUsuarios(arr) {
  localStorage.setItem('usuariosLevelUp', JSON.stringify(arr));
}
function guardarUsuarioActivo(email) {
  localStorage.setItem('usuarioActivoLevelUp', email);
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registroForm');
  if(!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value;
    const nacimiento = document.getElementById('nacimiento').value;
    const terminos = document.getElementById('terminos').checked;
    const codigoReferido = document.getElementById('codigoReferido').value.trim().toUpperCase();
    const msg = document.getElementById('registroMsg');
    msg.innerHTML = '';
    // Validar campos vacíos
    if(!nombre || !correo || !password || !nacimiento || !terminos) {
      msg.innerHTML = '<div class="alert alert-danger">Completa todos los campos y acepta los términos.</div>';
      return;
    }
    // Validar edad
    const fechaNac = new Date(nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if(edad < 18) {
      msg.innerHTML = '<div class="alert alert-danger">Debes ser mayor de 18 años para registrarte.</div>';
      return;
    }
    // Validar correo ya registrado
    const usuarios = getUsuarios();
    if(usuarios.some(u => u.correo === correo)) {
      msg.innerHTML = '<div class="alert alert-danger">Este correo ya está registrado.</div>';
      return;
    }
    // Validar correo Duoc
    let descuento = false;
    if(correo.toLowerCase().endsWith('@duocuc.cl')) {
      descuento = true;
    }
    // Referidos y puntos
    let puntos = 0;
    let refCode = generarCodigoRef();
    let nivel = 1;
    let refOk = false;
    if(codigoReferido) {
      const refUser = usuarios.find(u => u.codigoRef === codigoReferido);
      if(refUser) {
        refUser.puntos = (refUser.puntos || 0) + 100;
        puntos += 100;
        refOk = true;
        nivel = calcularNivel(puntos);
      }
    }
    // Guardar usuario
    const nuevoUsuario = {nombre, correo, password, nacimiento, descuento, puntos, nivel, codigoRef: refCode};
    usuarios.push(nuevoUsuario);
    setUsuarios(usuarios);
    guardarUsuarioActivo(correo);
    let msgExtra = '';
    if(descuento) msgExtra += ' Como usuario Duoc tienes 20% de descuento de por vida.';
    if(refOk) msgExtra += ' ¡Felicitaciones! Tú y tu referido ganaron 100 puntos LevelUp.';
    msg.innerHTML = '<div class="alert alert-success">¡Registro exitoso! Tu código de referido es <b>' + refCode + '</b>.' + msgExtra + '</div>';
    form.reset();
  });
});

function calcularNivel(puntos) {
  if(puntos >= 1000) return 5;
  if(puntos >= 600) return 4;
  if(puntos >= 300) return 3;
  if(puntos >= 150) return 2;
  return 1;
}


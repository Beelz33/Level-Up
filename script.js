// --- Lógica de perfil.html ---
document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.pathname.endsWith('perfil.html')) return;
  // Obtener usuario activo
  const email = localStorage.getItem('usuarioActivoLevelUp');
  const usuarios = JSON.parse(localStorage.getItem('usuariosLevelUp') || '[]');
  const user = usuarios.find(u => u.correo === email);
  // Mostrar resumen
  if(user) {
    const nivel = calcularNivel(user.puntos||0);
    const puntos = user.puntos||0;
    const nextLevel = [0,150,300,600,1000,2000][nivel] || 0;
    const falta = nextLevel > puntos ? nextLevel - puntos : 0;
    const porc = Math.min(100, Math.round((puntos/(nextLevel||1))*100));
    document.getElementById('perfilResumen').innerHTML = `
      <img src='https://via.placeholder.com/150/222222/39FF14?text=U' class='rounded-circle mx-auto mb-3' alt='Avatar'>
      <h4>${user.nombre}</h4>
      <p>${user.correo}</p>
      <div class='level-badge mx-auto'>Nivel ${nivel} - ${nombreNivel(nivel)}</div>
      <div class='mt-2 mb-2'>
        <span>Puntos LevelUp:</span>
        <span class='puntos-badge'>${puntos}</span>
      </div>
      <div class='progress mb-2'><div class='progress-bar bg-success' role='progressbar' style='width: ${porc}%' aria-valuenow='${porc}' aria-valuemin='0' aria-valuemax='100'></div></div>
      <small>${falta > 0 ? falta + ' puntos para el siguiente nivel' : '¡Nivel máximo alcanzado!'}</small>
    `;
    // Si no hay código de referido, asignar uno
    if (!user.codigoRef) {
      user.codigoRef = 'LEVEL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('usuariosLevelUp', JSON.stringify(usuarios));
    }
    document.getElementById('perfilReferido').innerHTML = `
      <h5>Tu código de referido</h5>
      <div class='input-group mb-2'>
        <input type='text' class='form-control' value='${user.codigoRef}' readonly>
        <button class='btn btn-outline-light' id='btnCopiarRef'>Copiar</button>
      </div>
      <small>Comparte este código con amigos y gana 100 puntos por cada referido.</small>
    `;
    document.getElementById('perfilCanje').innerHTML = `
      <h5>Canjea tus puntos LevelUp</h5>
      <div class='mb-2' style='font-size:1.08em;'>
        <span>Tus puntos disponibles:</span>
        <span class='puntos-badge'>${user.puntos||0}</span>
      </div>
      <ul class='list-group mb-2'>
        <li class='list-group-item bg-transparent text-primary border-secondary'>
          <span class='fw-bold'>100 pts</span>: 5% de descuento en tu próxima compra
          <button class='btn btn-sm float-end' onclick='canjear(100,5)'>Canjear</button>
        </li>
        <li class='list-group-item bg-transparent text-primary border-secondary'>
          <span class='fw-bold'>300 pts</span>: 15% de descuento
          <button class='btn btn-sm float-end' onclick='canjear(300,15)'>Canjear</button>
        </li>
        <li class='list-group-item bg-transparent text-primary border-secondary'>
          <span class='fw-bold'>600 pts</span>: Producto sorpresa
          <button class='btn btn-sm float-end' onclick='canjear(600,0)'>Canjear</button>
        </li>
      </ul>
      <div id='canjeMsg'></div>
    `;
    setTimeout(()=>{
      const btn = document.getElementById('btnCopiarRef');
      if(btn) btn.onclick = function() {
        navigator.clipboard.writeText(user.codigoRef);
        alert('Código copiado al portapapeles');
      };
    }, 100);
  }
  // Formulario de perfil (preferencias, etc)
  const form = document.getElementById('perfilForm');
  const msg = document.getElementById('perfilMsg');
  if(user) {
    if(user.nombre) document.getElementById('nombrePerfil').value = user.nombre;
    if(user.apellido) document.getElementById('apellidoPerfil').value = user.apellido || '';
    if(user.correo) document.getElementById('correoPerfil').value = user.correo;
    // Mostrar fecha en formato yyyy-mm-dd para el input, pero guardar y mostrar en dd/mm/yyyy
    if(user.nacimiento) {
      let nac = user.nacimiento;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(nac)) {
        // Convertir dd/mm/yyyy a yyyy-mm-dd para el input
        const [dd, mm, yyyy] = nac.split('/');
        nac = `${yyyy}-${mm}-${dd}`;
      }
      document.getElementById('nacimientoPerfil').value = nac;
    }
    if(user.telefono) document.getElementById('telefonoPerfil').value = user.telefono || '';
  }
  if(form) form.addEventListener('submit', function(e) {
    e.preventDefault();
    if(!user) return;
    user.nombre = document.getElementById('nombrePerfil').value.trim();
    user.apellido = document.getElementById('apellidoPerfil').value.trim();
    user.correo = document.getElementById('correoPerfil').value.trim();
    // Guardar fecha en formato dd/mm/yyyy
    let nac = document.getElementById('nacimientoPerfil').value;
    if (nac && nac.includes('-')) {
      const [yyyy, mm, dd] = nac.split('-');
      nac = `${dd}/${mm}/${yyyy}`;
    }
    user.nacimiento = nac;
    user.telefono = document.getElementById('telefonoPerfil').value.trim();
    // Preferencias y ofertas (opcional)
    user.preferencias = Array.from(document.getElementById('preferenciasPerfil').selectedOptions).map(opt=>opt.value);
    // user.ofertas = document.getElementById('ofertasPerfil').checked; // Si se usa checkbox
    setTimeout(()=>{msg.innerHTML = '<div class="alert alert-success">¡Perfil actualizado correctamente!</div>';}, 100);
    localStorage.setItem('usuariosLevelUp', JSON.stringify(usuarios));
  });
});

// Canje de puntos (simulado) para perfil.html
function canjear(pts, desc) {
  const email = localStorage.getItem('usuarioActivoLevelUp');
  const usuarios = JSON.parse(localStorage.getItem('usuariosLevelUp') || '[]');
  const user = usuarios.find(u => u.correo === email);
  if(!user) return;
  if((user.puntos||0) < pts) {
    document.getElementById('canjeMsg').innerHTML = '<div class="alert alert-danger">No tienes suficientes puntos.</div>';
    return;
  }
  user.puntos -= pts;
  user.nivel = calcularNivel(user.puntos);
  localStorage.setItem('usuariosLevelUp', JSON.stringify(usuarios));
  document.getElementById('canjeMsg').innerHTML = `<div class='alert alert-success'>¡Canje exitoso! ${desc > 0 ? desc + '% de descuento aplicado.' : '¡Reclama tu producto sorpresa en tienda!'}</div>`;
  setTimeout(()=>window.location.reload(), 1200);
}

function nombreNivel(nivel) {
  return ['Beginner','Bronze','Explorer','Silver','Gold','Platinum'][nivel] || 'Beginner';
}
// --- Login de usuario ---
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('form');
  if (loginForm && window.location.pathname.includes('logueo.html')) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const correo = loginForm.querySelector('input[type="email"]').value.trim().toLowerCase();
      const password = loginForm.querySelector('input[type="password"]').value;
      let usuarios = JSON.parse(localStorage.getItem('usuariosLevelUp') || '[]');
      const msg = document.getElementById('loginMsg') || (() => {
        const p = document.createElement('div');
        p.id = 'loginMsg';
        p.className = 'mt-2 text-center';
        loginForm.parentNode.appendChild(p);
        return p;
      })();
      const user = usuarios.find(u => u.correo === correo);
      if (!user) {
        msg.textContent = 'El correo no está registrado. Por favor, crea una cuenta.';
        msg.classList.add('text-danger');
        msg.classList.remove('text-success');
        return;
      }
      if (user.password !== password) {
        msg.textContent = 'Contraseña incorrecta.';
        msg.classList.add('text-danger');
        msg.classList.remove('text-success');
        return;
      }
      // Login exitoso
      localStorage.setItem('usuarioActivoLevelUp', correo);
      msg.textContent = '¡Bienvenido! Redirigiendo...';
      msg.classList.remove('text-danger');
      msg.classList.add('text-success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    });
  }
});
// --- Registro de usuario ---
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
    // Validar campos vacíos (sin exigir código de referido)
    if(!nombre || !correo || !password || !nacimiento || !terminos) {
      msg.innerHTML = '<div class="alert alert-danger">Completa todos los campos obligatorios y acepta los términos.</div>';
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
    // Si hay código de referido, intenta validar; si no, ignora y permite registro
    if(codigoReferido) {
      const refUser = usuarios.find(u => u.codigoRef === codigoReferido);
      if(refUser) {
        refUser.puntos = (refUser.puntos || 0) + 100;
        puntos += 100;
        refOk = true;
        nivel = calcularNivel(puntos);
      }
      // Si no existe el referido, simplemente no suma puntos, pero no bloquea el registro
    }
    // Guardar usuario
    const nuevoUsuario = {nombre, correo, password, nacimiento, descuento, puntos, nivel, codigoRef: refCode};
    usuarios.push(nuevoUsuario);
    setUsuarios(usuarios);
    guardarUsuarioActivo(correo);
    let msgExtra = '';
    if(descuento) msgExtra += ' Como usuario Duoc tienes 20% de descuento de por vida.';
    if(refOk) msgExtra += ' ¡Felicitaciones! Tú y tu referido ganaron 100 puntos LevelUp.';
    msg.innerHTML = '<div class="alert alert-success">¡Registro exitoso! Redirigiendo a la tienda...</div>';
    form.reset();
    setTimeout(function() {
      window.location.href = 'index.html';
    }, 1200);
  });
});

function calcularNivel(puntos) {
  if(puntos >= 1000) return 5;
  if(puntos >= 600) return 4;
  if(puntos >= 300) return 3;
  if(puntos >= 150) return 2;
  return 1;
}


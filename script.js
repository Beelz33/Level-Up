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


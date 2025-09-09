// Actualiza la burbuja del carrito en todas las páginas
function actualizarBurbujaCarrito() {
  var badge = document.getElementById('cart-badge');
  if (!badge) return;
  var carrito = JSON.parse(localStorage.getItem('carritoLevelUp') || '[]');
  badge.textContent = carrito.length;
  badge.style.display = carrito.length > 0 ? 'inline-block' : 'none';
}
document.addEventListener('DOMContentLoaded', actualizarBurbujaCarrito);
// Permite que otros scripts llamen a actualizarBurbujaCarrito después de agregar productos
window.actualizarBurbujaCarrito = actualizarBurbujaCarrito;

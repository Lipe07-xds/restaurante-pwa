const API_URL = 'https://restaurante-api-filipe.onrender.com/api/orders';

const form = document.getElementById('order-form');
const orderId = document.getElementById('order-id');
const customerName = document.getElementById('customerName');
const tableNumber = document.getElementById('tableNumber');
const orderItem = document.getElementById('orderItem');
const ordersList = document.getElementById('orders-list');
const message = document.getElementById('message');
const cancelEdit = document.getElementById('cancel-edit');

function formatDate(date) {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

async function loadOrders() {
  try {
    const response = await fetch(API_URL);
    const orders = await response.json();

    if (!orders.length) {
      ordersList.innerHTML = '<p class="text-center">Nenhum pedido ativo.</p>';
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <div class="col-md-6">
        <div class="order-card">
          <div class="d-flex justify-content-between">
            <h5 class="mb-1">${order.customerName} - Mesa ${order.tableNumber}</h5>
            <span class="status-badge">${order.status}</span>
          </div>
          <p class="mb-1 text-muted">${order.orderItem}</p>
          <small class="text-muted">Pedido às: ${formatDate(order.orderedAt)}</small>
          <div class="mt-2">
            <button class="btn btn-sm btn-outline-primary" onclick="editOrder('${order._id}')">Editar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder('${order._id}')">Excluir</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    message.textContent = 'Erro ao conectar com o servidor.';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = orderId.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: customerName.value,
      tableNumber: tableNumber.value,
      orderItem: orderItem.value
    })
  });

  message.textContent = id ? 'Pedido atualizado!' : 'Pedido enviado para a cozinha!';
  form.reset();
  orderId.value = '';
  loadOrders();
});

window.editOrder = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  const order = await res.json();
  orderId.value = order._id;
  customerName.value = order.customerName;
  tableNumber.value = order.tableNumber;
  orderItem.value = order.orderItem;
  cancelEdit.classList.remove('hidden');
};

window.deleteOrder = async (id) => {
  if (confirm('Finalizar pedido?')) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadOrders();
  }
};

cancelEdit.addEventListener('click', () => {
  form.reset();
  orderId.value = '';
  cancelEdit.classList.add('hidden');
});

document.getElementById('reload-btn').addEventListener('click', loadOrders);

loadOrders();
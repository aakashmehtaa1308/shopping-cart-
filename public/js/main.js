const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);

//change order status

let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');

let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order); // string to json.

let time = document.createElement('small');

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove('step-completed');
    status.classList.remove('current');
  });

  let stepCompleted = true;

  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add('step-completed');
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = order.updatedAt;
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add('current');
      }
    }
  });
}

updateStatus(order);

//socket
let socket = io();

//join
if (order) {
  socket.emit('join', `order_${order._id}`);
}
//room like order_hjdhsjdhjsdhjshdjshd

// let adminAreaPath = window.location.pathname; //gives the path of current window after localhost
// console.log(adminAreaPath);
// if(adminAreaPath.includes('admin')) {
//   socket.emit('join', 'adminRoom');
// }

socket.on('orderUpdated', (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = new Date();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  console.log(data);
});

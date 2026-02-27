const PRODUCTS = [
  {id:'veg1', name:'Tomatoes (1kg)', price:40, category:'Vegetable', color:'#f28b82'},
  {id:'veg2', name:'Spinach (bunch)', price:20, category:'Vegetable', color:'#a7f3a0'},
  {id:'fr1', name:'Banana (dozen)', price:50, category:'Fruit', color:'#ffe082'},
  {id:'fr2', name:'Mangoes (1kg)', price:120, category:'Fruit', color:'#ffb74d'},
  {id:'rice1', name:'Basmati Rice (5kg)', price:360, category:'Rice', color:'#fff59d'},
  {id:'milk1', name:'Fresh Milk (1L)', price:35, category:'Dairy', color:'#e0f7fa'}
];

function imgData(name, color){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='#2b2b2b'>${name}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getCart(){
  return JSON.parse(localStorage.getItem('farmCart')||'{}');
}
function saveCart(cart){
  localStorage.setItem('farmCart', JSON.stringify(cart));
}

function updateCartCount(){
  const cart = getCart();
  const total = Object.values(cart).reduce((s,i)=>s + i.qty,0);
  document.getElementById('cart-count').textContent = total;
}

function renderProducts(){
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className='product-card';
    const img = document.createElement('img'); img.src = imgData(p.name, p.color); img.alt = p.name;
    const info = document.createElement('div'); info.className='product-info';
    const title = document.createElement('div'); title.textContent = p.name;
    const price = document.createElement('div'); price.className='price'; price.textContent = '₹'+p.price;
    info.appendChild(title); info.appendChild(price);
    const actions = document.createElement('div'); actions.className='product-actions';
    const btn = document.createElement('button'); btn.className='btn primary'; btn.textContent='Add to Cart'; btn.onclick = ()=> addToCart(p);
    actions.appendChild(btn);
    card.appendChild(img); card.appendChild(info); card.appendChild(actions);
    grid.appendChild(card);
  });
}

function addToCart(product){
  const cart = getCart();
  if(cart[product.id]) cart[product.id].qty += 1;
  else cart[product.id] = {id:product.id, name:product.name, price:product.price, qty:1, img:imgData(product.name, product.color)};
  saveCart(cart);
  updateCartCount();
  flashMessage(`${product.name} added to cart`);
  renderCart();
}

function flashMessage(text){
  const el = document.createElement('div'); el.textContent = text; el.style.position='fixed'; el.style.right='1rem'; el.style.bottom='1rem'; el.style.background='var(--green-600)'; el.style.color='white'; el.style.padding='0.6rem 0.8rem'; el.style.borderRadius='8px'; el.style.boxShadow='0 8px 20px rgba(0,0,0,0.12)'; document.body.appendChild(el);
  setTimeout(()=> el.style.opacity='0',1600); setTimeout(()=> el.remove(),2200);
}

function renderCart(){
  const contents = document.getElementById('cart-contents');
  const actions = document.getElementById('cart-actions');
  const cart = getCart();
  contents.innerHTML = '';
  actions.innerHTML = '';
  const keys = Object.keys(cart);
  if(keys.length===0){
    contents.innerHTML = '<div class="cart-empty">Your cart is empty. Browse fresh products above.</div>';
    return;
  }
  let total = 0;
  keys.forEach(k=>{
    const item = cart[k];
    total += item.price*item.qty;
    const div = document.createElement('div'); div.className='cart-item';
    const img = document.createElement('img'); img.src = item.img; img.alt=item.name;
    const meta = document.createElement('div'); meta.style.flex='1';
    const name = document.createElement('div'); name.textContent = item.name;
    const price = document.createElement('div'); price.className='muted'; price.textContent = '₹'+item.price + ' each';
    const qty = document.createElement('div'); qty.className='qty-controls';
    const minus = document.createElement('button'); minus.className='btn'; minus.textContent='−'; minus.onclick = ()=> changeQty(item.id, -1);
    const num = document.createElement('span'); num.textContent = item.qty;
    const plus = document.createElement('button'); plus.className='btn'; plus.textContent='+'; plus.onclick = ()=> changeQty(item.id, +1);
    qty.appendChild(minus); qty.appendChild(num); qty.appendChild(plus);
    const remove = document.createElement('button'); remove.className='btn'; remove.textContent='Remove'; remove.onclick = ()=> removeItem(item.id);
    meta.appendChild(name); meta.appendChild(price); meta.appendChild(qty); meta.appendChild(remove);
    const subtotal = document.createElement('div'); subtotal.className='text-right'; subtotal.textContent = '₹'+(item.price*item.qty);
    div.appendChild(img); div.appendChild(meta); div.appendChild(subtotal);
    contents.appendChild(div);
  });
  const totDiv = document.createElement('div'); totDiv.className='product-card'; totDiv.style.padding='1rem'; totDiv.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>Total</strong><strong>₹${total}</strong></div>`;
  actions.appendChild(totDiv);
  const checkoutBtn = document.createElement('button'); checkoutBtn.className='btn primary'; checkoutBtn.textContent='Proceed to Checkout'; checkoutBtn.onclick = ()=> beginCheckout(total);
  const clearBtn = document.createElement('button'); clearBtn.className='btn'; clearBtn.textContent='Clear Cart'; clearBtn.onclick = ()=> { if(confirm('Clear the cart?')){ localStorage.removeItem('farmCart'); renderCart(); updateCartCount(); }};
  actions.appendChild(checkoutBtn); actions.appendChild(clearBtn);
}

function changeQty(id, delta){
  const cart = getCart();
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart(cart); renderCart(); updateCartCount();
}

function removeItem(id){
  const cart = getCart(); if(cart[id]) delete cart[id]; saveCart(cart); renderCart(); updateCartCount();
}

function beginCheckout(total){
  document.getElementById('checkout-summary').textContent = `You will pay ₹${total}. (Demo checkout)`;
  document.getElementById('checkout').classList.remove('hidden');
  window.location.hash = '#checkout';
}

function confirmCheckout(){
  const cart = getCart();
  const orderData = {
    items: cart,
    timestamp: new Date().toLocaleString(),
    orderID: 'ORD-' + Date.now()
  };
  localStorage.removeItem('farmCart');
  renderCart();
  updateCartCount();
  document.getElementById('checkout').classList.add('hidden');
  showBill(orderData);
}

function showBill(orderData){
  const billContent = document.getElementById('bill-content');
  const cartItems = orderData.items;
  let total = 0;
  let itemsHTML = '<table style="width:100%; border-collapse:collapse"><tr style="border-bottom:1px solid #e4e7ea; font-weight:600"><td style="padding:0.5rem; text-align:left">Item</td><td style="padding:0.5rem; text-align:center">Qty</td><td style="padding:0.5rem; text-align:right">Price</td></tr>';
  
  Object.values(cartItems).forEach(item=>{
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    itemsHTML += `<tr style="border-bottom:1px solid #e4e7ea"><td style="padding:0.5rem">${item.name}</td><td style="padding:0.5rem; text-align:center">${item.qty}</td><td style="padding:0.5rem; text-align:right">₹${itemTotal}</td></tr>`;
  });
  
  itemsHTML += '</table>';
  
  billContent.innerHTML = `
    <p style="text-align:center; color:var(--muted); font-size:0.9rem"><strong>Order ID:</strong> ${orderData.orderID}</p>
    <p style="text-align:center; color:var(--muted); font-size:0.9rem"><strong>Date & Time:</strong> ${orderData.timestamp}</p>
    <div style="margin:1.5rem 0">${itemsHTML}</div>
    <div style="display:flex; justify-content:space-between; margin-top:1rem; padding:1rem 0; border-top:2px solid var(--green-600); border-bottom:2px solid var(--green-600); font-size:1.1rem; font-weight:700; color:var(--green-600)">
      <span>Total Amount:</span>
      <span>₹${total}</span>
    </div>
    <div style="text-align:center; margin-top:1.5rem; padding:1rem; background:var(--accent); border-radius:8px; color:var(--muted)">
      <p style="margin:0.5rem 0">Thank you for your order!</p>
      <p style="margin:0.5rem 0">Farmer Ramu will contact you within 24 hours.</p>
      <p style="margin:0.5rem 0 0">Phone: +91 98765 43210</p>
    </div>
  `;
  
  document.getElementById('bill').classList.remove('hidden');
  window.location.hash = '#bill';
}

function closeBill(){
  document.getElementById('bill').classList.add('hidden');
  window.location.hash = '#home';
}

function cancelCheckout(){ document.getElementById('checkout').classList.add('hidden'); }

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
  updateCartCount();

  document.getElementById('contact-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const msg = document.getElementById('contact-message').value.trim();
    if(!name || !phone || !msg){ alert('Please fill all fields'); return; }
    console.log('Contact message', {name, phone, msg});
    alert('Message sent. Farmer will contact you soon.');
    e.target.reset();
  });

  document.getElementById('confirm-checkout').addEventListener('click', confirmCheckout);
  document.getElementById('cancel-checkout').addEventListener('click', cancelCheckout);
  document.getElementById('print-bill').addEventListener('click', ()=> window.print());
  document.getElementById('close-bill').addEventListener('click', closeBill);

  // Nav toggle for small screens
  const toggle = document.querySelector('.nav-toggle');
  toggle.addEventListener('click', ()=>{
    const nav = document.querySelector('.nav-links');
    nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
    nav.style.flexDirection = 'column';
  });

  // smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const target = document.querySelector(a.getAttribute('href'));
      if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });
});

async function load() {
  const res = await fetch('http://localhost:3000/items');
  const data = await res.json();
  document.getElementById('items').innerHTML =
    data.map(i => `<li>${i.name}</li>`).join('');
}

async function addItem() {
  const name = document.getElementById('name').value;
  await fetch('http://localhost:3000/items', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name, status:'available' })
  });
  load();
}

load();

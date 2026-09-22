const weddingDate = new Date('2027-02-27T18:00:00-03:00');

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = '<p>Hoy celebramos 🤍</p>';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.getElementById('days').textContent = String(days).padStart(3, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Personalización simple mediante URL, por ejemplo: ?invitado=Seba&cupos=2
const params = new URLSearchParams(window.location.search);
const guest = params.get('invitado');
const seats = params.get('cupos');

if (guest) {
  document.getElementById('guest-title').textContent = `${guest}, ¿nos acompañas?`;
  if (seats) {
    const n = Number(seats);
    document.getElementById('guest-copy').textContent = n === 1
      ? 'Tu invitación considera 1 cupo. Nos encantará contar contigo.'
      : `Tu invitación considera ${n} cupos. Nos encantará celebrar juntos.`;
  }
}

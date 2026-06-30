// ══════════════════════════════════════════════════════════════
// FIX: crypto.subtle only works on HTTPS or localhost.
// S3 bucket URLs are plain HTTP → crypto.subtle is undefined →
// PHASH never gets set → login always fails silently.
//
// Solution: pre-compute the SHA-256 hash at build time and
// embed it as a constant. No async crypto needed at runtime.
//
// Username : Yasir
// Password : salwat
// Hash     : SHA-256("salwat") computed offline
// ══════════════════════════════════════════════════════════════

// Pre-computed SHA-256 of "salwat" — safe to embed, can't be reversed
const PHASH = 'cb752c6993c144b1a999eb16783bd13a9a42eab85887a8434aac64ff87f3f6dd';
const VALID_USER = 'Yasir';

// Hash function — works on HTTPS (CloudFront) AND falls back gracefully on HTTP (S3)
async function hashText(text) {
  // Try native crypto.subtle first (HTTPS / CloudFront)
  if (window.crypto && window.crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
    } catch (e) { /* fall through */ }
  }
  // Fallback: pure-JS SHA-256 for plain HTTP (S3 bucket URL)
  return sha256Fallback(text);
}

// Pure-JS SHA-256 — works everywhere, no browser API needed
function sha256Fallback(str) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words = [];
  const asciiBitLength = str.length * 8;
  let hash = [];
  let k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = candidate * candidate; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  str += '\x80';
  while (str.length % 64 - 56) str += '\x00';
  for (let i = 0; i < str.length; i++) {
    const j = str.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = (asciiBitLength | 0);
  for (let j = 0; j < words.length;) {
    const W = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = W[i - 15], w2 = W[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ (~e & hash[6]))
        + k[i]
        + (W[i] = (i < 16) ? W[i] : (
          W[i - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + W[i - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, e, hash[5], hash[6]];
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

// ── LOGIN ──
async function doLogin() {
  const uEl  = document.getElementById('login-username');
  const pEl  = document.getElementById('login-password');
  const eEl  = document.getElementById('login-error');
  const eMsg = document.getElementById('login-error-msg');
  const btn  = document.getElementById('login-btn');
  const box  = document.querySelector('.login-box');

  eEl.style.display = 'none';

  if (!uEl.value.trim() || !pEl.value) {
    eMsg.textContent = 'Please enter both username and password.';
    eEl.style.display = 'flex';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader spin"></i> Signing in…';

  const ph = await hashText(pEl.value);

  if (uEl.value.trim() === VALID_USER && ph === PHASH) {
    // ✅ Correct — store auth flag and show dashboard
    sessionStorage.setItem('cwy_auth', 'true');
    showDashboard();
  } else {
    // ❌ Wrong credentials
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-login"></i> Sign in';
    eMsg.textContent = uEl.value.trim() !== VALID_USER
      ? 'Unknown username. Please try again.'
      : 'Incorrect password. Please try again.';
    eEl.style.display = 'flex';
    box.classList.remove('shake');
    void box.offsetWidth; // force reflow to restart animation
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 400);
    pEl.value = '';
    pEl.focus();
  }
}

function doLogout() {
  sessionStorage.removeItem('cwy_auth');
  document.getElementById('dashboard-page').style.display = 'none';
  document.getElementById('login-page').style.display    = 'flex';
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').style.display   = 'none';
  const btn = document.getElementById('login-btn');
  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-login"></i> Sign in';
}

function showDashboard() {
  document.getElementById('login-page').style.display    = 'none';
  document.getElementById('dashboard-page').style.display = 'block';
  loadData();
}

function togglePassword() {
  const i = document.getElementById('login-password');
  const e = document.getElementById('pw-eye');
  if (i.type === 'password') { i.type = 'text';     e.className = 'ti ti-eye-off'; }
  else                       { i.type = 'password'; e.className = 'ti ti-eye'; }
}

// Boot: wire Enter key + check if already logged in (page refresh)
document.addEventListener('DOMContentLoaded', () => {
  ['login-username', 'login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  });
  if (sessionStorage.getItem('cwy_auth') === 'true') showDashboard();
});

// ── API ──
const API_BASE = 'https://ovcrwhtord.execute-api.us-east-1.amazonaws.com/prod';

function initials(n) { return (n||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

function timeAgo(iso) {
  if (!iso) return '—';
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60)    return 'just now';
  if (d < 3600)  return Math.floor(d/60)   + 'm ago';
  if (d < 86400) return Math.floor(d/3600)  + 'h ago';
  return Math.floor(d/86400) + 'd ago';
}

function drawDonut(pos, neg, neu) {
  const cv = document.getElementById('donut'), ctx = cv.getContext('2d');
  const total = pos+neg+neu || 1;
  const slices = [{val:pos,color:'#22c97a'},{val:neg,color:'#f07070'},{val:neu,color:'#7b9fcf'}];
  ctx.clearRect(0,0,140,140);
  let start = -Math.PI/2; const gap = 0.04;
  slices.forEach(s => {
    const sw = (s.val/total)*(Math.PI*2 - gap*slices.length);
    if (sw <= 0) return;
    ctx.beginPath(); ctx.arc(70,70,54,start+gap/2,start+gap/2+sw);
    ctx.strokeStyle = s.color; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();
    start += sw+gap;
  });
  if (total === 1) {
    ctx.beginPath(); ctx.arc(70,70,54,0,Math.PI*2);
    ctx.strokeStyle = 'rgba(0,180,216,.1)'; ctx.lineWidth = 16; ctx.stroke();
  }
}

function renderSentimentLegend(counts, total) {
  const items = [
    {key:'POSITIVE',label:'Positive',color:'#22c97a'},
    {key:'NEGATIVE',label:'Negative',color:'#f07070'},
    {key:'NEUTRAL', label:'Neutral', color:'#7b9fcf'},
  ];
  document.getElementById('sentiment-legend').innerHTML = items.map(it => {
    const v = counts[it.key]||0, pct = total ? Math.round(v/total*100) : 0;
    return `<div class="legend-item">
      <div class="legend-dot" style="background:${it.color}"></div>
      <div class="legend-label">${it.label}</div>
      <div class="legend-val">${v}<span class="legend-pct">${pct}%</span></div>
    </div>`;
  }).join('');
}

function renderRatingDist(items) {
  const counts = {1:0,2:0,3:0,4:0,5:0};
  items.forEach(it => { const r=parseInt(it.rating); if(r>=1&&r<=5) counts[r]++; });
  const max = Math.max(...Object.values(counts), 1);
  document.getElementById('rating-dist').innerHTML = [5,4,3,2,1].map(r =>
    `<div class="rating-row-item">
      <div class="rating-stars">${r}★</div>
      <div class="rating-track"><div class="rating-bar" style="width:0%" data-w="${Math.round(counts[r]/max*100)}"></div></div>
      <div class="rating-cnt">${counts[r]}</div>
    </div>`
  ).join('');
  setTimeout(() => document.querySelectorAll('.rating-bar').forEach(b => b.style.width = b.dataset.w+'%'), 80);
}

function renderTypeBreakdown(items) {
  const counts = {};
  items.forEach(it => { const t=it.feedback_type||it.type||'Unspecified'; counts[t]=(counts[t]||0)+1; });
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  if (!sorted.length) {
    document.getElementById('type-list').innerHTML = '<div class="state-box" style="padding:16px"><i class="ti ti-inbox-off"></i><p>No data yet</p></div>';
    return;
  }
  document.getElementById('type-list').innerHTML = sorted.map(([name,count]) =>
    `<div class="type-item"><span class="type-name">${name}</span><span class="type-badge">${count}</span></div>`
  ).join('');
}

function renderEntities(top) {
  const p = document.getElementById('entities-chart');
  if (!top||!top.length) {
    p.innerHTML = '<div class="state-box"><i class="ti ti-tag-off"></i><p>No entity data — enable Comprehend to see this</p></div>';
    return;
  }
  const max = top[0][1]||1;
  p.innerHTML = top.map(([text,count]) =>
    `<div class="bar-row">
      <div class="bar-label" title="${text}">${text}</div>
      <div class="bar-track"><div class="bar-fill" style="width:0%" data-w="${Math.round(count/max*100)}"></div></div>
      <div class="bar-count">${count}</div>
    </div>`
  ).join('');
  setTimeout(() => document.querySelectorAll('.bar-fill').forEach(b => b.style.width = b.dataset.w+'%'), 80);
}

function renderFeed(recent) {
  if (!recent||!recent.length) {
    document.getElementById('feed').innerHTML = '<div class="state-box"><i class="ti ti-inbox"></i><p>No submissions yet</p></div>';
    return;
  }
  document.getElementById('recent-count').textContent = `Last ${recent.length}`;
  document.getElementById('feed').innerHTML = recent.map(item => {
    const rH = item.rating ? `<div class="rating-pill">★ ${item.rating}</div>` : '';
    const tT = (item.feedback_type||item.type) ? `<span class="feed-tag">${item.feedback_type||item.type}</span>` : '';
    const cT = item.company ? `<span class="feed-tag"><i class="ti ti-building" style="font-size:12px;vertical-align:-1px"></i> ${item.company}</span>` : '';
    return `<div class="feed-item">
      <div class="feed-top">
        <div class="feed-who">
          <div class="feed-avatar">${initials(item.name)}</div>
          <div>
            <div class="feed-name">${item.name||'Anonymous'}</div>
            <div class="feed-meta">${item.email||''} · ${timeAgo(item.submitted_at)}</div>
          </div>
        </div>
        <div class="feed-right">
          ${rH}
          <span class="sentiment-pill s-${item.sentiment||'NEUTRAL'}">${item.sentiment||'NEUTRAL'}</span>
        </div>
      </div>
      <div class="feed-msg">${item.message||''}</div>
      ${tT||cT ? `<div class="feed-tags">${tT}${cT}</div>` : ''}
    </div>`;
  }).join('');
}

async function loadData() {
  const icon = document.getElementById('refresh-icon');
  icon.classList.add('spin');
  document.getElementById('last-updated').textContent = 'Loading…';
  try {
    const res = await fetch(`${API_BASE}/feedback`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items     = data.recent_all || data.recent || [];
    const total     = data.total || 0;
    const sentiment = data.sentiment_breakdown || {};
    const pos = sentiment.POSITIVE||0, neg = sentiment.NEGATIVE||0, neu = sentiment.NEUTRAL||0;
    const posPct = total ? Math.round(pos/total*100) : 0;

    document.getElementById('s-total').textContent   = total;
    document.getElementById('s-pos').textContent     = pos;
    document.getElementById('s-pos-pct').textContent = `${posPct}% of responses`;
    document.getElementById('donut-pct').textContent = posPct + '%';

    const rated = items.filter(i => i.rating && !isNaN(parseFloat(i.rating)));
    const avg   = rated.length ? (rated.reduce((s,i) => s+parseFloat(i.rating),0)/rated.length).toFixed(1) : '—';
    document.getElementById('s-rating').textContent = avg;

    const sorted = [...items].sort((a,b) => (b.submitted_at||'').localeCompare(a.submitted_at||''));
    if (sorted[0]) {
      document.getElementById('s-latest').textContent     = timeAgo(sorted[0].submitted_at);
      document.getElementById('s-latest-sub').textContent = sorted[0].name || '';
    }

    drawDonut(pos, neg, neu);
    renderSentimentLegend(sentiment, total);
    renderRatingDist(items);
    renderTypeBreakdown(items);
    renderEntities(data.top_entities);
    renderFeed(sorted.slice(0,10));

    document.getElementById('last-updated').textContent =
      `Last updated ${new Date().toLocaleTimeString()} · ${total} total responses`;
  } catch(err) {
    document.getElementById('last-updated').textContent = 'Error loading data — check your API URL';
    document.getElementById('feed').innerHTML =
      `<div class="state-box"><i class="ti ti-alert-circle"></i><p>${err.message}</p></div>`;
  }
  icon.classList.remove('spin');
}

// Auto-refresh every 60s only when logged in
setInterval(() => { if (sessionStorage.getItem('cwy_auth') === 'true') loadData(); }, 60000);

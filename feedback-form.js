// ✅ STEP: Replace this with your REST API invoke URL after deployment
// Format: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/feedback
const API_URL = 'https://ovcrwhtord.execute-api.us-east-1.amazonaws.com/prod/feedback';

document.querySelectorAll('.rb').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.rb').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    document.getElementById('rating').value = b.dataset.v;
  });
});

document.getElementById('feedback-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const st = document.getElementById('status');
  st.textContent = 'Sending...';
  st.className = '';

  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    company: document.getElementById('company').value,
    type: document.getElementById('type').value,
    message: document.getElementById('message').value,
    rating: document.getElementById('rating').value
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      st.textContent = '✓ Thank you! Your feedback has been received.';
      st.className = 'ok';
      e.target.reset();
      document.querySelectorAll('.rb').forEach(x => x.classList.remove('on'));
      document.getElementById('rating').value = '';
    } else {
      st.textContent = 'Something went wrong — please try again.';
      st.className = 'err';
    }
  } catch {
    st.textContent = 'Network error — please check your connection.';
    st.className = 'err';
  }
});

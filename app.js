// ─────────────────────────────────────────────
//  Prof. Pip — English Teacher
//  Webhook: n8n backend
// ─────────────────────────────────────────────

const WEBHOOK = 'https://n8n.srv1045037.hstgr.cloud/webhook/2f043674-bbf1-47b1-b6c3-157454d35813';

const INTRO = "Hi there! I'm Professor Pip, your personal English teacher. I'll start by getting to know you a little, then give you a short quiz to find your level — and we'll build from there. Ready? Say hello and tell me your name!";
const INTRO_OPTIONS = ["Hi! My name is…", "Let's start!", "How does this work?"];

// ── State ──────────────────────────────────────
let isLoading = false;
let speechTimeout = null;

// ── DOM refs ───────────────────────────────────
const avatarWrap  = document.getElementById('avatar-wrap');
const speechBubble = document.getElementById('speech-bubble');
const speechText  = document.getElementById('speech-text');
const chatHistory = document.getElementById('chat-history');
const optionsWrap = document.getElementById('options-wrap');
const optionsLabel = document.getElementById('options-label');
const textInput   = document.getElementById('text-input');
const sendBtn     = document.getElementById('send-btn');

// ── UI helpers ─────────────────────────────────
function setControls(enabled) {
  textInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
  document.querySelectorAll('.opt-btn').forEach(b => b.disabled = !enabled);
}

function pipSpeak(text) {
  speechText.textContent = text;
  speechBubble.classList.remove('loading');
  avatarWrap.classList.add('talking');
  if (speechTimeout) clearTimeout(speechTimeout);
  const dur = Math.min(Math.max(text.length * 38, 1000), 4500);
  speechTimeout = setTimeout(() => avatarWrap.classList.remove('talking'), dur);
}

function pipThink() {
  speechBubble.classList.add('loading');
  speechText.textContent = '';
  avatarWrap.classList.remove('talking');
}

function addMsg(text, role) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg ' + role;
  const bub = document.createElement('div');
  bub.className = 'chat-bubble';
  bub.textContent = text;
  wrap.appendChild(bub);
  chatHistory.appendChild(wrap);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showOptions(options) {
  optionsWrap.innerHTML = '';
  if (!options || options.length === 0) {
    optionsLabel.classList.remove('visible');
    return;
  }
  optionsLabel.classList.add('visible');
  options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.textContent = opt;
    btn.style.animationDelay = (i * 0.07) + 's';
    btn.onclick = () => sendMessage(opt);
    optionsWrap.appendChild(btn);
  });
}

function updateLevel(score) {
  if (!score || !score.final_level) return;
  const badge = document.getElementById('level-badge');
  badge.textContent = 'Level ' + score.final_level;
  badge.style.display = 'block';
}

// ── Core: send message to n8n ──────────────────
async function sendMessage(text) {
  if (isLoading || !text.trim()) return;
  isLoading = true;

  textInput.value = '';
  optionsWrap.innerHTML = '';
  optionsLabel.classList.remove('visible');
  setControls(false);

  addMsg(text, 'user');
  pipThink();

  try {
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput: text, message: text })
    });

    const raw = await res.text();
    let reply = '';
    let options = [];
    let score = null;

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      reply   = parsed.reply   || parsed.message || parsed.output || raw;
      options = Array.isArray(parsed.options) ? parsed.options : [];
      score   = parsed.score || null;
    } catch {
      // If n8n returns plain text, use as-is
      reply = raw;
    }

    if (reply) {
      addMsg(reply, 'teacher');
      pipSpeak(reply);
      showOptions(options);
      if (score) updateLevel(score);
    }

  } catch (err) {
    const errMsg = "Oops! I couldn't reach the server. Please check your connection and try again.";
    addMsg(errMsg, 'teacher');
    pipSpeak(errMsg);
    console.error('Webhook error:', err);
  }

  isLoading = false;
  setControls(true);
  textInput.focus();
}

function sendFromInput() {
  const val = textInput.value.trim();
  if (val) sendMessage(val);
}

// ── Event listeners ────────────────────────────
sendBtn.addEventListener('click', sendFromInput);
textInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendFromInput();
});

// ── Init: show intro without calling webhook ───
window.addEventListener('load', () => {
  pipSpeak(INTRO);
  showOptions(INTRO_OPTIONS);
});

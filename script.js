/* script.js — lógica de tentativas e posição */
(() => {
  // State
  const guesses = []; // array of strings

  // Elements
  const input = document.getElementById('guessInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const positionBadge = document.getElementById('positionBadge');
  const guessesList = document.getElementById('guessesList');
  const totalCount = document.getElementById('totalCount');

  const inspectorWord = document.getElementById('inspectorWord');
  const inspectorPos = document.getElementById('inspectorPos');
  const inspectorIndex = document.getElementById('inspectorIndex');
  const inspectorLen = document.getElementById('inspectorLen');

  const btnCopyList = document.getElementById('btnCopyList');
  const btnDownloadJSON = document.getElementById('btnDownloadJSON');
  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');

  // Helpers
  function normalizeWord(w){
    // basic normalization to keep things consistent (remove extra spaces)
    return w.trim();
  }

  function updateUI(){
    // update badge: next position (1º, 2º...)
    const nextPos = guesses.length + (input.value.trim() ? 1 : 0);
    positionBadge.textContent = input.value.trim() ? `${nextPos}º` : '—';
    inspectorWord.textContent = input.value.trim() || '—';
    inspectorPos.textContent = input.value.trim() ? `${nextPos}º` : '—';
    inspectorLen.textContent = input.value.length;
    // caret index
    try {
      inspectorIndex.textContent = input.selectionStart ?? 0;
    } catch(e){
      inspectorIndex.textContent = 0;
    }

    // total count
    totalCount.textContent = guesses.length;
  }

  function renderList(){
    guessesList.innerHTML = '';
    if(guesses.length === 0) {
      const li = document.createElement('li');
      li.className = 'guess-item';
      li.innerHTML = `<div class="guess-left"><div class="guess-pos">—</div><div class="guess-text muted">Nenhuma tentativa</div></div><div></div>`;
      guessesList.appendChild(li);
      return;
    }

    guesses.forEach((g, idx) => {
      const li = document.createElement('li');
      li.className = 'guess-item';
      const pos = idx + 1;
      li.innerHTML = `
        <div class="guess-left">
          <div class="guess-pos">${pos}º</div>
          <div class="guess-text">${escapeHtml(g)}</div>
        </div>
        <div class="guess-right">
          <button class="btn subtle btn-remove" data-idx="${idx}" title="Remover">✕</button>
        </div>
      `;
      guessesList.appendChild(li);
    });

    // attach remove handlers
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.idx);
        if (!Number.isNaN(idx)) {
          guesses.splice(idx, 1);
          renderList();
          updateUI();
        }
      });
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Actions
  function addGuess(){
    const raw = input.value;
    const w = normalizeWord(raw);
    if(!w) return;
    // push and reset
    guesses.push(w);
    input.value = '';
    renderList();
    updateUI();
    input.focus();
  }

  function clearAll(){
    if(!confirm('Limpar todas as tentativas?')) return;
    guesses.length = 0;
    renderList();
    updateUI();
  }

  // Copy list to clipboard
  btnCopyList.addEventListener('click', () => {
    const txt = guesses.map((g, i) => `${i+1}º — ${g}`).join('\n');
    navigator.clipboard?.writeText(txt).then(()=> alert('Lista copiada!'), ()=> alert('Falha ao copiar'));
  });

  // Download JSON
  btnDownloadJSON.addEventListener('click', () => {
    const data = { exportedAt: new Date().toISOString(), guesses: [...guesses] };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contexto-clone-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Export quick (topbar)
  btnExport.addEventListener('click', () => {
    const data = { exportedAt: new Date().toISOString(), guesses: [...guesses] };
    navigator.clipboard?.writeText(JSON.stringify(data)).then(()=> alert('Exportado para área de transferência'), ()=> alert('Falha ao exportar'));
  });

  // Import (prompt)
  btnImport.addEventListener('click', () => {
    const raw = prompt('Cole aqui o JSON para importar (substitui a lista atual)');
    if(!raw) return;
    try {
      const obj = JSON.parse(raw);
      if(Array.isArray(obj.guesses)){
        guesses.length = 0;
        obj.guesses.forEach(s => guesses.push(String(s)));
        renderList();
        updateUI();
        alert('Importado com sucesso');
      } else {
        alert('JSON inválido: campo "guesses" esperado (array).');
      }
    } catch (err){
      alert('JSON inválido');
    }
  });

  // Events
  input.addEventListener('input', updateUI);
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
      e.preventDefault();
      addGuess();
    }
  });

  sendBtn.addEventListener('click', addGuess);
  clearBtn.addEventListener('click', clearAll);

  // init
  renderList();
  updateUI();

})();
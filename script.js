/* ============================================================
   SCRIPT.JS — Lógica completa do To-Do List
   Depende de: index.html (IDs) + style.css (classes)
   ============================================================ */

/* ── Estado da aplicação ─────────────────────────────────── */
let tasks  = [];   // array de objetos de tarefa
let nextId = 1;    // contador de IDs únicos
let filter = 'todas'; // filtro ativo: 'todas' | 'pendentes' | 'concluidas'

/* ── Referências aos elementos do DOM ───────────────────── */
const taskInput      = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const addBtn         = document.getElementById('add-btn');
const taskList       = document.getElementById('task-list');
const taskCounter    = document.getElementById('task-counter');
const clearBtn       = document.getElementById('clear-btn');
const filterBtns     = document.querySelectorAll('.filter-btn');

/* ── Labels e emojis de prioridade ──────────────────────── */
const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const PRIORITY_EMOJI = { alta: '🔴', media: '🟡', baixa: '🟢' };

/* ============================================================
   FUNÇÃO: addTask
   Lê o input e o select, valida, cria o objeto de tarefa
   e chama render() para atualizar a lista na tela.
   ============================================================ */
function addTask() {
  const text     = taskInput.value.trim();
  const priority = prioritySelect.value;

  /* Validação: ambos os campos precisam estar preenchidos */
  if (!text || !priority) {
    taskInput.focus();
    return;
  }

  /* Cria o objeto de tarefa e adiciona no início do array */
  tasks.unshift({
    id:       nextId++,
    text:     text,
    priority: priority,
    done:     false,
  });

  /* Limpa os campos após adicionar */
  taskInput.value   = '';
  prioritySelect.value = '';
  taskInput.focus();

  render();
}

/* ============================================================
   FUNÇÃO: toggleDone
   Alterna o estado concluído/pendente de uma tarefa pelo id.
   ============================================================ */
function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  render();
}

/* ============================================================
   FUNÇÃO: removeTask
   Remove uma tarefa do array pelo id.
   ============================================================ */
function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

/* ============================================================
   FUNÇÃO: clearDone
   Remove todas as tarefas marcadas como concluídas.
   ============================================================ */
function clearDone() {
  tasks = tasks.filter(t => !t.done);
  render();
}

/* ============================================================
   FUNÇÃO: setFilter
   Atualiza o filtro ativo e aplica a classe .active no botão.
   ============================================================ */
function setFilter(newFilter) {
  filter = newFilter;

  /* Atualiza o estado visual dos botões de filtro */
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === newFilter);
  });

  render();
}

/* ============================================================
   FUNÇÃO: render
   Reconstrói a lista de tarefas no DOM com base no estado
   atual (tasks + filter) e atualiza o contador.
   ============================================================ */
function render() {
  /* Filtra as tarefas conforme o filtro ativo */
  const visible = tasks.filter(t => {
    if (filter === 'pendentes')  return !t.done;
    if (filter === 'concluidas') return  t.done;
    return true; // 'todas'
  });

  /* Lista vazia: exibe mensagem informativa */
  if (visible.length === 0) {
    taskList.innerHTML = `
      <li class="empty-msg">Nenhuma tarefa aqui.</li>
    `;
  } else {
    /* Gera o HTML de cada item da lista */
    taskList.innerHTML = visible.map(t => `
      <li class="task-item ${t.done ? 'done' : ''}" data-priority="${t.priority}">

        <!-- Checkbox: marca/desmarca como concluída -->
        <input
          type="checkbox"
          class="task-checkbox"
          id="task-${t.id}"
          ${t.done ? 'checked' : ''}
          onchange="toggleDone(${t.id})"
          aria-label="Marcar como concluída"
        />

        <!-- Texto da tarefa (clicável para alternar) -->
        <label for="task-${t.id}" class="task-label">
          ${escapeHTML(t.text)}
        </label>

        <!-- Badge de prioridade -->
        <span class="badge badge-${t.priority}">
          ${PRIORITY_EMOJI[t.priority]} ${PRIORITY_LABEL[t.priority]}
        </span>

        <!-- Botão de excluir -->
        <button
          type="button"
          class="del-btn"
          onclick="removeTask(${t.id})"
          aria-label="Excluir tarefa"
        >✕</button>

      </li>
    `).join('');
  }

  /* Atualiza o contador de tarefas pendentes */
  const pending = tasks.filter(t => !t.done).length;
  taskCounter.textContent =
    pending === 1 ? '1 tarefa pendente' : `${pending} tarefas pendentes`;
}

/* ============================================================
   FUNÇÃO: escapeHTML
   Evita XSS escapando caracteres especiais no texto da tarefa.
   ============================================================ */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

/* Botão "+ Adicionar" */
addBtn.addEventListener('click', addTask);

/* Enter no campo de texto também adiciona a tarefa */
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

/* Botões de filtro */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

/* Botão "Limpar concluídas" */
clearBtn.addEventListener('click', clearDone);

/* ============================================================
   INICIALIZAÇÃO
   Renderiza a lista ao carregar a página (começa vazia).
   ============================================================ */
render();

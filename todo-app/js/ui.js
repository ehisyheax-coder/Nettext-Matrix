/**
 * UI Module - Handles User Interface Updates and DOM Manipulation
 * Manages rendering, event listeners, and user interactions
 */

const UI = (() => {
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const exportBtn = document.getElementById('exportBtn');
    const totalCount = document.getElementById('totalCount');
    const activeCount = document.getElementById('activeCount');
    const completedCount = document.getElementById('completedCount');

    let currentFilter = 'all';

    /**
     * Render todo items
     * @param {Array} todos - Array of todos to render
     */
    const renderTodos = (todos) => {
        todoList.innerHTML = '';

        if (todos.length === 0) {
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');

        todos.forEach(todo => {
            const li = createTodoElement(todo);
            todoList.appendChild(li);
        });
    };

    /**
     * Create todo element
     * @param {Object} todo - Todo object
     * @returns {HTMLElement} Todo list item
     */
    const createTodoElement = (todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => handleToggleTodo(todo.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        const prioritySpan = document.createElement('span');
        prioritySpan.className = `todo-priority priority-${todo.priority}`;
        prioritySpan.textContent = todo.priority;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.title = 'Edit todo';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', () => handleEditTodo(todo));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.title = 'Delete todo';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => handleDeleteTodo(todo.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(prioritySpan);
        li.appendChild(actionsDiv);

        return li;
    };

    /**
     * Update statistics display
     * @param {Object} stats - Statistics object
     */
    const updateStats = (stats) => {
        totalCount.textContent = stats.total;
        activeCount.textContent = stats.active;
        completedCount.textContent = stats.completed;
    };

    /**
     * Show toast notification
     * @param {string} message - Notification message
     * @param {number} duration - Display duration in ms
     */
    const showToast = (message, duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    };

    /**
     * Clear input field
     */
    const clearInput = () => {
        todoInput.value = '';
        todoInput.focus();
    };

    /**
     * Set filter button active state
     * @param {string} filter - Filter type
     */
    const setActiveFilter = (filter) => {
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        currentFilter = filter;
    };

    /**
     * Get input value
     * @returns {string} Input value
     */
    const getInputValue = () => {
        return todoInput.value;
    };

    /**
     * Get current filter
     * @returns {string} Current filter
     */
    const getCurrentFilter = () => {
        return currentFilter;
    };

    /**
     * Disable/enable buttons
     * @param {HTMLElement} btn - Button element
     * @param {boolean} disabled - Disabled state
     */
    const setButtonDisabled = (btn, disabled) => {
        btn.disabled = disabled;
        btn.style.opacity = disabled ? '0.5' : '1';
    };

    /**
     * Initialize event listeners
     */
    const initEventListeners = () => {
        addBtn.addEventListener('click', handleAddTodo);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddTodo();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                setActiveFilter(filter);
                handleFilterChange(filter);
            });
        });

        clearCompletedBtn.addEventListener('click', handleClearCompleted);
        clearAllBtn.addEventListener('click', handleClearAll);
        exportBtn.addEventListener('click', handleExport);
    };

    return {
        renderTodos,
        createTodoElement,
        updateStats,
        showToast,
        clearInput,
        setActiveFilter,
        getInputValue,
        getCurrentFilter,
        setButtonDisabled,
        initEventListeners
    };
})();

// Event handlers
function handleAddTodo() {
    const text = UI.getInputValue();
    const validation = TodoManager.validateTodo(text);

    if (!validation.valid) {
        UI.showToast(validation.message);
        return;
    }

    const todo = TodoManager.createTodo(text);
    
    if (Storage.addTodo(todo)) {
        UI.clearInput();
        refreshApp();
        UI.showToast('✓ Todo added');
    } else {
        UI.showToast('Failed to add todo', 3000);
    }
}

function handleToggleTodo(id) {
    const todos = Storage.getTodos();
    const todo = todos.find(t => t.id === id);
    
    if (Storage.updateTodo(id, { completed: !todo.completed })) {
        refreshApp();
        UI.showToast(todo.completed ? '✓ Todo marked as active' : '✓ Todo completed');
    }
}

function handleEditTodo(todo) {
    const newText = prompt('Edit todo:', todo.text);
    
    if (newText !== null) {
        const validation = TodoManager.validateTodo(newText);
        
        if (!validation.valid) {
            UI.showToast(validation.message);
            return;
        }

        if (Storage.updateTodo(todo.id, { text: newText.trim(), updatedAt: new Date().toISOString() })) {
            refreshApp();
            UI.showToast('✓ Todo updated');
        }
    }
}

function handleDeleteTodo(id) {
    if (confirm('Delete this todo?')) {
        if (Storage.deleteTodo(id)) {
            refreshApp();
            UI.showToast('✓ Todo deleted');
        }
    }
}

function handleFilterChange(filter) {
    refreshApp();
}

function handleClearCompleted() {
    if (confirm('Delete all completed todos?')) {
        if (Storage.clearCompleted()) {
            refreshApp();
            UI.showToast('✓ Completed todos cleared');
        }
    }
}

function handleClearAll() {
    if (confirm('Delete ALL todos? This cannot be undone.')) {
        if (Storage.clearAll()) {
            refreshApp();
            UI.showToast('✓ All todos cleared');
        }
    }
}

function handleExport() {
    const data = Storage.exportTodos();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast('✓ Todos exported');
}

function refreshApp() {
    const todos = Storage.getTodos();
    const filter = UI.getCurrentFilter();
    const filtered = TodoManager.filterTodos(todos, filter);
    const sorted = TodoManager.sortTodos(filtered, 'date');
    const stats = TodoManager.getStats(todos);

    UI.renderTodos(sorted);
    UI.updateStats(stats);
}

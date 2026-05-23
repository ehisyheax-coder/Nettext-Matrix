/**
 * Storage Module - Handles Local Storage Operations
 * Provides CRUD operations for todos with error handling
 */

const Storage = (() => {
    const STORAGE_KEY = 'todos';
    const SETTINGS_KEY = 'todoSettings';

    /**
     * Get all todos from local storage
     * @returns {Array} Array of todo objects
     */
    const getTodos = () => {
        try {
            const todos = localStorage.getItem(STORAGE_KEY);
            return todos ? JSON.parse(todos) : [];
        } catch (error) {
            console.error('Error reading todos from storage:', error);
            return [];
        }
    };

    /**
     * Save todos to local storage
     * @param {Array} todos - Array of todo objects
     * @returns {boolean} Success status
     */
    const saveTodos = (todos) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
            return true;
        } catch (error) {
            console.error('Error saving todos to storage:', error);
            return false;
        }
    };

    /**
     * Add a new todo
     * @param {Object} todo - Todo object with id, text, priority, completed
     * @returns {boolean} Success status
     */
    const addTodo = (todo) => {
        const todos = getTodos();
        todos.unshift(todo);
        return saveTodos(todos);
    };

    /**
     * Update a todo
     * @param {string} id - Todo ID
     * @param {Object} updates - Object with properties to update
     * @returns {boolean} Success status
     */
    const updateTodo = (id, updates) => {
        const todos = getTodos();
        const index = todos.findIndex(todo => todo.id === id);
        
        if (index !== -1) {
            todos[index] = { ...todos[index], ...updates };
            return saveTodos(todos);
        }
        return false;
    };

    /**
     * Delete a todo
     * @param {string} id - Todo ID
     * @returns {boolean} Success status
     */
    const deleteTodo = (id) => {
        const todos = getTodos();
        const filtered = todos.filter(todo => todo.id !== id);
        return saveTodos(filtered);
    };

    /**
     * Clear all completed todos
     * @returns {boolean} Success status
     */
    const clearCompleted = () => {
        const todos = getTodos();
        const active = todos.filter(todo => !todo.completed);
        return saveTodos(active);
    };

    /**
     * Clear all todos
     * @returns {boolean} Success status
     */
    const clearAll = () => {
        return saveTodos([]);
    };

    /**
     * Get application settings
     * @returns {Object} Settings object
     */
    const getSettings = () => {
        try {
            const settings = localStorage.getItem(SETTINGS_KEY);
            return settings ? JSON.parse(settings) : { theme: 'light', sortBy: 'date' };
        } catch (error) {
            console.error('Error reading settings:', error);
            return { theme: 'light', sortBy: 'date' };
        }
    };

    /**
     * Save application settings
     * @param {Object} settings - Settings object
     * @returns {boolean} Success status
     */
    const saveSettings = (settings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    };

    /**
     * Export todos as JSON
     * @returns {string} JSON string of todos
     */
    const exportTodos = () => {
        const todos = getTodos();
        return JSON.stringify(todos, null, 2);
    };

    /**
     * Import todos from JSON
     * @param {string} jsonData - JSON string of todos
     * @returns {boolean} Success status
     */
    const importTodos = (jsonData) => {
        try {
            const todos = JSON.parse(jsonData);
            if (Array.isArray(todos)) {
                return saveTodos(todos);
            }
            throw new Error('Invalid todo format');
        } catch (error) {
            console.error('Error importing todos:', error);
            return false;
        }
    };

    return {
        getTodos,
        saveTodos,
        addTodo,
        updateTodo,
        deleteTodo,
        clearCompleted,
        clearAll,
        getSettings,
        saveSettings,
        exportTodos,
        importTodos
    };
})();

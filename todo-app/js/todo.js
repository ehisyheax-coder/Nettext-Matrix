/**
 * Todo Module - Business Logic for Todo Operations
 * Handles todo creation, filtering, and statistics
 */

const TodoManager = (() => {
    /**
     * Create a new todo object
     * @param {string} text - Todo text
     * @param {string} priority - Priority level ('low', 'medium', 'high')
     * @returns {Object} New todo object
     */
    const createTodo = (text, priority = 'medium') => {
        return {
            id: generateId(),
            text: text.trim(),
            priority,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    };

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    const generateId = () => {
        return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    /**
     * Validate todo text
     * @param {string} text - Todo text
     * @returns {Object} Validation result
     */
    const validateTodo = (text) => {
        const trimmed = text.trim();
        
        if (!trimmed) {
            return { valid: false, message: 'Todo cannot be empty' };
        }
        
        if (trimmed.length > 500) {
            return { valid: false, message: 'Todo is too long (max 500 characters)' };
        }
        
        return { valid: true };
    };

    /**
     * Filter todos based on status
     * @param {Array} todos - Array of todos
     * @param {string} filter - Filter type ('all', 'active', 'completed')
     * @returns {Array} Filtered todos
     */
    const filterTodos = (todos, filter = 'all') => {
        switch (filter) {
            case 'active':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            case 'all':
            default:
                return todos;
        }
    };

    /**
     * Sort todos
     * @param {Array} todos - Array of todos
     * @param {string} sortBy - Sort criteria ('date', 'priority', 'text')
     * @returns {Array} Sorted todos
     */
    const sortTodos = (todos, sortBy = 'date') => {
        const sorted = [...todos];
        
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'text':
                sorted.sort((a, b) => a.text.localeCompare(b.text));
                break;
            case 'date':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return sorted;
    };

    /**
     * Get todo statistics
     * @param {Array} todos - Array of todos
     * @returns {Object} Statistics object
     */
    const getStats = (todos) => {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const active = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            active,
            completionRate
        };
    };

    /**
     * Search todos
     * @param {Array} todos - Array of todos
     * @param {string} query - Search query
     * @returns {Array} Filtered todos
     */
    const searchTodos = (todos, query) => {
        if (!query.trim()) return todos;
        
        const lowerQuery = query.toLowerCase();
        return todos.filter(todo => 
            todo.text.toLowerCase().includes(lowerQuery)
        );
    };

    /**
     * Bulk update todos
     * @param {Array} ids - Array of todo IDs
     * @param {Object} updates - Object with properties to update
     * @returns {Array} Updated todos
     */
    const bulkUpdate = (todos, ids, updates) => {
        return todos.map(todo => 
            ids.includes(todo.id) ? { ...todo, ...updates } : todo
        );
    };

    return {
        createTodo,
        generateId,
        validateTodo,
        filterTodos,
        sortTodos,
        getStats,
        searchTodos,
        bulkUpdate
    };
})();

/**
 * Main Application Module
 * Initializes the app and coordinates all modules
 */

const App = (() => {
    /**
     * Initialize the application
     */
    const init = () => {
        console.log('🚀 Todo App v1.0 - Initializing...');
        
        // Initialize UI event listeners
        UI.initEventListeners();
        
        // Load and render initial data
        loadInitialData();
        
        // Set up periodic auto-save (optional)
        setupAutoSave();
        
        console.log('✓ App initialized successfully');
    };

    /**
     * Load initial data and render
     */
    const loadInitialData = () => {
        const todos = Storage.getTodos();
        const stats = TodoManager.getStats(todos);
        
        UI.updateStats(stats);
        
        if (todos.length === 0) {
            document.getElementById('emptyState').classList.add('show');
        } else {
            const sorted = TodoManager.sortTodos(todos, 'date');
            UI.renderTodos(sorted);
        }
    };

    /**
     * Setup periodic auto-save
     */
    const setupAutoSave = () => {
        // Auto-save happens on every Storage operation
        // This is just a safety measure for future enhancements
        window.addEventListener('beforeunload', () => {
            // Any cleanup needed before closing
        });
    };

    /**
     * Get app version
     * @returns {string} Version number
     */
    const getVersion = () => {
        return '1.0.0';
    };

    /**
     * Reset app to initial state
     */
    const reset = () => {
        if (confirm('Reset app to initial state? This will delete all todos.')) {
            Storage.clearAll();
            loadInitialData();
            UI.showToast('✓ App reset');
        }
    };

    return {
        init,
        getVersion,
        reset
    };
})();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}

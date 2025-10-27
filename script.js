// Enhanced Todo Application with Side Navigation
class TodoApp {
    constructor() {
        this.todos = this.getStoredTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        this.currentSection = 'dashboard';
        
        this.initializeElements();
        this.bindEvents();
        this.render();
        this.updateStats();
        this.setupRealTimeSync();
        
        // Initialize theme
        this.initTheme();
    }
    
    initializeElements() {
        // Sidebar elements
        this.navToggle = document.getElementById('navToggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.currentSectionEl = document.getElementById('currentSection');
        this.navTaskCount = document.getElementById('navTaskCount');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Dashboard elements
        this.bannerActiveTasks = document.getElementById('bannerActiveTasks');
        this.statTotal = document.getElementById('statTotal');
        this.statPending = document.getElementById('statPending');
        this.statCompleted = document.getElementById('statCompleted');
        this.statProductivity = document.getElementById('statProductivity');
        this.completionRate = document.getElementById('completionRate');
        
        // Task elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.markAllCompleteBtn = document.getElementById('markAllComplete');
        this.sortSelect = document.getElementById('sortSelect');
        this.syncStatus = document.getElementById('syncStatus');
        
        // Content sections
        this.contentSections = document.querySelectorAll('.content-section');
    }
    
    bindEvents() {
        // Navigation events
        this.navToggle.addEventListener('click', () => this.toggleSidebar());
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.currentTarget.dataset.section);
            });
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Task events
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.currentTarget.dataset.filter);
            });
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.markAllCompleteBtn.addEventListener('click', () => this.markAllComplete());
        this.sortSelect.addEventListener('change', () => this.render());
        
        // Real-time sync
        window.addEventListener('storage', (e) => {
            if (e.key === 'todos') {
                this.showSyncStatus();
                setTimeout(() => {
                    this.todos = this.getStoredTodos();
                    this.render();
                    this.updateStats();
                }, 500);
            }
        });
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    }
    
    switchSection(section) {
        // Update navigation
        this.navLinks.forEach(link => link.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        // Update content
        this.contentSections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        // Update header
        this.currentSectionEl.textContent = this.getSectionTitle(section);
        this.currentSection = section;
        
        // Update stats if needed
        if (section === 'dashboard' || section === 'tasks') {
            this.updateStats();
        }
    }
    
    getSectionTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'tasks': 'Task Management',
            'analytics': 'Analytics',
            'categories': 'Categories',
            'settings': 'Settings'
        };
        return titles[section] || 'Dashboard';
    }
    
    getStoredTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        window.dispatchEvent(new Event('storage'));
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;
        
        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'medium'
        };
        
        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
        this.updateStats();
        this.showSyncStatus();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showSyncStatus();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
        this.updateStats();
        this.showSyncStatus();
    }
    
    togglePriority(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const priorities = ['low', 'medium', 'high'];
            const currentIndex = priorities.indexOf(todo.priority);
            todo.priority = priorities[(currentIndex + 1) % priorities.length];
            this.saveTodos();
            this.render();
            this.showSyncStatus();
        }
    }
    
    startEdit(id, textElement) {
        if (this.editingId) {
            this.cancelEdit();
        }
        
        this.editingId = id;
        const currentText = textElement.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        input.style.fontSize = '1.1rem';
        input.style.border = '1px solid var(--primary)';
        input.style.borderRadius = '4px';
        input.style.padding = '4px 8px';
        input.style.width = '100%';
        input.style.background = 'transparent';
        
        textElement.parentNode.replaceChild(input, textElement);
        input.focus();
        
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                this.updateTodo(id, newText);
            } else {
                this.cancelEdit();
            }
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
        
        input.addEventListener('blur', saveEdit);
    }
    
    updateTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showSyncStatus();
        }
        this.editingId = null;
    }
    
    cancelEdit() {
        this.editingId = null;
        this.render();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }
    
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
        this.updateStats();
        this.showSyncStatus();
    }
    
    markAllComplete() {
        const allCompleted = this.todos.every(t => t.completed);
        
        this.todos.forEach(todo => {
            todo.completed = !allCompleted;
        });
        
        this.saveTodos();
        this.render();
        this.updateStats();
        this.showSyncStatus();
    }
    
    getFilteredTodos() {
        let filtered = this.todos;
        
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'priority':
                filtered = filtered.filter(t => t.priority === 'high' && !t.completed);
                break;
        }
        
        // Apply sorting
        const sortBy = this.sortSelect.value;
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'alphabetical':
                filtered.sort((a, b) => a.text.localeCompare(b.text));
                break;
        }
        
        return filtered;
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.todoList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.todoList.innerHTML = '';
            
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = 'todo-item';
                li.innerHTML = `
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</span>
                    <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                    <div class="todo-actions">
                        <button class="priority-btn" title="Change priority">
                            <i class="fas fa-flag"></i>
                        </button>
                        <button class="edit-btn" title="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                const checkbox = li.querySelector('.todo-checkbox');
                const textElement = li.querySelector('.todo-text');
                const priorityBtn = li.querySelector('.priority-btn');
                const editBtn = li.querySelector('.edit-btn');
                const deleteBtn = li.querySelector('.delete-btn');
                
                checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
                priorityBtn.addEventListener('click', () => this.togglePriority(todo.id));
                editBtn.addEventListener('click', () => this.startEdit(todo.id, textElement));
                deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
                
                this.todoList.appendChild(li);
            });
        }
    }
    
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Update dashboard stats
        this.statTotal.textContent = total;
        this.statPending.textContent = active;
        this.statCompleted.textContent = completed;
        this.statProductivity.textContent = `${productivity}%`;
        this.bannerActiveTasks.textContent = active;
        this.completionRate.textContent = `${productivity}%`;
        
        // Update navigation task count
        this.navTaskCount.textContent = active;
        
        // Update chart
        this.updateCompletionChart(productivity);
    }
    
    updateCompletionChart(percentage) {
        const circle = document.querySelector('.completion-chart circle:last-child');
        if (circle) {
            const radius = 54;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDasharray = `${circumference}`;
            circle.style.strokeDashoffset = `${offset}`;
        }
    }
    
    showSyncStatus() {
        this.syncStatus.innerHTML = '<i class="fas fa-sync syncing"></i> Syncing...';
        
        setTimeout(() => {
            this.syncStatus.innerHTML = '<i class="fas fa-check-circle"></i> All changes saved';
        }, 800);
    }
    
    setupRealTimeSync() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                const stored = this.getStoredTodos();
                if (JSON.stringify(stored) !== JSON.stringify(this.todos)) {
                    this.showSyncStatus();
                    setTimeout(() => {
                        this.todos = stored;
                        this.render();
                        this.updateStats();
                    }, 500);
                }
            }
        }, 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
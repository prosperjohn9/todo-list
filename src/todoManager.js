import Todo from "./todo.js";
import Storage from "./storage.js";
import ProjectManager from "./projectManager.js";
import { isToday, parse } from "date-fns";

class TodoManager {
    constructor() { 
        this.todos = Storage.loadTodos();
        this.projectManager = new ProjectManager();
    }

    // Add a Todo
    addTodo(title, description, dueDate, priority, projectId) {
        const newTodo = new Todo(
            title,
            description,
            dueDate,
            priority,
            projectId
        );
        this.todos.push(newTodo);
        Storage.saveTodos(this.todos);

        // Add the Todo to the project
        this.projectManager.addTodoToProject(newTodo, projectId);
    }

    // Delete a Todo
    deleteTodo(todoId) { 
        this.todos = this.todos.filter(todo => todo.id !== todoId);
        Storage.saveTodos(this.todos);
    }

    // Update a Todo
    updateTodo(todoId, updatedData) {
        const todoIndex = this.todos.findIndex(todo => todo.id === todoId);
        if (todoIndex !== -1) {
            // Merge the updated data into the existing Todo
            this.todos[todoIndex] = { ...this.todos[todoIndex], ...updatedData };
            Storage.saveTodos(this.todos);
        }
    }

    // Get Todos
    getTodo(todoId) { 
        return this.todos.find(todo => todo.id === todoId);
    }

    // Toggle Todo completion status
    toggleTodoCompletion(todoId) {
        const todo = this.getTodo(todoId);
        if (todo) {
            todo.isCompleted = !todo.isCompleted;
            Storage.saveTodos(this.todos);
        }
    }

    // Get filtered Todos
    getFilteredTodos(filterType) {
        switch (filterType) {
            case "all":
                return this.getAllTodos();
            case "today":
                return this.getTodosForToday();
            case "important":
                return this.getImportantTodos();
            case "completed":
                return this.getCompletedTodos();
            default:
                return this.getAllTodos();
        }
    }

    // Get all Todos
    getAllTodos() {
        return this.todos;
    }

    // Get all Todos for today
    getTodosForToday() {
        return this.todos.filter(todo => {
            try {
                const todoDueDate = parse(todo.dueDate, "dd/MM/yyyy", new Date());
                return isToday(todoDueDate);
            } catch (error) {
                console.error(`Error parsing date '${todo.dueDate}': ${error}`);
                return false;
            }
        });
    }

    // Get completed Todos
    getCompletedTodos() {
        return this.todos.filter(todo => todo.isCompleted);
    }

    // Get important Todos
    getImportantTodos() {
        return this.todos.filter(todo => todo.priority === "High");
    }

    // Get Todos for a project
    getTodosByProjectId(projectId) { 
        return this.todos.filter(todo => todo.project === projectId);
    }
}

export default TodoManager;
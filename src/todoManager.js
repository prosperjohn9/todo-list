import Todo from "./todo.js";
import Storage from "./storage.js";
import ProjectManager from "./projectManager.js";
import { isToday, parseISO } from "date-fns";

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

    // Get all Todos
    getAllTodos() {
        return this.todos;
    }

    // Get all Todos for today
    getTodosForToday() {
        return this.todos.filter(todo => isToday(parseISO(todo.dueDate)));
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
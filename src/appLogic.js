import Todo from "./todo.js";
import Project from "./project.js";
import Storage from "./storage.js";
import { isToday, parseISO } from "date-fns";

class AppLogic { 
    constructor() {
        this.projects = [];
        this.loadProjects();
    }

    // Utility method to find a project by id
    findProjectById(projectId) {
        return this.projects.find(project => project.id === projectId);
    }

    // Create a new project
    createProject(name) {
        const newProject = new Project(name);
        this.projects.push(newProject);
        this.saveProjects();
    }

    // Edit a project
    editProject(projectId, newName) { 
        const project = this.findProjectById(projectId);
        if (project) {
            project.updateName(newName);
            this.saveProjects();
        }
    }

    // Delete a project
    deleteProject(projectId) {
        this.projects = this.projects.filter(project => project.id !== projectId);
        this.saveProjects();
    }

    // Get default project
    getDefaultProject() { 
        return this.projects[0];
    }

    // Save current state of projects to localStorage
    saveProjects() {
        Storage.save("projects", this.projects);
    }

    // Load projects from localStorage
    loadProjects() {
        const storedProjectsData = Storage.load("projects");
        if (storedProjectsData) {
            // Directly pass the string to deserialize without parsing here
            this.projects = JSON.parse(storedProjectsData).map(projectData => Project.deserialize(JSON.stringify(projectData)));
        } else {
            this.projects = []; // Initialize to an empty array if no data
        }
    }

    // Create a new Todo
    createTodo(title, description, dueDate, priority, projectId = null) {
        const project = projectId ? this.findProjectById(projectId) : this.getDefaultProject();
        if (project) {
            const newTodo = new Todo(
                title,
                description,
                dueDate,
                priority
            );
            project.addTodo(newTodo);
            this.saveProjects();
        }
    }

    // Edit a Todo
    editTodo(projectId, todoId, updatedData, newProjectId = null) {
        const project = this.findProjectById(projectId);
        if (!project) {
            console.error(`Project with ID ${projectId} not found.`);
            return;
        }
        const todo = project?.findTodo(todoId);
        if (!todo) {
            console.error(`Todo with ID ${todoId} not found in project ${projectId}.`);
            return;
        }
        todo.update(updatedData);

        // If the Todo needs to be moved to a different project
        if (newProjectId && newProjectId !== projectId) {
            this.moveTodoToNewProject(projectId, newProjectId, todo);
        }

        Storage.save("projects", this.projects);
    }

    // Move a Todo to a different project
    moveTodoToNewProject(oldProjectId, newProjectId, todo) {
        const oldProject = this.findProjectById(oldProjectId);
        const newProject = this.findProjectById(newProjectId);

        if (!oldProject || !newProject) { 
            console.error("Failed to move Todo to new project.");
            return;
        }

        oldProject.removeTodo(todo.id);
        newProject.addTodo(todo);
        this.saveProjects();
    }


    // Delete a Todo
    deleteTodo(projectId, todoId) { 
        const project = this.findProjectById(projectId);
        if (!project) {
            console.error(`Project with ID ${projectId} not found.`);
            return;
        }
        if (!project.findTodo(todoId)) { 
            console.error(`Todo with ID ${todoId} not found in project ${projectId}.`);
            return;
        }

        project.removeTodo(todoId);
        this.saveProjects();
    }

    // Toggle the completion status of a Todo
    markTodoAsCompleted(projectId, todoId) { 
        const project = this.findProjectById(projectId);
        const todo = project?.findTodo(todoId);
        if (todo) {
            todo.toggleCompletion();
            this.saveProjects();
        }
    }

    findTodoById(todoId) {
        for (const project of this.projects) {
            const todo = project.todos.find(todo => todo.id === todoId);
            if (todo) {
                return todo;
            }
        }
        return null;
    }

    getTodosByFilter(filter) {
        switch (filter) {
            case "All":
                return this.getAllTodos();
            case "Today":
                return this.getTodosForToday();
            case "Important":
                return this.getImportantTodos();
            case "Completed":
                return this.getCompletedTodos();
            default:
                return [];
        }
    }

    getAllTodos() {
        return this.projects.flatMap(project => project.todos);
    }

    getTodosForToday() {
        return this.getAllTodos().filter(todo => isToday(parseISO(todo.dueDate)));
    }

    getImportantTodos() {
        return this.getAllTodos().filter(todo => todo.priority === "High");
    }

    getCompletedTodos() {
        return this.getAllTodos().filter(todo => todo.completed);
    }
}

const appLogic = new AppLogic();
export default appLogic;
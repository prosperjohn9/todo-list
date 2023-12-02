import TodoUI from "./todoUI.js";
import ProjectUI from "./projectUI.js";

// Instantiate projecr UI
const projectUI = new ProjectUI();

// Display all projects
projectUI.displayProjects();


// Instantiate todo UI
const todoUI = new TodoUI();

// Display all todos
todoUI.displayAllTodos();

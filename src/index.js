import TodoUI from "./todoUI.js";
import TodoManager from "./todoManager.js";
import ProjectUI from "./projectUI.js";
import ProjectManager from "./projectManager.js";

// Instantiate the UIs
const todoManager = new TodoManager();
const projectManager = new ProjectManager();
const todoUI = new TodoUI();
const projectUI = new ProjectUI();

// Display todos and projects
todoUI.displayAllTodos();
projectUI.displayProjects();
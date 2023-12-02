import TodoUI from "./todoUI.js";
import ProjectUI from "./projectUI.js";

// Instantiate the UIs
const todoUI = new TodoUI();
const projectUI = new ProjectUI();

// Display todos and projects
todoUI.displayAllTodos();
projectUI.displayProjects();
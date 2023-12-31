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

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.getElementById("sidebar-toggle");

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("sidebar-closed");
    });
});

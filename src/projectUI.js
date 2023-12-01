import ProjectManager from "./projectManager.js";

class ProjectUI {
    constructor() {
        this.projectManager = new ProjectManager();
        this.currentlyEditingProjectId = null;
        this.bindEventListeners();
        this.displayProjects();
    }

    bindEventListeners() {
        // Event listener for creating a new project
        document.getElementById("project-form").addEventListener("submit", (e) => {
            e.preventDefault();
            this.addProjectFromUI();
        });

        // Event listeners for project list actions
        document.querySelector(".main-content").addEventListener("click", (e) => {
            const projectId = e.target.closest(".project-item")?.dataset.projectId;
            if (e.target.matches(".project-edit-button")) {
                this.openEditProjectModal(projectId);
            } else if (e.target.matches(".project-delete-button")) {
                this.deleteProject(projectId);
            } else if (e.target.matches(".project-view-button")) {
                this.viewProject(projectId);
            }
        });

        // Event listener for editing a project
        document.getElementById("project-form").addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.currentlyEditingProjectId) {
                this.editProject();
            } else {
                this.addProjectFromUI();
            }
        });

        // Event listener for closing the project modal
        document.querySelectorAll(".project-modal .close-button").forEach(button => {
            button.addEventListener("click", () => this.closeProjectModal());
        }) 
    }

    // Display all projects
    displayProjects() {
        const projectList = document.getElementById("project-list");
        projectList.innerHTML = "";
        
        this.projectManager.projects.forEach(project => {
            const projectElement = this.createProjectElement(project);
            projectList.appendChild(projectElement);
        });
    }

    // Create a project element
    createProjectElement(project) {
        const projectElement = document.createElement("div");
        projectElement.className = "project-item";
        projectElement.dataset.projectId = project.id;
        projectElement.innerHTML = `
            <span class="project-name">${project.name}</span>
            <button class="project-view-button">View</button>
            <button class="project-edit-button">Edit</button>
            <button class="project-delete-button">Delete</button>
        `;
        return projectElement;
    }

    // Open the project modal
    openProjectModal() {
        document.getElementById("project-modal").style.display = "block";
    }

    // Open the edit project modal
    openEditProjectModal(projectId) {
        const project = this.projectManager.getProject(projectId);
        if (project) {
            document.getElementById("project-name").value = project.name;
            this.currentlyEditingProjectId = projectId;
            this.openProjectModal();
        } else {
            alert("Project not found!");
        }
    }

    // Close the project modal
    closeProjectModal() {
        document.getElementById("project-modal").style.display = "none";
        
        // Reset the form
        document.getElementById("project-name").value = "";
        this.currentlyEditingProjectId = null;
    }

    // Show feedback message
    showFeedback(message, type = "info") {
        // Create the feedback element
        const feedbackElement = document.createElement("div");
        feedbackElement.className = `feedback feedback-${type}`;
        feedbackElement.textContent = message;

        // Append the feedback element to the body
        document.body.appendChild(feedbackElement);

        // Remove the feedback element after 3 seconds
        setTimeout(() => {
            feedbackElement.remove();
        }, 3000);
    }

    // Create a new project from the UI
    addProjectFromUI() {
        const projectName = document.getElementById("project-name").value;
        this.projectManager.createProject(projectName);
        this.showFeedback("Project added successfully!", "success");
        this.displayProjects();
        this.closeProjectModal();
    }

    // View a project
    viewProject(projectId) {
        const project = this.projectManager.getProject(projectId);
        if (!project) {
            alert("Project not found!");
            return;
        }

        // Populate the modal with project details
        document.getElementById("view-project-name").textContent = project.name;
        const projectTodoList = document.getElementById("view-project-todos");
        projectTodoList.innerHTML = "";

        project.todos.forEach(todo => {
            const todoElement = document.createElement("li");
            todoElement.innerHTML = `
                <strong>${todo.title}</strong> - 
                Priority: ${todo.priority}, 
                Due: ${todo.dueDate}
            `;
            projectTodoList.appendChild(todoElement);
        });

        // Open the modal
        document.getElementById("view-project-modal").style.display = "block";
    }

    // Edit a project
    editProject() {
        if (!this.currentlyEditingProjectId) {
            alert("No project selected for editing!");
            return;
        }

        // Re-fetch the project to ensure it still exists and hasn't been modified
        const projectToEdit = this.projectManager.getProject(this.currentlyEditingProjectId);
        if (!projectToEdit) {
            alert("The project you are trying to edit no longer exists!");
            this.closeProjectModal();
            return;
        }

        const updatedName = document.getElementById("project-name").value;
        if (updatedName === projectToEdit.name) {
            alert("No changes detected in project name!");
            return;
        }

        // Proceed with updating the project
        this.projectManager.updateProject(this.currentlyEditingProjectId, { name: updatedName });
        this.showFeedback("Project updated successfully!", "success");
        this.closeProjectModal();
        this.displayProjects();
    }

    // Delete a project
    deleteProject(projectId) {
        // Confirm deletion
        if (confirm("Are you sure you want to delete this project?")) {
            this.projectManager.deleteProject(projectId);
            this.showFeedback("Project deleted successfully!", "success");
            this.displayProjects();
        }
    }
}

export default ProjectUI;
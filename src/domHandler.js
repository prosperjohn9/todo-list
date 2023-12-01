import { format } from "date-fns";
import appLogic from "./appLogic.js";

class DomHandler {
    constructor() { 
        this.setupEventListeners();
        this.currentlyEditingTodo = null;
    }

    renderTodo(todo) {
        const mainContent = document.querySelector(".main-content");

        // Create the todo container
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");
        todoDiv.setAttribute("data-todo-id", todo.id);


        // Create and append the title element
        const titleElement = document.createElement("h3");
        titleElement.textContent = todo.title;
        todoDiv.appendChild(titleElement);

        // Create and append the description element
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = todo.description;
        todoDiv.appendChild(descriptionElement);

        // Create and append the due date element
        const dueDateElement = document.createElement("p");
        dueDateElement.textContent = `Due: ${todo.dueDate}`;
        todoDiv.appendChild(dueDateElement);

        // Create and append the priority element
        const priorityElement = document.createElement("p");
        priorityElement.textContent = `Priority: ${todo.priority}`;
        todoDiv.appendChild(priorityElement);

        // Create and append complete checkbox
        const completeCheckbox = document.createElement("input");
        completeCheckbox.setAttribute("type", "checkbox");
        completeCheckbox.checked = todo.completed;
        completeCheckbox.addEventListener("change", () => {
            // Logic to mark the todo as completed
            appLogic.markTodoAsCompleted(todo.id);

            // Update the UI
            if (completeCheckbox.checked) {
                todoDiv.classList.add("completed");
            } else {
                todoDiv.classList.remove("completed");
            }
        });
        todoDiv.appendChild(completeCheckbox);

        // Add View, Edit, and Delete buttons
        const viewButton = this.createButtonWithImage("../dist/images/view.svg", "View");
        viewButton.setAttribute("data-todo-id", todo.id);
        viewButton.classList.add("view-todo-button");
        const editButton = this.createButtonWithImage("../dist/images/edit.svg", "Edit");
        editButton.setAttribute("data-todo-id", todo.id);
        editButton.classList.add("edit-todo-button");
        const deleteButton = this.createButtonWithImage("../dist/images/delete.svg", "Delete");
        deleteButton.setAttribute("data-todo-id", todo.id);
        deleteButton.classList.add("delete-todo-button");

        // Append the buttons to the todo container
        todoDiv.appendChild(viewButton);
        todoDiv.appendChild(editButton);
        todoDiv.appendChild(deleteButton);

        // Add event listeners to the buttons
        viewButton.addEventListener("click", () => this.viewTodo(todo));
        editButton.addEventListener("click", () => this.editTodo(todo));
        deleteButton.addEventListener("click", () => this.deleteTodo(todo));

        mainContent.appendChild(todoDiv);
        return todoDiv;
    }

    viewTodo(todo) { 
        // Logic to view a todo
        const todoModal = document.getElementById("view-todo-modal");
        document.getElementById("view-todo-title").textContent = `Title: ${todo.title}`;
        document.getElementById("view-todo-description").textContent = `Description: ${todo.description}`;
        document.getElementById("view-todo-due-date").textContent = `Due Date: ${todo.dueDate}`;
        document.getElementById("view-todo-priority").textContent = `Priority: ${todo.priority}`;
        const project = appLogic.findProjectById(todo.projectId);
        const projectName = project ? project.name : "Unknown Project";
        document.getElementById("view-todo-project").textContent = `Project: ${projectName}`;
        const statusText = todo.completed ? "Completed" : "In Progress";
        document.getElementById("view-todo-status").textContent = `Status: ${statusText}`;
        todoModal.style.display = "block";
    }

    editTodo(todo) { 
        // Logic to edit a todo
        const todoModal = document.getElementById("todo-modal");
        const todoForm = document.getElementById("todo-form");
        todoForm.querySelector("#todo-title").value = todo.title;
        todoForm.querySelector("#todo-description").value = todo.description;
        todoForm.querySelector("#todo-due-date").value = todo.dueDate;
        todoForm.querySelector("#todo-priority").value = todo.priority;

        // Populate the project selection dropdown
        const projectSelect = todoForm.querySelector("#project-select");
        this.populateProjectDropdown(projectSelect, todo.projectId);

        this.currentlyEditingTodo = todo;

        // Display the modal
        todoModal.style.display = "block";

        // Handle form submission
        todoForm.onsubmit = (event) => {
            event.preventDefault();
            this.handleSubmitTodoForm(todoForm);
        }
    }

    populateProjectDropdown(selectElement, currentProjectId) { 
        // Clear the existing options
        selectElement.innerHTML = "";

        // Populate the dropdown with projects
        appLogic.projects.forEach(project => { 
            const option = document.createElement("option");
            option.value = project.id;
            option.textContent = project.name;
            option.selected = project.id === currentProjectId;
            selectElement.appendChild(option);
        });
    }

    handleSubmitTodoForm(todoForm) { 
        // Retrieve and process the form data
        const title = todoForm.querySelector("#todo-title").value;
        const description = todoForm.querySelector("#todo-description").value;
        const dueDate = format(todoForm.querySelector("#todo-due-date").value, "dd/MM/yyyy");
        const priority = todoForm.querySelector("#todo-priority").value;
        const projectId = todoForm.querySelector("#project-select").value;

        // Update the todo
        if (this.currentlyEditingTodo) { 
            appLogic.editTodo(this.currentlyEditingTodo, {
                title,
                description,
                dueDate,
                priority,
                projectId
            });
            this.currentlyEditingTodo = null;
            todoModal.style.display = "none";
            this.updateProjectListUI();
        }
    }
    

    addNewTodo(title, description, dueDate, priority, projectId) { 
        const newTodo = appLogic.createTodo(title, description, dueDate, priority);
        
        // Add the todo to the project
        const project = appLogic.findProjectById(projectId);
        if (project) {
            project.addTodo();
        } else {
            console.error(`Project with ID ${projectId} not found.`);
        }
    }

    deleteTodo(todo) { 
        // Confirm the deletion
        const confirmed = confirm(`Are you sure you want to delete the todo "${todo.title}"?`);
        if (confirmed) {
            try {
                // Delete the todo
                appLogic.deleteTodo(todo.id);
                this.updateProjectListUI();
            } catch (error) { 
                console.error("Failed to delete todo:", error);
            }
        }
    }

    handleTodoFilter(filterType) {
        const filteredTodos = appLogic.getTodosByFilter(filterType);

        // Clear the current todo display
        const mainContent = document.querySelector(".main-content");
        mainContent.innerHTML = "";

        // Render the filtered todos
        filteredTodos.forEach(todo => {
            mainContent.appendChild(this.renderTodo(todo));
        });
    }

    showAddTodoModal() { 
        const todoModal = document.getElementById("todo-modal");
        if (!todoModal) {
            return;
        }

        // Reset the form
        const todoForm = document.querySelector("#todo-modal");
        if (todoForm) {
            todoForm.reset();
            const firstInput = todoForm.querySelector("input");
            if (firstInput) {
                firstInput.focus();
            }
        }

        // Display the modal
        todoModal.style.display = "block";
        
    }

    closeTodoModal() { 
        const todoModal = document.getElementById("todo-modal");
        todoModal.style.display = "none";
        this.currentlyEditingTodo = null;
    }

    renderProject(project) {
        // Create and append DOM elements to display the project
        const projectList = document.getElementById("project-list");

        // Create the project container
        const projectDiv = document.createElement("div");
        projectDiv.classList.add("project");
        projectDiv.setAttribute("data-project-name", project.name);

        // Clear the existing project list
        projectDiv.innerHTML = "";

        // Create and append the project name element
        const projectNameElement = document.createElement("h2");
        projectNameElement.textContent = project.name;
        projectDiv.appendChild(projectNameElement);

        // Create container for todos in the project
        const todosContainer = document.createElement("div");
        todosContainer.classList.add("todo-container");

        // Render each todo in the project
        project.todos.forEach(todo => { 
            const todoNode = this.renderTodo(todo);
            if (todoNode) {
                todosContainer.appendChild(todoNode);
            }
        });

        // Append the todo container to the project container
        projectDiv.appendChild(todosContainer);

        // Append the project to the project list
        projectList.appendChild(projectDiv);

        // Add view, edit, and delete buttons
        const viewButton = this.createButtonWithImage("../dist/images/view.svg", "View");
        const editButton = this.createButtonWithImage("../dist/images/edit.svg", "Edit");
        const deleteButton = this.createButtonWithImage("../dist/images/delete.svg", "Delete");

        // Append the buttons to the project container
        projectDiv.appendChild(viewButton);
        projectDiv.appendChild(editButton);
        projectDiv.appendChild(deleteButton);

        // Add event listeners to the buttons
        viewButton.addEventListener("click", () => this.viewProject(project));
        editButton.addEventListener("click", () => this.editProject(project));
        deleteButton.addEventListener("click", () => this.deleteProject(project));

        return projectDiv;
    }

    renderAllProjects() {
        const projectListElement = document.getElementById("project-list");

        // Clear the existing project list
        projectListElement.innerHTML = "";

        appLogic.projects.forEach(project => {
            if (project) this.renderProject(project)
        });
        
    }

    showAddProjectModal() {
        const projectModal = document.getElementById("project-modal");
        const projectForm = document.getElementById("project-form");

        // Reset the form
        projectForm.reset();

        // Display the modal
        projectModal.style.display = "block";

        // Focus on the first input field in the modal
        const firstInput = projectModal.querySelector("input");
        if (firstInput) {
            firstInput.focus();
        }
    }

    updateProjectListUI() { 
        const projectListElement = document.getElementById("project-list");
    
        // Clear the existing project list
        projectListElement.innerHTML = "";

        // Re-render the project list
        appLogic.projects.forEach(project => this.renderProject(project));
    }

    viewProject(project) { 
        // Logic to view a project
        const projectModal = document.getElementById("view-project-modal");
        const projectNameElement = document.getElementById("view-project-name");
        const projectTodosList = document.getElementById("view-project-todos"); 

        // Display the project details
        projectNameElement.textContent = project.name;

        // Clear and set the todo list
        projectTodosList.innerHTML = "";
        project.todos.forEach(todo => { 
            const todoItem = document.createElement("li");
            todoItem.textContent = `${todo.title} - Due: ${todo.dueDate}`;
            projectTodosList.appendChild(todoItem);
        });

        // Display the modal
        projectModal.style.display = "block";
    }

    editProject(project) { 
        // Logic to edit a project
        const projectModal = document.getElementById("project-modal");
        const projectForm = document.getElementById("project-form");
        projectForm.querySelector("#project-name").value = project.name;
        this.currentlyEditingProject = project;
        projectModal.style.display = "block";
    }

    deleteProject(project) { 
        // Logic to delete a project
        appLogic.deleteProject(project.name);
        this.updateProjectListUI();
    }

    showProjectModal() {
        const projectModal = document.getElementById("project-modal");
        const projectForm = document.getElementById("project-form");

        // Reset the form
        projectForm.reset();

        // Display the modal
        projectModal.style.display = "block";

        // Focus on the first input field in the modal
        const firstInput = projectModal.querySelector("input");
        if (firstInput) {
            firstInput.focus();
        }
    }

    closeProjectModal() { 
        const projectModal = document.getElementById("project-modal");
        projectModal.style.display = "none";
        this.currentlyEditingProject = null;
    }


    createButtonWithImage(imageSrc, altText) { 
        const button = document.createElement("button");
        const image = document.createElement("img");
        image.src = imageSrc;
        image.alt = altText;
        button.appendChild(image);
        return button;
    }

    setupEventListeners() {
        // Listener for adding a new project
        const addProjectContainer = document.querySelector(".add-project-container");
        addProjectContainer.addEventListener("click", this.showProjectModal);

        addProjectContainer.addEventListener("keypress", (event) => { 
            if (event.key === "Enter" || event.key === " ") {
                this.showProjectModal();
            }
        });

        // Setup filter links event listeners
        document.getElementById("filter-all").addEventListener("click", () => this.handleTodoFilter("All"));
        document.getElementById("filter-today").addEventListener("click", () => this.handleTodoFilter("Today"));
        document.getElementById("filter-important").addEventListener("click", () => this.handleTodoFilter("Important"));
        document.getElementById("filter-completed").addEventListener("click", () => this.handleTodoFilter("Completed"));

        // Listener for closing project modal
        const projectModalCloseButton = document.querySelector("#project-modal .close-button");
        projectModalCloseButton.addEventListener("click", () => {
            document.getElementById("project-modal").style.display = "none";
        });

        // Listener for submitting project form
        const projectForm = document.getElementById("project-form");
        projectForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // Logic to handle project form data
            const projectNameInput = projectForm.querySelector("#project-name");
            const projectName = projectNameInput.value;
            if (this.currentlyEditingProject) { 
                appLogic.updateProject(this.currentlyEditingProject, projectName);
            } else {
                appLogic.createProject(projectName);
            }   

            // Close the modal and update the UI
            this.closeProjectModal();

            // Update the project list in the UI
            this.updateProjectListUI();
        });

        // Listener for opening add todo modal
        const addTodoButton = document.getElementById("add-todo-button");
        if (!addTodoButton) {
            addTodoButton.addEventListener("click", () => this.showAddTodoModal());
        }

        const editButtons = document.querySelectorAll(".edit-todo-button");
        editButtons.forEach(button => { 
            button.addEventListener("click", (event) => {
                const buttonElement = event.target.closest(".edit-todo-button");
                const todoId = buttonElement.getAttribute("data-todo-id");
                const todo = appLogic.getTodoById(todoId);

                if (todo) {
                    this.editTodo();
                }
            });
        });

        // Listener for closing add todo modal
        const todoModalCloseButton = document.querySelector("#todo-modal .close-button");
        todoModalCloseButton.addEventListener("click", () => {
            document.getElementById("todo-modal").style.display = "none";
        });

        // Listener for submitting todo form
        const todoForm = document.getElementById("todo-form");
        todoForm.addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleSubmitTodoForm(todoForm);
        });

        const viewButtons = document.querySelectorAll(".view-todo-button");
        viewButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                // Obtain the todo id associated with the button
                const buttonElement = event.target.closest(".view-todo-button");
                const todoId = buttonElement.getAttribute("data-todo-id");
                const todo = appLogic.getTodoById(todoId);

                // View the todo
                if (todo) {
                    this.viewTodo();
                }
            });
        });

        // Listener for closing view todo modal
        const viewTodoModalCloseButton = document.querySelector("#view-todo-modal .close-button");
        viewTodoModalCloseButton.addEventListener("click", () => {
            document.getElementById("view-todo-modal").style.display = "none";
        });

        const deleteButtons = document.querySelectorAll(".delete-todo-button");
        deleteButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                // Obtain the todo id associated with the button
                const todoId = event.target.getAttribute("data-todo-id");
                const todo = appLogic.getTodoById(todoId);

                // Delete the todo
                this.deleteTodo(todo);
            });
        });
    }
}

const domHandler = new DomHandler();
export default domHandler;
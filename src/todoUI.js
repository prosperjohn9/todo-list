import TodoManager from "./todoManager.js";
import ProjectManager from "./projectManager.js";
import { th } from "date-fns/locale";


class TodoUI { 
    constructor() { 
        this.todoManager = new TodoManager();
        this.projectManager = new ProjectManager();
        this.currenlyEditingTodoId = null;
        this.bindEventListeners();
        this.populateProjectDropdown();
    }

    // Bind event listeners
    bindEventListeners() {
        // Event listeners for filter links
        document.getElementById("filter-all").addEventListener("click", (e) => this.handleFilterClick(e, "all"));
        document.getElementById("filter-today").addEventListener("click", (e) => this.handleFilterClick(e, "today"));
        document.getElementById("filter-important").addEventListener("click", (e) => this.handleFilterClick(e, "important"));
        document.getElementById("filter-completed").addEventListener("click", (e) => this.handleFilterClick(e, "completed"));

        // Event listener for the add Todo form submission
        document.getElementById("todo-form").addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.currenlyEditingTodoId) {
                this.editTodo();
            } else {
                this.addTodoFromUI();
            }
        });

        // Event listener for the cancel button
        document.querySelector(".cancel-button").addEventListener("click", () => {
            this.closeTodoModal();
        });

        // Event listener for closing the Todo modal
        document.querySelectorAll(".close-button").forEach(button => {
            button.addEventListener("click", () => this.closeViewTodoModal());
        });

        // Event listener for toggling Todo completion status
        document.addEventListener("change", (e) => {
            if (e.target.classList.contains("todo-complete-checkbox")) {
                const todoId = e.target.id.replace("todo-", "");
                this.toggleTodoCompletion(todoId);
            }
        });

        // Event listener for active links
        document.querySelectorAll("nav a").forEach((link) => {
            link.addEventListener("click", function () {
                document.querySelector("nav a.active")?.classList.remove("active");
                this.classList.add("active");
            });
        });

        // Event listener for Todo priority
        const select = document.querySelector("#todo-priority");
        select.addEventListener("change", () => {
            switch (select.value) {
                case "High":
                    select.style.color = "rgb(230, 20, 20)";
                    break;
                case "Medium":
                    select.style.color = "#c4621d";
                    break;
                case "Low":
                    select.style.color = "green";
                    break;
                default:
                    select.style.color = "black";
            }
        });

        // Event listener for the project dropdown
        const projectSelect = document.getElementById("project-select");
        projectSelect.addEventListener("change", () => {
            projectSelect.style.color = "black";
        });
    }

    // Handle filter clicks
    handleFilterClick(event, filterType) {
        event.preventDefault();
        const filteredTodos = this.todoManager.getFilteredTodos(filterType);
        this.displayTodosUI(filteredTodos);
    }

    // Display todos in the UI
    displayTodosUI(todos = this.todoManager.getAllTodos()) {
        const todoContainer = document.querySelector(".main-content");
        todoContainer.innerHTML = "";
        
        // Create and append labels
        const labels = ['Completed', 'Title', 'Description', 'Due Date', 'Priority', 'Project'];
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'todo-labels';
        labels.forEach(label => {
            const labelElement = document.createElement('span');
            labelElement.className = `todo-item-label todo-label-${label.toLowerCase().replace(' ','-')}`;
            labelElement.textContent = label;
            labelsContainer.appendChild(labelElement);
        });
        todoContainer.appendChild(labelsContainer);
        
        todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            todoContainer.appendChild(todoElement);
        });

        // Add button for adding todos
        const addTodoContainer = document.createElement('span');
        addTodoContainer.className = 'add-todo-container';
        addTodoContainer.tabIndex = 0;
        addTodoContainer.role = 'button';
        addTodoContainer.ariaPressed = 'false';

        const addTodoImg = document.createElement('img');
        addTodoImg.src = './images/add.svg';
        addTodoImg.alt = 'add-todo';
        addTodoContainer.appendChild(addTodoImg);

        const addTodoText = document.createElement('span');
        addTodoText.className = 'add-todo-text';
        addTodoText.textContent = 'Add New Todo';
        addTodoContainer.appendChild(addTodoText);

        todoContainer.appendChild(addTodoContainer);

        // Event listener for opening the Add Todo modal
        const addTodoButton = document.querySelector('.add-todo-container');
        addTodoButton.addEventListener('click', () => {
            const todoModal = document.querySelector('#todo-modal');
            todoModal.style.display = 'block';

            document.getElementById("todo-title").value = '';
            document.getElementById("todo-description").value = '';
            document.getElementById("todo-due-date").value = '';
            const todoPriority = document.getElementById("todo-priority");
            todoPriority.value = 'High';
            todoPriority.style.color = 'red';
            const projectSelect = document.getElementById("project-select");
            projectSelect.value = "";
            projectSelect.style.color = "black";
        });
    }

    // Create a Todo element
    createTodoElement(todo) {
        const todoElement = document.createElement("div");
        todoElement.className = "todo-item";
        todoElement.dataset.todoId = todo.id;

        // Get the project name
        const project = this.projectManager.getProject(todo.project);
        const projectName = project ? project.name : "Default Project";

        // Determine the priority class
        let priorityClass;
        switch (todo.priority) {
            case 'High':
                priorityClass = 'priority-high';
                break;
            case 'Medium':
                priorityClass = 'priority-medium';
                break;
            case 'Low':
                priorityClass = 'priority-low';
                break;
            default:
                priorityClass = '';
        }

        todoElement.innerHTML = `
            <div class="todo-info">
                <input type="checkbox" id="todo-${todo.id}" ${todo.isCompleted ? "checked" : ""} class="todo-complete-checkbox">
                <label for="todo-${todo.id}" class="todo-title">${todo.title}</label>
                <p class="todo-description">${todo.description}</p>
                <p class="todo-due-date">${todo.dueDate}</p>
                <p class="todo-priority ${priorityClass}">${todo.priority}</p>
                <p class="todo-project">${projectName}</p>
            </div>
        `;

        // Add a class if the todo is completed
        if (todo.isCompleted) {
            todoElement.classList.add('completed');
        };

        const checkbox = todoElement.querySelector(".todo-complete-checkbox");
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                todoElement.classList.add("completed");
            } else {
                todoElement.classList.remove("completed");
            }
        });

        // View button
        const viewButton = document.createElement("button");
        viewButton.className = "todo-view-button";
        viewButton.innerHTML = '<img src="./images/view.svg" alt="View todo">';
        viewButton.addEventListener("click", () => this.viewTodo(
            todo.id
        ));

        // Edit button
        const editButton = document.createElement("button");
        editButton.className = "todo-edit-button";
        editButton.innerHTML = '<img src="./images/edit.svg" alt="Edit todo">';
        editButton.addEventListener("click", () => this.openEditTodoModal(
            todo.id
        ));

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "todo-delete-button";
        deleteButton.innerHTML = '<img src="./images/delete.svg" alt="Delete todo">';
        deleteButton.addEventListener("click", () => this.deleteTodo(
            todo.id
        ));

        // Append the buttons to action div
        const actionDiv = document.createElement("div");
        actionDiv.className = "todo-actions";
        actionDiv.appendChild(viewButton);
        actionDiv.appendChild(editButton);
        actionDiv.appendChild(deleteButton);

        // Append all elements to the todo element
        todoElement.appendChild(actionDiv);
        
        return todoElement;
    }

    // Open the Todo modal
    openTodoModal() {
        this.populateProjectDropdown();
        document.getElementById("todo-modal").style.display = "block";
    }

    // Open the view Todo modal
    openViewTodoModal() {
        document.getElementById("view-todo-modal").style.display = "block";
        document.querySelector(".close-button").style.display = "block";
    }

    // Open editing modal
    openEditTodoModal(todoId) { 
        const todo = this.todoManager.getTodo(todoId);
        if (!todo) {
            alert("Todo not found.");
            return;
        }

        // Populate the project dropdown
        this.populateProjectDropdown();

        // Populate the edit form with the current Todo details
        document.getElementById("todo-title").value = todo.title;
        document.getElementById("todo-description").value = todo.description;
        document.getElementById("todo-due-date").value = todo.dueDate;
        document.getElementById("todo-priority").value = todo.priority;

        // Select the project
        const projectSelect = document.getElementById("project-select");
        projectSelect.value = todo.project || "";

        this.currenlyEditingTodoId = todoId;
        this.openTodoModal();
    }

    // Close the Todo modal
    closeTodoModal() {
        document.getElementById("todo-modal").style.display = "none";
    }

    // Close the view Todo modal
    closeViewTodoModal() {
        document.getElementById("view-todo-modal").style.display = "none";
        document.querySelector(".close-button").style.display = "none";
    }

    // Show feedback messages
    showFeedback(message, type = "info") {
        const feedbackElement = document.createElement("div");
        feedbackElement.className = `feedback feedback-${type}`;
        feedbackElement.textContent = message;

        document.body.appendChild(feedbackElement);

        // Remove the feedback message after 3 seconds
        setTimeout(() => {
            feedbackElement.remove();
        }, 3000);
    }

    openConfirmationDialog(message, confirmCallback) { 
        document.getElementById("confirmation-dialog-message").textContent = message;

        const confirmBtn = document.getElementById("confirm-button");
        const cancelBtn = document.getElementById("cancel-button");

        // Temorary event listeners for the buttons
        const tempConfirm = () => {
            confirmCallback();
            this.closeConfirmationDialog();
            confirmBtn.removeEventListener("click", tempConfirm);
            cancelBtn.removeEventListener("click", tempCancel);
        };

        const tempCancel = () => {
            this.closeConfirmationDialog();
            confirmBtn.removeEventListener("click", tempConfirm);
            cancelBtn.removeEventListener("click", tempCancel);
        };

        confirmBtn.addEventListener("click", tempConfirm);
        cancelBtn.addEventListener("click", tempCancel);

        document.getElementById("confirmation-dialog").style.display = "block";
    }

    // Close the confirmation dialog
    closeConfirmationDialog() {
        document.getElementById("confirmation-dialog").style.display = "none";
    }

    // Add a Todo
    addTodoFromUI() {
        const title = document.getElementById("todo-title").value;
        const description = document.getElementById("todo-description").value;
        const dueDate = document.getElementById("todo-due-date").value;
        const priority = document.getElementById("todo-priority").value;
        let projectId = document.getElementById("project-select").value;

        if (!projectId) {
            const defaultProject = this.projectManager.projects.find(project => project.name === "Default Project");
            projectId = defaultProject ? defaultProject.id : "";
        }

        this.todoManager.addTodo(
            title,
            description,
            dueDate,
            priority,
            projectId
        );

        this.showFeedback("Todo added successfully.", "success");
        this.closeTodoModal();
        this.displayTodosUI();
    }

    // View a Todo
    viewTodo(todoId) { 
        const todo = this.todoManager.getTodo(todoId);
        if (!todo) {
            alert("Todo not found.");
            return;
        }

        // Find the project by ID and get the name
        const project = this.projectManager.getProject(todo.project);
        const projectName = project ? project.name : "Default Project";

        // Populate the modal with the Todo details
        document.getElementById("view-todo-title").textContent = `Title: ${todo.title}`;
        document.getElementById("view-todo-description").textContent = `Description: ${todo.description}`;
        document.getElementById("view-todo-due-date").textContent = `Due Date: ${todo.dueDate}`;
        document.getElementById("view-todo-priority").textContent = `Priority: ${todo.priority}`;
        document.getElementById("view-todo-project").textContent = `Project: ${projectName}`;
        document.getElementById("view-todo-completed").textContent = `Status: ${todo.isCompleted ? "Completed" : "Not Completed"}`;

        // Open the modal
        this.openViewTodoModal();
    }

    // Edit a Todo
    editTodo() {
        if (!this.currenlyEditingTodoId) {
            alert("No Todo selected for editing.");
            return;
        }

        // Get the updated Todo details
        const updatedTitle = document.getElementById("todo-title").value;
        const updatedDescription = document.getElementById("todo-description").value;
        const updatedDueDate = document.getElementById("todo-due-date").value;
        const updatedPriority = document.getElementById("todo-priority").value;
        const updatedProjectId = document.getElementById("project-select").value;

        // Create an updated Todo object
        const updatedTodoData = {
            title: updatedTitle,
            description: updatedDescription,
            dueDate: updatedDueDate,
            priority: updatedPriority,
            project: updatedProjectId
        };

        // Update the Todo using TodoManager
        this.todoManager.updateTodo(
            this.currenlyEditingTodoId,
            updatedTodoData
        );

        this.showFeedback("Todo updated successfully.", "success");
        this.closeTodoModal();
        this.displayTodosUI();
    }

    // Delete a Todo
    deleteTodo(todoId) { 
        // Confirm with the user before deleting
        this.openConfirmationDialog("Are you sure you want to delete this Todo?", () => {
            // Delete the Todo using TodoManager
            this.todoManager.deleteTodo(todoId);

            this.showFeedback("Todo deleted successfully.", "success");
            // Update the UI to reflect the deletion
            this.displayTodosUI();
        });
    }

    // Toggle Todo completion status
    toggleTodoCompletion(todoId) {
        this.todoManager.toggleTodoCompletion(todoId);
        this.displayTodosUI();
    }

    // Display all Todos
    displayAllTodos() {
        this.displayTodosUI();
    }

    // Display Todos for today
    displayTodosForToday() {
        const todayTodos = this.todoManager.getTodosForToday();
        this.displayTodosUI(todayTodos);
    }

    // Display completed Todos
    displayCompletedTodos() {
        const completedTodos = this.todoManager.getCompletedTodos();
        this.displayTodosUI(completedTodos);
    }

    // Display important Todos
    displayImportantTodos() {
        const importantTodos = this.todoManager.getImportantTodos();
        this.displayTodosUI(importantTodos);
    }

    // Populate projects
    populateProjectDropdown() {
        const projectSelect = document.getElementById("project-select");
        projectSelect.innerHTML = "";

        // Add the default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a project";
        projectSelect.appendChild(defaultOption);

        // Add project options
        this.projectManager.projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    }
}

export default TodoUI;

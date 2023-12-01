import TodoManager from "./todoManager.js";

class TodoUI { 
    constructor() { 
        this.todoManager = new TodoManager();
        this.currenlyEditingTodoId = null;
        this.bindEventListeners();
    }

    // Bind event listeners
    bindEventListeners() {
        // Event listeners for filter links
        document.getElementById("filter-all").addEventListener("click", (e) => {
            e.preventDefault();
            this.displayAllTodos();
        });

        document.getElementById("filter-today").addEventListener("click", (e) => {
            e.preventDefault();
            this.displayTodosForToday();
        });

        document.getElementById("filter-completed").addEventListener("click", (e) => {
            e.preventDefault();
            this.displayCompletedTodos();
        });

        document.getElementById("filter-important").addEventListener("click", (e) => {
            e.preventDefault();
            this.displayImportantTodos();
        });

        // Event listener for the add Todo form submission
        document.getElementById("todo-form").addEventListener("submit", (e) => {
            e.preventDefault();
            this.addTodoFromUI();
        });

        // Event listener for Todo item actions
        document.querySelector(".main-content").addEventListener("click", (e) => {
            const todoId = e.target.closest(".todo-item")?.dataset.todoId;
            if (e.target.matches(".todo-view-button")) {
                this.viewTodo(todoId);
            } else if (e.target.matches(".todo-edit-button")) {
                this.openEditTodoModal(todoId);
            } else if (e.target.matches(".todo-delete-button")) {
                this.deleteTodo(todoId);
            }
        })

        // Event listener for closing the Todo modal
        document.querySelectorAll(".close-button").forEach(button => {
            button.addEventListener("click", () => this.closeTodoModal());
        });

        // Event listener for toggling Todo completion status
        document.addEventListener("change", (e) => {
            if (e.target.classList.contains("todo-complete-checkbox")) {
                const todoId = e.target.id.replace("todo-", "");
                this.toggleTodoCompletion(todoId);
            }
        })
    }

    // Display todos in the UI
    displayTodosUI() {
        const todos = this.todoManager.getAllTodos();
        const todoContainer = document.querySelector(".main-content");
        todoContainer.innerHTML = "";

        todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            todoContainer.appendChild(todoElement);
        })
    }

    // Create a Todo element
    createTodoElement(todo) {
        const todoElement = document.createElement("div");
        todoElement.className = "todo-item";
        todoElement.dataset.todoId = todo.id;
        todoElement.innerHTML = `
            <div class="todo-info">
                <input type="checkbox" id="todo-${todo.id}" ${todo.isCompleted ? "checked" : ""} class="todo-complete-checkbox" onchange="todoUI.toggleCompletion('${todo.id}')">
                <label for="todo-${todo.id}" class="todo-title">${todo.title}</label>
                <p class="todo-description">${todo.description}</p>
                <p class="todo-due-date">${todo.dueDate}</p>
                <p class="todo-priority">${todo.priority}</p>
                <p class="todo-project">${todo.project}</p>
            </div>
            <div class="todo-actions">
                <button onclick="todoUI.viewTodo('${todo.id}')" class="todo-view-button">
                    <img src="./images/view.svg" alt="View Todo">
                </button> 
                <button onclick="todoUI.editTodo('${todo.id}')" class="todo-edit-button">
                    <img src="./images/edit.svg" alt="Edit Todo">
                </button>
                <button onclick="todoUI.deleteTodo('${todo.id}')" class="todo-delete-button">
                    <img src="./images/delete.svg" alt="Delete Todo">
                </button>
            </div>
        `;
        return todoElement;
    }

    // Open the Todo modal
    openTodoModal() {
        document.getElementById("todo-modal").style.display = "block";
    }

    // Open editing modal
    openEditTodoModal(todoId) { 
        const todo = this.todoManager.getTodo(todoId);
        if (!todo) {
            alert("Todo not found.");
            return;
        }

        // Populate the edit form with the current Todo details
        document.getElementById("todo-title").value = todo.title;
        document.getElementById("todo-description").value = todo.description;
        document.getElementById("todo-due-date").value = todo.dueDate;
        document.getElementById("todo-priority").value = todo.priority;
        document.getElementById("project-select").value = todo.project;

        this.currenlyEditingTodoId = todoId;
        this.openTodoModal();
    }

    // Close the Todo modal
    closeTodoModal() {
        document.getElementById("todo-modal").style.display = "none";
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
        const projectId = document.getElementById("project-select").value;

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

        // Populate the modal with the Todo details
        document.getElementById("view-todo-title").textContent = `Title: ${todo.title}`;
        document.getElementById("view-todo-description").textContent = `Description: ${todo.description}`;
        document.getElementById("view-todo-due-date").textContent = `Due Date: ${todo.dueDate}`;
        document.getElementById("view-todo-priority").textContent = `Priority: ${todo.priority}`;
        document.getElementById("view-todo-project").textContent = `Project: ${todo.project}`;
        document.getElementById("view-todo-completed").textContent = `Status: ${todo.isCompleted ? "Completed" : "Not Completed"}`;

        // Open the modal
        this.openTodoModal();
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
        this.displayTodosUI(this.todoManager.getAllTodos());
    }

    // Display Todos for today
    displayTodosForToday() {
        this.displayTodosUI(this.todoManager.getTodosForToday());
    }

    // Display completed Todos
    displayCompletedTodos() {
        this.displayTodosUI(this.todoManager.getCompletedTodos());
    }

    // Display important Todos
    displayImportantTodos() {
        this.displayTodosUI(this.todoManager.getImportantTodos());
    }
}

export default TodoUI;

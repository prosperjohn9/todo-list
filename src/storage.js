import Todo from "./todo.js";
import Project from "./project.js";
import { format, parse, parseISO } from "date-fns";

class Storage {
    static saveTodos(todos) {
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    static loadTodos() {
        const storedData = localStorage.getItem("todos");
        return storedData ? JSON.parse(storedData).map(todoData => new Todo(
            todoData.title,
            todoData.description,
            Storage.formatDate(todoData.dueDate),
            todoData.priority,
            todoData.project,
            todoData.isCompleted,
        )) : [];
    }

    static saveProjects(projects) {
        localStorage.setItem("projects", JSON.stringify(projects));
    }

    static loadProjects() {
        const storedData = localStorage.getItem("projects");
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            return parsedData.map(projectData => {
                // Check if projectData is not null and has a name property
                if (projectData && projectData.name) {
                    const project = new Project(projectData.name);
                    project.todos = projectData.todos.map(todoData => new Todo(
                        todoData.title,
                        todoData.description,
                        Storage.formatDate(todoData.dueDate),
                        todoData.priority,
                        todoData.project,
                        todoData.isCompleted,
                    ));
                    return project;
                }
                // Return a default project if projectData is null or has no name property
                return new Project("Default");
            });
        }
        return [];
    }

    static formatDate(dateString) {
        if (!dateString) {
            console.error("Empty date string received in formatDate");
            return null;
        }
        try {
            // Parse the date from DD/MM/YYYY format
            let parsedDate; 

            // Check if the date string is already in ISO format
            if (dateString.includes("-")) {
                parsedDate = parseISO(dateString);
            } else {
                parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
            }

            // Format the date to ISO format
            return format(parsedDate, "yyyy-MM-dd");
        } catch (error) {
            console.error(`Error formatting date '${dateString}': ${error}`);
            return null;
        }
    }
}

export default Storage;

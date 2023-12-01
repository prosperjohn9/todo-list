import Todo from "./todo.js";
import Project from "./project.js";
import { format, parse } from "date-fns";

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
        try {
            // Parse the date from DD/MM/YYYY format
            const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());

            // Format the date to ISO format
            return format(parsedDate, "yyyy-MM-dd");
        } catch (error) {
            console.error(`Error formatting date: ${error}`);
            return dateString;
        }
    }
}

export default Storage;

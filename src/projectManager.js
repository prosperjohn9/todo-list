import Project from "./project.js";
import Storage from "./storage.js";

class ProjectManager { 
    constructor() {
        this.projects = Storage.loadProjects() || [];
        this.ensureDefaultProject();
    }

    // Default project is the first project in the list
    ensureDefaultProject() {
        if (this.projects.length === 0) {
            this.projects.push(new Project("Default Project"));
            Storage.saveProjects(this.projects);
        }
    }

    // Create a new project
    createProject(name) {
        const newProject = new Project(name);
        this.projects.push(newProject);
        Storage.saveProjects(this.projects);
    }

    // Get a project 
    getProject(projectId) {
        return this.projects.find(project => project.id === projectId);
    }

    // Add a Todo to a project
    addTodoToProject(todo, projectId) { 
        const project = this.getProject(projectId);
        if (project) {
            project.addTodo(todo);
            Storage.saveProjects(this.projects);
        }
    }

    // Update a project
    updateProject(projectId, updatedData) {
        const projectIndex = this.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            // Update project name or other properties as needed
            this.projects[projectIndex] = { ...this.projects[projectIndex], ...updatedData };
            Storage.saveProjects(this.projects);
        }
    }

    // Delete a project
    deleteProject(projectId) {
        this.projects = this.projects.filter(project => project.id !== projectId);
        Storage.saveProjects(this.projects);
    }
}

export default ProjectManager;
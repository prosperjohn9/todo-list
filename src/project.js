import { v4 as uuidv4 } from 'uuid';

class Project {
    constructor(name) {
        this.id = uuidv4();
        this.name = name;
        this.todos = [];
    }

    // Add a Todo to the project
    addTodo(todo) { 
        this.todos.push(todo);
    }
}

export default Project;
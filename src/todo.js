import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

class Todo {
  constructor(
    title,
    description,
    dueDate,
    priority,
    projectName,
    isCompleted = false
  ) {
    this.id = uuidv4();
    this.title = title;
    this.description = description;
    this.dueDate = format(new Date(dueDate), "dd/MM/yyyy");
    this.priority = priority;
    this.project = projectName;
    this.isCompleted = isCompleted;
  }
}

export default Todo;

### Task Management System | Incremental Development MVP - README Summary

**Overview**  
A simple web-based task management system that allows users to create, manage, complete, and delete tasks. It provides a user-friendly interface for organizing tasks by categories and priorities.

**Features**  
- Create tasks with a title, description, category, priority, and due date  
- Mark tasks as completed or incomplete  
- Edit or delete tasks  
- Categorize tasks for better organization  
- Data persistence through a backend database  
- Responsive interface

**Technologies**  
- Frontend: HTML, CSS, JavaScript (Axios for API requests)  
- Backend: Node.js, Express.js  
- Database: SQLite or MySQL

**Installation & Setup**  
1. Clone the repo and install dependencies  
2. Set up the database with the provided SQL script  
3. Start the backend server using `node server.js`  
4. Open `index.html` in a browser to run the frontend  

**API Endpoints**  
- `GET /tasks` - Fetch all tasks  
- `POST /tasks` - Create a new task  
- `PUT /tasks/:id` - Update a task  
- `DELETE /tasks/:id` - Delete a task

**Issues & Debugging**  
- Ensure data updates (completed status, categories) are saved correctly in the database  
- Verify frontend displays the most recent data after refreshing

**Live Demo**
[Click Here](https://kupiso.github.io/todo-list/)

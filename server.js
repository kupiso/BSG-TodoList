import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname)); // Serve static files from the root directory

// Set Content Security Policy to allow base64 images
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:;"
  );
  next();
});

// Initialize SQLite database
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if they do not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    task_date TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);
});

// Serve the index.html file at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- TASK ROUTES ---

// Get all tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(rows);
  });
});

// Add a new task
app.post('/tasks', (req, res) => {
  const { title, task_date, description, category, priority } = req.body;
  const sql = `INSERT INTO tasks (title, task_date, description, category, priority)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [title, task_date, description, category, priority];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error adding task:', err);
      return res.status(500).json({ error: 'Failed to add task' });
    }
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error retrieving task:', err);
        return res.status(500).json({ error: 'Task added but retrieval failed' });
      }
      res.status(201).json(row);
    });
  });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, task_date, description, category, priority } = req.body;
  const sql = `UPDATE tasks
               SET title = ?, task_date = ?, description = ?, category = ?, priority = ?
               WHERE id = ?`;
  const params = [title, task_date, description, category, priority, taskId];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).json({ error: 'Failed to update task' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, row) => {
      if (err) {
        console.error('Error retrieving updated task:', err);
        return res.status(500).json({ error: 'Task updated but retrieval failed' });
      }
      res.json(row);
    });
  });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.run('DELETE FROM tasks WHERE id = ?', [taskId], function (err) {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  });
});

// --- CATEGORY ROUTES ---

// Get all categories
app.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(rows);
  });
});

// Add a new category
app.post('/categories', (req, res) => {
  const { name } = req.body;
  const sql = 'INSERT INTO categories (name) VALUES (?)';
  db.run(sql, [name], function (err) {
    if (err) {
      console.error('Error adding category:', err);
      return res.status(500).json({ error: 'Failed to add category' });
    }
    db.get('SELECT * FROM categories WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error retrieving category:', err);
        return res.status(500).json({ error: 'Category added but retrieval failed' });
      }
      res.status(201).json(row);
    });
  });
});

// Delete a category
app.delete('/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  db.run('DELETE FROM categories WHERE id = ?', [categoryId], function (err) {
    if (err) {
      console.error('Error deleting category:', err);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  });
});
// Example: Update task using PUT (server side)
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, task_date, description, category, priority, completed } = req.body;
  const sql = `UPDATE tasks
               SET title = ?, task_date = ?, description = ?, category = ?, priority = ?, completed = ?
               WHERE id = ?`;
  const params = [title, task_date, description, category, priority, completed ? 1 : 0, taskId];
  // ... rest of update logic
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

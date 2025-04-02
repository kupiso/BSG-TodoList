import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your SQLite database file
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database for migration');
  }
});

// Check if the "completed" column already exists
db.all("PRAGMA table_info(tasks)", (err, columns) => {
  if (err) {
    console.error("Error reading table info:", err);
    db.close();
    return;
  }

  const hasCompleted = columns.some(col => col.name === "completed");
  if (hasCompleted) {
    console.log('Column "completed" already exists. No migration needed.');
    db.close();
  } else {
    // Add the completed column
    db.run('ALTER TABLE tasks ADD COLUMN completed INTEGER DEFAULT 0', (err) => {
      if (err) {
        console.error('Error adding "completed" column:', err);
      } else {
        console.log('Successfully added "completed" column to tasks table.');
      }
      db.close();
    });
  }
});

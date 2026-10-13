import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export interface Student {
  id: number;
  name: string;
  studentId: string;
  email: string;
  avatar: string | null;
}

// ---------------------------------------------------------------------------
// NATIVE (ANDROID/IOS): Use actual SQLite
// ---------------------------------------------------------------------------
let db: any;
if (Platform.OS !== 'web') {
  db = SQLite.openDatabaseSync('student_management.db');
}

export const initDb = () => {
  if (Platform.OS === 'web') return; // Do nothing on web
  db.execSync(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      studentId TEXT NOT NULL UNIQUE,
      email TEXT,
      avatar TEXT
    );
  `);
};

// ---------------------------------------------------------------------------
// WEB FALLBACK: Use In-Memory Array (For UI Testing only)
// ---------------------------------------------------------------------------
let webStudents: Student[] = [];
let webNextId = 1;

export const getStudents = (): Student[] => {
  if (Platform.OS === 'web') return [...webStudents].reverse();
  return db.getAllSync('SELECT * FROM students ORDER BY id DESC') as Student[];
};

export const getStudentById = (id: number): Student | null => {
  if (Platform.OS === 'web') return webStudents.find(s => s.id === id) || null;
  return db.getFirstSync('SELECT * FROM students WHERE id = ?', [id]) as Student | null;
};

export const addStudent = (name: string, studentId: string, email: string, avatar: string | null) => {
  if (Platform.OS === 'web') {
    const newStudent = { id: webNextId++, name, studentId, email, avatar };
    webStudents.push(newStudent);
    return newStudent.id;
  }
  const result = db.runSync(
    'INSERT INTO students (name, studentId, email, avatar) VALUES (?, ?, ?, ?)',
    [name, studentId, email, avatar]
  );
  return result.lastInsertRowId;
};

export const updateStudent = (id: number, name: string, studentId: string, email: string, avatar: string | null) => {
  if (Platform.OS === 'web') {
    const index = webStudents.findIndex(s => s.id === id);
    if (index !== -1) webStudents[index] = { id, name, studentId, email, avatar };
    return;
  }
  db.runSync(
    'UPDATE students SET name = ?, studentId = ?, email = ?, avatar = ? WHERE id = ?',
    [name, studentId, email, avatar, id]
  );
};

export const deleteStudent = (id: number) => {
  if (Platform.OS === 'web') {
    webStudents = webStudents.filter(s => s.id !== id);
    return;
  }
  db.runSync('DELETE FROM students WHERE id = ?', [id]);
};

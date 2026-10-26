import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export function openDb(path = 'data/app.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      lesson_id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'not_started',
      scroll_pos REAL NOT NULL DEFAULT 0, time_spent_sec INTEGER NOT NULL DEFAULT 0,
      started_at TEXT, completed_at TEXT);
    CREATE TABLE IF NOT EXISTS block_answers (
      lesson_id TEXT NOT NULL, block_id TEXT NOT NULL, answer_json TEXT NOT NULL,
      is_correct INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 1,
      answered_at TEXT NOT NULL, PRIMARY KEY(lesson_id, block_id));
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, exam_id TEXT NOT NULL,
      question_ids_json TEXT NOT NULL, started_at TEXT NOT NULL, finished_at TEXT,
      score_percent REAL, passed INTEGER);
    CREATE TABLE IF NOT EXISTS exam_answers (
      attempt_id INTEGER NOT NULL, question_id TEXT NOT NULL, answer_json TEXT,
      is_correct INTEGER, PRIMARY KEY(attempt_id,question_id));
    CREATE TABLE IF NOT EXISTS cards (
      card_id TEXT PRIMARY KEY, source TEXT NOT NULL, lesson_id TEXT,
      box INTEGER NOT NULL DEFAULT 1, due_at TEXT NOT NULL,
      last_reviewed_at TEXT, lapses INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS notes (
      lesson_id TEXT PRIMARY KEY, text TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS activity (
      day TEXT PRIMARY KEY, lessons_done INTEGER DEFAULT 0,
      cards_reviewed INTEGER DEFAULT 0, minutes REAL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  return db;
}
export function recordActivity(db, field, amount = 1, date = new Date()) {
  if (!['lessons_done','cards_reviewed','minutes'].includes(field)) throw Error('Поле активности');
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(date);
  db.prepare('INSERT OR IGNORE INTO activity(day) VALUES (?)').run(day);
  db.prepare(`UPDATE activity SET ${field} = ${field} + ? WHERE day = ?`).run(amount, day);
}


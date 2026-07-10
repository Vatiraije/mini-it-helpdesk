const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, process.env.DB_PATH || 'helpdesk.db');
const db = new Database(dbPath);

db.exec('PRAGMA foreign_keys = ON');

module.exports = db;
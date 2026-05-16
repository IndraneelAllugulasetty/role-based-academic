import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.SQLITE_DB_PATH
    ? path.resolve(process.env.SQLITE_DB_PATH)
    : path.join(process.cwd(), 'database.sqlite');
const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
const seedPath = path.join(process.cwd(), 'database', 'seed.sql');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeSchema() {
    if (fs.existsSync(schemaPath)) {
        console.log('Reading schema from:', schemaPath);
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        db.transaction(() => {
            statements.forEach(statement => {
                try {
                    db.prepare(statement).run();
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.error('Error executing schema statement:', err.message);
                        console.error('Statement:', statement);
                    }
                }
            });
        })();
        console.log('Schema initialization completed.');
    }
}

function seedDatabase() {
    if (fs.existsSync(seedPath)) {
        console.log('Seeding database from:', seedPath);
        const seed = fs.readFileSync(seedPath, 'utf8');
        const statements = seed
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        db.transaction(() => {
            statements.forEach(statement => {
                try {
                    db.prepare(statement).run();
                } catch (err) {
                    if (!err.message.includes('UNIQUE constraint failed')) {
                        console.error('Error executing seed statement:', err.message);
                    }
                }
            });
        })();
        console.log('Database seeding completed.');
    }
}

// Check if tables exist, if not initialize
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log('Existing tables:', tables.map(t => t.name));

// If core tables are missing, initialize
if (!tables.find(t => t.name === 'users') || !tables.find(t => t.name === 'departments')) {
    console.log('Initializing schema and seeding...');
    initializeSchema();
    seedDatabase();
} else {
    console.log('Database already initialized.');
}

// Mutex for queuing transactions
let isTransactionActive = false;
const transactionQueue = [];

async function acquireTransactionLock() {
    if (!isTransactionActive) {
        isTransactionActive = true;
        return;
    }
    return new Promise(resolve => transactionQueue.push(resolve));
}

function releaseTransactionLock() {
    if (transactionQueue.length > 0) {
        const next = transactionQueue.shift();
        next();
    } else {
        isTransactionActive = false;
    }
}

const internalExecute = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        try {
            const trimmedSql = sql.trim();
            const isSelect = trimmedSql.match(/^SELECT/i);

            if (isSelect) {
                const rows = db.prepare(sql).all(params);
                resolve([rows, null]);
            } else {
                const result = db.prepare(sql).run(params);
                resolve([{ insertId: result.lastInsertRowid, affectedRows: result.changes, warningStatus: 0 }, null]);
            }
        } catch (err) {
            reject(err);
        }
    });
};

const pool = {
    execute: async (sql, params = []) => {
        await acquireTransactionLock();
        try {
            return await internalExecute(sql, params);
        } finally {
            releaseTransactionLock();
        }
    },
    getConnection: async () => {
        await acquireTransactionLock();
        let released = false;
        
        const doRelease = () => {
            if (!released) {
                released = true;
                releaseTransactionLock();
            }
        };

        return {
            execute: (sql, params = []) => internalExecute(sql, params),
            beginTransaction: () => new Promise((resolve) => {
                try {
                    db.prepare('BEGIN TRANSACTION').run();
                } catch(e) {
                    console.error("Failed to begin transaction:", e);
                }
                resolve();
            }),
            commit: () => new Promise((resolve) => {
                try {
                    db.prepare('COMMIT').run();
                } catch(e) {}
                doRelease();
                resolve();
            }),
            rollback: () => new Promise((resolve) => {
                try {
                    db.prepare('ROLLBACK').run();
                } catch(e) {}
                doRelease();
                resolve();
            }),
            release: () => {
                doRelease();
            }
        };
    }
};

export default pool;

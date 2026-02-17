const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database', 'irctc.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');

let db = null;
let SQL = null;

async function initializeDatabase() {
    // Initialize SQL.js
    SQL = await initSqlJs();

    const dbExists = fs.existsSync(dbPath);

    if (dbExists) {
        console.log('Loading existing database...');
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        console.log('Creating new database...');
        db = new SQL.Database();

        // Read and execute schema
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        db.run(schema);
        console.log('Schema created successfully.');

        // Read and execute seed data
        const seed = fs.readFileSync(seedPath, 'utf-8');
        // Split by semicolons and execute each statement
        const statements = seed.split(';').filter(s => s.trim());
        statements.forEach(stmt => {
            try {
                db.run(stmt + ';');
            } catch (e) {
                // Ignore duplicate errors for seed data
            }
        });
        console.log('Seed data inserted successfully.');

        // Save to file
        saveDatabase();
    }

    return db;
}

function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

function getDatabase() {
    return db;
}

// Helper function to mimic better-sqlite3's prepare().get()
function prepare(sql) {
    return {
        get: (...params) => {
            try {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                if (stmt.step()) {
                    const result = stmt.getAsObject();
                    stmt.free();
                    return result;
                }
                stmt.free();
                return undefined;
            } catch (e) {
                console.error('SQL Error:', e.message, sql);
                return undefined;
            }
        },
        all: (...params) => {
            try {
                const results = [];
                const stmt = db.prepare(sql);
                stmt.bind(params);
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            } catch (e) {
                console.error('SQL Error:', e.message, sql);
                return [];
            }
        },
        run: (...params) => {
            try {
                db.run(sql, params);
                // Capture these immediately after db.run(), before saveDatabase()
                const lastInsertRowid = db.exec("SELECT last_insert_rowid()")[0]?.values[0][0] || 0;
                const changes = db.getRowsModified();
                saveDatabase();
                return { lastInsertRowid, changes };
            } catch (e) {
                console.error('SQL Error:', e.message, sql);
                throw e;
            }
        }
    };
}

// Transaction helper
function transaction(fn) {
    return (...args) => {
        db.run('BEGIN TRANSACTION');
        try {
            const result = fn(...args);
            db.run('COMMIT');
            saveDatabase();
            return result;
        } catch (e) {
            db.run('ROLLBACK');
            throw e;
        }
    };
}

module.exports = { initializeDatabase, getDatabase, prepare, transaction, saveDatabase };

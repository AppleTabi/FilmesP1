const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('MySQL kapcsolat létrehozva...');

        await connection.query('CREATE DATABASE IF NOT EXISTS filmfeltolto');
        console.log('Adatbázis létrehozva vagy már létezik: filmfeltolto');

        const uploadDirs = [
            path.join(__dirname, 'uploads'),
            path.join(__dirname, 'uploads/images'),
            path.join(__dirname, 'uploads/videos')
        ];

        for (const dir of uploadDirs) {
            try {
                await fs.access(dir);
                console.log(`A mappa már létezik: ${dir}`);
            } catch {
                await fs.mkdir(dir, { recursive: true });
                console.log(`Mappa létrehozva: ${dir}`);
            }
        }

        console.log('Inicializálás sikeres!');
        process.exit(0);
    } catch (error) {
        console.error('Hiba történt az inicializálás során:', error);
        process.exit(1);
    }
}

initializeDatabase(); 
const { exec } = require('child_process');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

exec(`psql "${dbUrl}" - f dump.sql`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing dump: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Error in dump execution: ${stderr}`);
        return;
    }
    console.log(`Dump executed successfully: ${stdout}`);
}); 
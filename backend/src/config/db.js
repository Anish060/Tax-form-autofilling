const { Sequelize } = require('sequelize');
// Note: Removed require('dotenv').config() as credentials are now hardcoded.

const sequelize = new Sequelize(
    'bc',       // Database Name
    'root',     // Username
    '',         // Password
    {
        // Connection details
        host: 'localhost', 
        dialect: 'mysql', // Ensure this dialect is correct for your setup
        port: 3306,       // Standard MySQL port
        logging: false,   // Set to true to see SQL queries in console

        // While the following options are for connection pools, they are often
        // managed internally by Sequelize. I've removed the specific pooling
        // settings (like connectionLimit) which are not Sequelize standard options.
    }
);

// Test the connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection successfully established with Sequelize.');
    } catch (error) {
        console.error('FATAL ERROR: Unable to connect to the database. Check credentials and server status:', error.message);
    }
})();

module.exports = sequelize;

/**
 * sync-db.js
 * Run once to create all database tables based on Sequelize models.
 * Usage: node sync-db.js
 *        node sync-db.js --force   (drops and recreates all tables — DESTRUCTIVE)
 */

require('dotenv').config();
const db = require('./models');

const force = process.argv.includes('--force');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅  Database connection established successfully.\n');

    if (force) {
      console.log('⚠️  --force flag detected: dropping and recreating all tables...\n');
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    }

    await db.sequelize.sync({ force, alter: true });

    if (force) {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    }

    console.log('✅  All tables synced successfully!\n');

    // List created tables
    const [results] = await db.sequelize.query('SHOW TABLES;');
    console.log('📋  Tables in database:');
    results.forEach((row, i) => {
      const tableName = Object.values(row)[0];
      console.log(`   ${i + 1}. ${tableName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌  Unable to sync database:', error.message);
    console.error(error);
    process.exit(1);
  }
})();

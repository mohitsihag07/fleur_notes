require('dotenv').config();
const db = require('./models');
const bcrypt = require('bcrypt');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected.');

    const email = 'admin@fleur.com';
    const password = 'admin123';

    // Check if user exists
    let user = await db.User.findOne({ where: { email } });
    if (user) {
      console.log('Admin user already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.role = 'admin';
      user.status = 'active';
      user.is_email_verified = true;
      await user.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('Creating new Admin user...');
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await db.User.create({
        name: 'Fleur Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        is_email_verified: true
      });
      
      // Also create profile
      await db.UserProfile.create({
        user_id: user.id,
        gender: 'other',
        bio: 'Lead E-Commerce Administrator'
      });

      console.log('Admin user created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
})();

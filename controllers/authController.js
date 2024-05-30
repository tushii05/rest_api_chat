const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');


exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { username } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).send('Invalid username or password.');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.jwtToken = token;
    await user.save();
    
    res.cookie('token', token, { httpOnly: true }).send('Login successful.');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await db.User.findByPk(id);
    user.jwtToken = null;
    await user.save();
    res.clearCookie('token').send('Logout successful.');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

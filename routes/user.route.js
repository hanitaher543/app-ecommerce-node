const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Créer un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = new User({ email, password, firstname, lastname });
    const createdUser = await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: createdUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});



/**
 * Afficher la liste des utilisateurs
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Activer / Désactiver un utilisateur (admin)
 */
router.get('/status/edit', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Se connecter (Login)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select('+password +isActive');

    if (!user) {
      return res.status(404).json({ success: false, message: "Account doesn't exist" });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return res.status(401).json({ success: false, message: "Please verify your credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account is inactive, Please contact your administrator" });
    }

    delete user._doc.password;

    const token = jwt.sign(
      { iduser: user._id, name: user.firstname, role: user.role },
      process.env.SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ success: true, user, token });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { uploadFile } = require('../middleware/uploadfile');
require('dotenv').config();

/* ===========================
   CONFIG NODEMAILER
=========================== */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hani.taher2000@gmail.com',
    pass: 'diqo peds wudi oext', // app password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* ===========================
   REGISTER + EMAIL ACTIVATION
=========================== */
router.post(
  '/register',
  uploadFile.single('avatar'),
  async (req, res) => {
    try {
      const { email, password, firstname, lastname } = req.body;
      const avatar = req.file ? req.file.filename : null;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }

      const newUser = new User({
        email,
        password,
        firstname,
        lastname,
        avatar,
        isActive: false,
      });

      const createdUser = await newUser.save();

      const mailOption = {
        from: '"Verify your email" <esps421@gmail.com>',
        to: createdUser.email,
        subject: 'Verify your email',
        html: `
          <h2>Hello ${createdUser.firstname}</h2>
          <h4>Please verify your email to activate your account</h4>
          <a href="http://${req.headers.host}/api/users/status/edit?email=${createdUser.email}">
            Click here to activate
          </a>
        `,
      };

      transporter.sendMail(mailOption);

      res.status(201).json({
        success: true,
        message: 'Account created. Check your email to activate.',
        user: createdUser,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* ===========================
   ACTIVER / DESACTIVER COMPTE
=========================== */
router.get('/status/edit', async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account status updated',
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ===========================
   LOGIN (ACCESS + REFRESH)
=========================== */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({ email }).select('+password +isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account doesn't exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Please activate your account via email',
      });
    }

    const accessToken = jwt.sign(
      { iduser: user._id, role: user.role },
      process.env.SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { iduser: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    delete user._doc.password;

    res.status(200).json({
      success: true,
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ===========================
   REFRESH TOKEN
=========================== */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Expired refresh token',
        });
      }

      const newAccessToken = jwt.sign(
        { iduser: user._id, role: user.role },
        process.env.SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ===========================
   LOGOUT
=========================== */
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/* ===========================
   LIST USERS
=========================== */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;

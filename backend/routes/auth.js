const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, updateUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id', protect, adminOnly, updateUser);

module.exports = router;

const express = require('express');
const { createUser, getUsers, updateUser, deleteUser, assignResidentToFlat } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', authorize('Admin'), createUser);
router.get('/', authorize('Admin'), getUsers);
router.patch('/:id', authorize('Admin'), updateUser);
router.delete('/:id', authorize('Admin'), deleteUser);
router.post('/assign-flat', authorize('Admin'), assignResidentToFlat);

module.exports = router;

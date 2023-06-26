const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createMessage, allMessage } = require('../controller/messageController');

const router = express.Router();

router.route('/').post(authMiddleware,createMessage);
router.route('/:chatId').get(authMiddleware,allMessage);


module.exports = router;
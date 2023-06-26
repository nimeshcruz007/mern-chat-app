const express = require('express');
const router = express.Router();
const tokenVerify = require('../middleware/authMiddleware')
const { accessChat,fetchChat,createGroupChat,renameGroup,addToGroup,removeFromGroup } = require('../controller/chatController');


router.route('/').post(tokenVerify,accessChat);
router.route('/').get(tokenVerify,fetchChat);
router.route('/group').post(tokenVerify,createGroupChat);
router.route('/rename').put(tokenVerify,renameGroup);
router.route('/groupadd').put(tokenVerify,addToGroup);
router.route('/groupremove').put(tokenVerify,removeFromGroup);

module.exports = router;
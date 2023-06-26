const express = require('express');
const router = express.Router();
const { userRegister,userLogin,allUsers } = require('../controller/userAuth');
const tokenVerifier = require('../middleware/authMiddleware');

//using '/' routes for signup tab an /login for login tab
router.route('/').post( userRegister ).get(tokenVerifier,allUsers);
router.route('/login').post( userLogin );


module.exports = router;
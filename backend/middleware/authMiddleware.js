const jwt = require('jsonwebtoken');
const Users = require("../models/userModels");
const asyncHandler = require("express-async-handler");

// extracting userid from the jwt token while user requests

const tokenVerifier = asyncHandler(async(req,res,next)=>{
    let token;
try{
    if( req.headers.authorization && req.headers.authorization.startsWith("Bearer") ){

        token = req.headers.authorization.split(" ")[1];

        //secret used with jwt for the creation of a token in ./config/generateToken.js
        const decode = jwt.verify(token,"secret");
        req.user = await Users.findById(decode.id).select("-password");
        next();
    }
}catch(error){
    res.status(401)
    throw new Error("Not authorized, jwt token failed in (authMiddleware.js)");
}

})

module.exports = tokenVerifier; 
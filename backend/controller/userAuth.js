const Users = require('../models/userModels');
const asyncHandler = require('express-async-handler');
const generateToken = require('../config/generateToken');


console.log(Users);
// user signup handler for route '/'
const userRegister = asyncHandler(async(req,res)=>{
    const { name,email,password,picture } = req.body;

    if( !name||!email||!password ){
        res.status(400);
        throw new Error('Please fill all the required fields');
    }

    const userExist = await Users.findOne({email});
    if(userExist){
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const userCreate = await Users.create({
        name,
        email,
        password,
        picture
    });

    console.log(userCreate);

    if(userCreate){
        // res.status(201).json({
        //     _id:userCreate._id,
        //     name:userCreate.name,
        //     email:userCreate.email,
        //     picture:userCreate.pic,
        //     token:generateToken(userCreate._id)
        // });
        res.status(201).json(userCreate)
    }else{
        res.status(400);
        throw new Error('Failed to create new user');
    }


});

//'/login' route handle function
const userLogin = asyncHandler(async(req,res)=>{

    const { email,password } = req.body;

    if(!email||!password){
        res.status(400);
        throw new Error('Please fill all the required fields')
    }

    const user = await Users.findOne({email:email})
    
    if(user && (await user.matchPassword(password))){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            picture:user.picture,
            password:user.password,
            token:generateToken(user.id)
        })

    }else{
        res.status(400)
        console.log("user doesn't exist");
    }
}) 

// /app/chat?search=fsdkf query function
const allUsers = asyncHandler(async(req,res) =>{
    const keyword = req.query.search 
    ?
     {
        $or:[
            {name:{$regex:req.query.search, $options:"i"}},
            {email:{$regex:req.query.search, $options:"i"}}
        ],
    }
    :{};
    const users = await Users.find(keyword).find({_id:{$ne:req.user._id}});
    res.send(users);
})

module.exports = { userRegister,userLogin,allUsers };
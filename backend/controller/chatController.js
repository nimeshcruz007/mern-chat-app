const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModels');
const Users = require("../models/userModels")


const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        res.status(401);
        throw new Error('sorry pls provide an authorization token from chatController.js');
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.body._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    }).populate("users", "-password").populate("latestMessage");

    isChat = await Users.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };
        try {
            const createChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password");
            res.status(200);
            res.send(FullChat)
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
})

const fetchChat = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("latestMessage")
            .populate("groupAdmin", "-password")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await Users.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                });
                res.status(200).send(results);
            })
    } catch (error) {
        res.status(400);
        throw new Error('Error occured while fetching the chat(chatController.js)')
    }
})


const createGroupChat = asyncHandler(async (req, res) => {

    //we need a group chat name and the members in the groupchat(will be passed from the front end as an array)
    if (!req.body.users || !req.body.name) {
        // res.status(400);
        res.send("please fill all the fields");
        return
    }

    //the array will be in a json format so it needs to be converted
    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        res.status(400).send("More than 2 users are required to create a group chat");
        return
    }

    //pushing also user who is created the group chat
    users.push(req.user)

    //check whether the groupchat contains more than 2 users

    try {
        const grouptChat = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: grouptChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat)

    } catch (error) {

        res.status(400)
        throw new Error("unable to create or fetch groupchat in/from database");

    }


})

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    try {

        const renameChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(renameChat)
    } catch (error) {

        res.status(400)
        throw new Error("Unable to update the groupname to a new provided one")

    }

})

const addToGroup = asyncHandler(async (req,res) => {
    const { chatId,userId } = req.body;

    const addedGroup = await Chat.findByIdAndUpdate( chatId,{ $push:{users:userId}},{new:true})
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!addedGroup){
        res.status(400);
        throw new Error("Error occured User Can't be added")
    }else{
        res.status(200).json(addedGroup)
    }
})

const removeFromGroup = asyncHandler(async (req,res)=>{
    const {chatId,userId} = req.body;

    const updatedGroup = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId},
        },
        {
            new:true
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password");

    if(!updatedGroup){
        res.status(400);
        throw new Error("error occured,unnable to delete the user from the groupChat")
    }else{
        res.status(200).json(updatedGroup);
    }
})

module.exports = { accessChat, fetchChat, createGroupChat, renameGroup, addToGroup, removeFromGroup};
const asyncHandler = require("express-async-handler");
const Message = require('../models/messageModel')
const User = require('../models/userModels');
const Chat = require('../models/chatModels')

const createMessage = asyncHandler(async(req,res)=>{

    const { content,chatId } = req.body;

    if( !content || !chatId){
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    try {

        var message = {
            sender:req.user._id,
            content:content,
            chat:chatId,
        }

       var newMessage = await Message.create(message);
       newMessage = await newMessage.populate("sender","name picture");
       newMessage = await newMessage.populate("chat");
       newMessage = await User.populate(newMessage,{
        path:'chat.users',
        select:'name picture email',
       });

       await Chat.findByIdAndUpdate(req.body.chatId,{
        latestMessage:newMessage
       });


       res.json(newMessage);
        
    } catch (error) {
        res.status(400);
        throw new Error('unable to create message ', error);
    }

})

const allMessage = asyncHandler(async(req,res)=>{
    const chatId = req.params.chatId;

    try {

        const allChatMessage = await Message.find({chat:chatId})
        .populate("sender","name picture email") 
        .populate("chat");
        
        res.json(allChatMessage);
        res.status(200);

    } catch (error) {
        throw new Error('unable to fetch chats from database');
        res.status(400);
    }

})

module.exports = { createMessage,allMessage };
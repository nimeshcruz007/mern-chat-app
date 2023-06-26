const express = require('express');
const { chats } = require('./data/data.js')
const connectDB = require('../backend/config/db')
const userRoutes = require('./Routes/userRoute')
const chatRoute = require('./Routes/chatRoute')
const messageRoute = require('./Routes/messageRoute')
const path = require('path')
const app = express();

connectDB();

app.use(express.json());



app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoute);
app.use('/api/message', messageRoute);

// ----------- Hosting codes-------------

const __dirname1 = path.resolve();

NODE_ENV = 'production';

if(NODE_ENV === "production" ){
    app.use(express.static(path.join(__dirname1,"/frontend/build")))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
    })
}else{
app.get('/', (req, res) => {
    res.send("----------- Not Here -------------")
})
}

// ----------- Hosting codes-------------

const server = app.listen(
    5000, 
    () => console.log('http://localhost:5000'))

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "https://localhost:3000"
    }
});

io.on("connection", (socket) => {
    console.log("connection established");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join room", (room) => {
        socket.join(room);
        console.log("User Joined Room ", room);
    })

    socket.on("typing",(room)=>{
        socket.in(room).emit('typing');
    })

    socket.on("stop typing",(room)=>{
        socket.in(room).emit('stop typing');
    })

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log('users inside chat collection is not defined');

        chat.users.forEach(item => {
            //stopping the message from sending back towards us in a group chat
            if (item._id === newMessageReceived.sender._id) return;
            socket.in(item._id).emit("message received", newMessageReceived);
        });
    })

    socket.off("setup",()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id)
    })
})
const express = require("express")
const cors = require('cors');
const { connection } = require('./config/db')
const {userRouter} = require("./route/user.route")
require("dotenv").config()


const app = express()
app.use(express.json())
app.use(cors());
app.use("/users",userRouter)



const socketio = require("socket.io");
const http = require("http");

const { userJoin, getRoomUsers, getCurrentUser, userLeave } = require("./utils/users");
const formateMessage = require("./utils/messages");

//server connection
const server=http.createServer(app)
const io=socketio(server)



io.on("connection",(socket)=>{

    // console.log("One user has joined");

    socket.on("joinRoom",({username,room})=>{

      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      // Welcome message 
      socket.emit("message",formateMessage("chat",`Welcome to ${room}`));

      // Broadcasting other users
      socket.broadcast.to(user.room).emit("message",formateMessage("chat",`${username} has joined the chat`));

      // getting room users.
         io.to(room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
         })
    });

     socket.on("chatMessage",(msg)=>{
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message",formateMessage(user.username,msg));

     });

    
    socket.on("disconnect",()=>{

    const user = userLeave(socket.id);
        console.log("one user left");

          // Broadcastion other users on leaving 
       io.to(user.room).emit("message",formateMessage("Chat",`${user.username} has left the chat`));
 
       // getting room users.
  io.to(user.room).emit("roomUsers",{
    room:user.room,
    users:getRoomUsers(user.room)
 })
 
        })

})

server.listen(process.env.PORT,async()=>{
    try {
        await connection
        console.log("Connected to DB")
    } catch (error) {
        console.log(error.message)
    }
    console.log("server is running")
})
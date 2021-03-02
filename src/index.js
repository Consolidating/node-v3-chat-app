const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { isNullOrUndefined } = require('util')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server) //Sets up file that is served up that clients can access



const port = process.env.PORT || 3000

const PublicDirectoryPath = path.join(__dirname, "../public")


app.use(express.static(PublicDirectoryPath))


io.on('connection', (socket)=>{ //Event listen for client, we use socket to communicate with client 
    //console.log('new Web socket connection')

    socket.on('join', ( { username, room }, callback )=>{

        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        //socket.emit - sends to specific client 
        //io.emit - sends to every client
        //socket.broadcast.emit = sends event to every connected EXCEPT 
        //io.to.emit - Emits event to everyone in specific room 
        socket.emit("message", generateMessage("Room Admin", `Welcome ${user.username}!`))

        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message,  callback)=>{
        const filter = new Filter()
        const user = getUser(socket.id)

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit("message", generateMessage(user.username, message)) 
        callback()
    })



    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', 

        generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}` ))
        callback()
    })



    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })


})





server.listen(port, ()=>{
    console.log(`Server is up on port ${port}`)
})


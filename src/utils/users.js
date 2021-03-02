const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room } ) => {
    //id associated with individual socket

    //Clean Data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate Data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }
 
    // Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate username
    if (existingUser){
        return {
            error: "Username already taken! Please try another one"
        }
    }

    //Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
    
}


const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if (index !== -1){
        return users.splice(index, 1)[0] //Get Back array and we extract 
    }
}


const getUser = (id) => {
    let user = users.filter((user)=>{
        return user.id === id
    })
    return user[0]
}



const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter((user) => {
        return user.room === room
    })

    return usersInRoom

}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
const socket = io() //Connects to server, variable to store function return value 

// Elements
const $messageForm  = document.querySelector('#message-form')//Dollarsign is convnetion - Letting you know it is element of DOM
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages') 

// Templates 
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) //Makes sure question mark goes away
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

 
        $messages.scrollTop = $messages.scrollHeight
    
}

socket.on("message", (message)=>{
    //console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on("locationMessage", (message)=>{
    const html = Mustache.render(locationMessageTemplate, {
       username: message.username,
       url: message.url,
       createdAt: moment(message.createdA).format('h:mm A'),
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on("roomData", ({ room, users })=>{
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled') //Disables form once submitted

    //Disable Form 
    const message = e.target.elements.message.value 

    socket.emit('sendMessage', message, (error)=>{ //Will run when event acknowledged 
        // Enable Form 
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '' //Sets to empty string to clear it 
        $messageFormInput.focus() 

        if(error) {
            return console.log(error)
        } 

        //console.log("Message Delivered!")

    })

})


$sendLocationButton.addEventListener('click', ()=>{
   
    
    if (!navigator.geolocation){
        return alert('Geolocation not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled') //Disables form once submitted

    navigator.geolocation.getCurrentPosition((position)=>{

        //console.log(position)

        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (acknowledgement)=>{
            //console.log(acknowledgement)
            $sendLocationButton.removeAttribute('disabled')

        })
    })

})


socket.emit('join',{ username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
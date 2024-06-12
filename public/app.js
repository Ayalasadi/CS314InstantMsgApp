const socket = io('ws://localhost:3500')

const realName = document.querySelector('#realname')
const screenName = document.querySelector('#screenname')
const signupPass = document.querySelector('#password1')
const confirmPass = document.querySelector('#password2')


const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const loginPassword = document.querySelector('#password3')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')

//mongodb+srv://kenr:zvcIoXe9mA64TOWR@cluster0.smaezbf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

function sendMessage(e) {
    e.preventDefault()
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value
        })
        msgInput.value = ""
    }
    msgInput.focus()
}

function signUp(e) {
    e.preventDefault()
    if (realName.value && screenName.value && signupPass.value && confirmPass.value) {
        console.log("User has signed up.");
        socket.emit('signUp', {
            realname: realName.value,
            screenname: screenName.value,
            signup: signupPass.value,
            confirm: confirmPass.value
        })
    }
    const user = {
        "fullName": realName.value,
        "username": screenName.value,
        "password": signupPass.value,
        "confirmPassword": confirmPass.value
    };
    fetch("http://localhost:3500/api/auth/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(user)
    })
        .then((response) => response.json())
        .then((data) => console.log("Success:", data))
        .catch((error) => console.error("Error:", error));
}


function enterRoom(e) {
    e.preventDefault()

    const user = {
        "username": nameInput.value,
        "password": loginPassword.value,
    };

    fetch("http://localhost:3500/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(user)
    })
        .then((response) => response.json())
        .then((data) => console.log("Success:", data))
        .catch((error) => console.error("Error:", error));

    if (nameInput.value && loginPassword.value && chatRoom.value) {
        console.log("User has entered the room.");
        socket.emit('enterRoom', {
            name: nameInput.value,
            login: loginPassword.value,
            room: chatRoom.value
        })
    }
}




document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-signup')
    .addEventListener('submit', signUp)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = ""
    const { name, text, time } = data
    const li = document.createElement('li')
    li.className = 'post'
    if (name === nameInput.value) li.className = 'post post--left'
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right'
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name === nameInput.value
            ? 'post__header--user'
            : 'post__header--reply'
            }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    document.querySelector('.chat-display').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
})

let activityTimer
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`

    // Clear after 3 seconds 
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})

socket.on('userList', ({ users }) => {
    showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms)
})

function showUsers(users) {
    usersList.textContent = ''
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ","
            }
        })
    }
}

function showRooms(rooms) {
    roomList.textContent = ''
    if (rooms) {
        roomList.innerHTML = '<em>Active Rooms:</em>'
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ","
            }
        })
    }
}
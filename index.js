//Ken Rutan - index.js
import express from 'express'
import { Server } from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'
import { login, register } from './auth.js'; //Aya: added user registration and login capabilities 
import cors from 'cors'; //Aya: import CORS module
import jwt from 'jsonwebtoken'; //Aya: import JWT module

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const PORT = process.env.PORT || 3500
const app = express();

//Aya: Configure CORS based on the environment
const corsOptions = {
    origin: process.env.NODE_ENV === "production" ? 'http://localhost:5500' : '*',
    methods: ['GET', 'POST']  // Adjust according to your needs
};

app.use(cors(corsOptions)); //Aya: applies CORS middleware to all incoming requests
app.use(express.json()); //Aya: adds JSON parsing middleware
app.use(express.static(path.join(__dirname, "public")))

//Aya: Autentication routes
app.post('/register', async (req, res) => {
    try {
        const user = await register(req.body.username, req.body.password);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Aya: User login route
app.post('/login', async (req, res) => {
    try {
        const token = await login(req.body.username, req.body.password);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

//Aya: error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Uh-Oh, something broke!');
});

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

//Aya: Socket.IO server
const io = new Server(expressServer, {
    cors: corsOptions  //Aya: Apply CORS settings to Socket.IO
});

/*
//Aya: commenting this out and replacing it with the above code
//     to make the CORS configuration more robust and environment-specific.
const io = new Server(expressServer, {
    cors: {
        //origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500", "http://97.120.199.112:5500"]     //"*" Will allow access from everywhere.
        origin: "*"     //"*" Will allow access from everywhere.

    }
}); */

//Aya: adding middleware to Socket.IO that checks tokens provided during 
//     the socket connection process
io.use((socket, next) => {
    const token = socket.handshake.query.token; //get token sent from client
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            console.log('Authentication error:', err.message);
            return next(new Error('Authentication error')); //block connection if error
        }
        socket.decoded = decoded; //save decoded info (user ID) to socket session
        next(); //proceed with the connection
    });
});

io.on('connection', socket => {
    console.log(`Authenticated user ${socket.decoded.id} connected`); //Aya: Now we can use decoded info

    // Upon connection - only to user
    socket.emit('message', "Welcome to the Chat App!")

    // Upon connection - to all others
    socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)} connected`)

    //Aya: enhanced logging for message events
    socket.on('message', data => {
        console.log(`Message from ${socket.decoded.id}: ${data}`);
        io.emit('message', `${socket.decoded.id}: ${data}`);
    });

    // When user dissconnects - to all others
    socket.on('disconnect', () => {
        console.log(`User ${socket.decoded.id} disconnected`); //Aya: Log when user disconnects
        socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)} disconnected`);
    });

    // Listen for activity
    socket.on('activity', (name) => {
        nsole.log(`${name} is typing...`); //Aya: Log typing activity
        socket.broadcast.emit('activity', name);
    });
});


//httpServer.listen(3500, () => console.log('listening on port 3500'))
// Import necessary modules
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const verifyToken = require('../verifyToken');

// Create Express app and router
const app = express();
const router = express.Router();

// Set up middleware
app.use(cors());
app.use(express.json());

// Create HTTP server using Express app
const server = http.createServer(app);

// Set up socket.io with the server
const io = socketIo(server);

// Define socket connection event handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Handle new post event
    socket.on('newPost', (data) => {
        console.log('New post created:', data);
        // Broadcast the new post to all connected clients
        io.emit('newPost', data);
    });

    socket.on('typing',(data)=>{
        console.log(data);
    })
});

// Routes

// CREATE a new post
router.post("/create", verifyToken, async (req, res) => {
    console.log("create hit");
    try {
        const { title, desc, username, userId, categories, photo } = req.body;

        // Create a new post instance
        const newPost = new Post({
            title,
            desc,
            username,
            userId,
            categories,
            photo // If you have a photo field
        });

        // Save the post to the database
        const savedPost = await newPost.save();

        // Emit the new post data to connected clients
        io.emit("newPost", savedPost);

        res.status(200).json(savedPost);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// UPDATE a post
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE a post
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ postId: req.params.id });
        res.status(200).json("Post has been deleted!");
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET POST DETAILS
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET POSTS
router.get("/", async (req, res) => {
    const query = req.query;
    try {
        const searchFilter = {
            title: { $regex: query.search, $options: "i" }
        };
        const posts = await Post.find(query.search ? searchFilter : null);
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER POSTS
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Set up routes
// app.use('/api/posts', router);

// // Start the server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


module.exports = router;
const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const multer=require('multer')
const path=require("path")
const cookieParser=require('cookie-parser')
const authRoute=require('./routes/auth')
const userRoute=require('./routes/users')
const postRoute=require('./routes/posts')
const commentRoute=require('./routes/comments')
const http = require("http")
const {Server} = require("socket.io")
const Post = require('./models/Post');


app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true // Enable credentials if needed
}));



const server = http.createServer(app)

const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });




  let postData = {}; // Initialize postData variable

  io.on("connection", (socket) => {
      console.log("A new connection", socket.id);

      let postData = {}
  
      socket.on("send message", (data) => {
          // Update postData with the received data
          postData = data;
          console.log("Received message:", postData);
      });

      
  
      socket.on("save post", async () => {
          // Call the postblog function to save the post
           postblog(postData);
          console.log("save post called");
      });



      socket.on("delete post", async (data) => {
        // Call the postblog function to save the post
        deletePost(data);
        console.log("post deleted")
    });

    const deletePost = async(id)=>{

        try {
            await Post.findByIdAndDelete(id);
            socket.emit("delete post susccess");
            return "postdeletd";
        } catch (err) {
            throw new Error(err);
        }
    }



 socket.on("send updated message", (data) => {
          // Update postData with the received data
          updatedPost(data.messageData ,  data.postId)
          console.log("send updated message:", data.messageData ,  data.postId);


      });


      socket.on("give search  post", async (data) => {
        // Update postData with the received data
        const post  = await fetchpost(data); 

        

        console.log("fettched post" ,  post );
       


    });


    socket.on("give detail post", async (data) => {
        // Update postData with the received data
        const post  = await detailspost(data); 
        console.log("fettched detail post" ,  post );
    });



    socket.on("give user post", async (data) => {
        // Update postData with the received data
        const post  = await userpost(data); 
        console.log("fettched user post" ,  post );
    });
       



  });


  const updatedPost = async(data , id)=>{

    try {
        const updatedPost = await Post.findByIdAndUpdate(id, { $set: data }, { new: true });
        return updatedPost;
    } catch (err) {
        console.log(err);
        throw new Error("Internal server error");
    }
  }
  
  const postblog = async (postData) => {
    console.log("[[[[[[[[" , postData)
      try {
          // Create a new post instance
          const newPost = new Post({
              title: postData.title,
              desc: postData.description,
              username: postData.username,
              userId: postData.userId,
              categories: postData.categories,
              photo : postData.photo
          });
  
          // Save the post to the database
          const savedPost = await newPost.save();
  
          // Emit the new post data to connected clients
          io.emit("newPost", savedPost);
  
          return savedPost;
      } catch (err) {
          console.log(err);
          throw new Error("Internal server error");
      }
  };


  const fetchpost = async(data)=>{

    try {
        const searchFilter = {
            title: { $regex: data, $options: "i" }
        };
        const posts = await Post.find(data ? searchFilter : null);
        io.emit("take post data" , posts )
        return posts;
    } catch (err) {
        throw new Error("Internal server error");
    }


    }

    const detailspost = async(data)=>{

        try {
            const post = await Post.findById(data);
            io.emit("take post details" , post )
            return  post;
        } catch (err) {
            throw new Error("Internal server error");
        }

    }


    const userpost = async(data)=>{

        try {
            const posts = await Post.find({ userId: data});
            io.emit("take user post" , posts )
            return posts;
        } catch (err) {
            res.status(500).json(err);
        }

    }


  




const connectDB=async()=>{
    try{

        await mongoose.connect("mongodb://localhost:27017/app-avenger")
        console.log("database is connected successfully!")

    }
    catch(err){
        console.log(err)
    }
}



//middlewares
dotenv.config();
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// WebSocket event handling


//image upload
const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    fn(null, "images");
  },
  filename: (req, file, fn) => {
    fn(null, req.body.img);
  }
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("Image has been uploaded successfully!");
});

// Start the server
const PORT = 5000;


server.listen(5000,()=>{
    connectDB()
    console.log("app is running on port "+5000)
})
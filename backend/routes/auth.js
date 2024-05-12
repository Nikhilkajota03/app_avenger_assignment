const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')


//REGISTER
router.post("/register",async(req,res)=>{
    try{
        const {username,email,password}=req.body
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hashSync(password,salt)
        const newUser=new User({username,email,password:hashedPassword})
        const savedUser=await newUser.save()
        res.status(200).json(savedUser)

    }
    catch(err){
        res.status(500).json(err)
    }

})


//LOGIN
router.post("/login",async (req,res)=>{


    console.log(req.body.email , req.body.password)


    try{
        const user=await User.findOne({email:req.body.email})
       
        console.log(user);

        if(!user){
            return res.status(404).json("User not found!")
        }

        const match=await bcrypt.compare(req.body.password,user.password)
        console.log(match)
        
        if(!match){
            return res.status(401).json("Wrong credentials!")
        }

        console.log("after match")

        const token=jwt.sign({_id:user._id,username:user.username,email:user.email},"nvyjfu896hgf76",{expiresIn:"3d"})
        console.log(token)
        const {password,...info}=user._doc
        res.cookie("token",token).status(200).json(info)

    }
    catch(err){
        res.status(500).json(err)
    }
})



//LOGOUT
router.get("/logout",async (req,res)=>{
    try{
        res.clearCookie("token",{sameSite:"none",secure:true}).status(200).send("User logged out successfully!")

    }
    catch(err){
        res.status(500).json(err)
    }
})


router.get("/user",async(req,res)=>{

  res.status(200);




})




//REFETCH USER
router.get("/refetch", async (req,res)=>{


    console.log("refetch hit")

    const token=req.cookies.token

      try{

        jwt.verify(token, "nvyjfu896hgf76"  ,{},async (err,data)=>{
            if(err){
                return res.status(404).json(err)
            }
            res.status(200).json(data)
        })

      }catch(err){
        res.status(500).json(err)
      }

 
})



module.exports=router
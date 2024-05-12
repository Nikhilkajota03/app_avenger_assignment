import { Link, useLocation } from "react-router-dom"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext"
import axios from "axios"
import { URL } from "../url"
import HomePosts from "../components/HomePosts"
import Loader from "../components/Loader"
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");


const MyBlogs = () => {
    const {search}=useLocation()
  // console.log(search)
  const [posts,setPosts]=useState([])
  const [noResults,setNoResults]=useState(false)
  const [loader,setLoader]=useState(false)
  const {user}=useContext(UserContext)
  // console.log(user)




  const handleCreatee = async () => {
    // Prevent default form submission behavior
     socket.emit("give user post" ,  user._id );
 };

 

 socket.on("take user post" , (data) => {

  setPosts(data)
      if(data.length===0){
        setNoResults(true)
      }
      else{
        setNoResults(false)
      }
      setLoader(false)

       console.log("post detail data"  , data)

});




  useEffect(()=>{
    handleCreatee()
  },[search])

  return (
    <div>

      {/* <button onClick={handleCreatee}>fsfsfs</button> */}
        <Navbar/>
        <div className="px-8 md:px-[200px] min-h-[80vh]">
        {loader?<div className="h-[40vh] flex justify-center items-center"><Loader/></div>:!noResults?
        posts.map((post)=>(
          <>
          <Link to={user?`/posts/post/${post._id}`:"/login"}>
          <HomePosts key={post._id} post={post}/>
          </Link>
          </>
          
        )):<h3 className="text-center font-bold mt-16">No posts available</h3>}
        </div>
        <Footer/>
    </div>
  )
}

export default MyBlogs
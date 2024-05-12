import axios from "axios"
import Footer from "../components/Footer"
import HomePosts from "../components/HomePosts"
import Navbar from "../components/Navbar"
import { IF, URL } from "../url"
import { useContext, useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Loader from '../components/Loader'
import { UserContext } from "../context/UserContext"
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");
 

const Home = () => {
  
  const {search}=useLocation()
  // console.log(search)
  const [posts,setPosts]=useState([])
  const [noResults,setNoResults]=useState(false)
  const [loader,setLoader]=useState(false)
  const {user}=useContext(UserContext)



  useEffect(()=>{
    handleCreatee()

  },[search])


  const handleCreatee = async () => {
   // Prevent default form submission behavior
    socket.emit("give search  post" ,  search );
};


socket.on("take post data" , (data)=>{


  console.log( "post data" ,  data)

  setPosts(data)
      if(data.length===0){
        setNoResults(true)
      }
      else{
        setNoResults(false)
      }

      setLoader(false)
} )



  return (
    
    <>
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
    </>
    
  )
}

export default Home
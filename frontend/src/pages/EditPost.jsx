import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ImCross } from "react-icons/im";
import axios from "axios";
import { URL } from "../url";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");

const EditPost = () => {
  const postId = useParams().id;
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState("");
  const [cats, setCats] = useState([]);

  const editPost = async (title, desc, categories) => {
    const formData = new FormData();
    if (file) {
      const filename = Date.now() + file.name;
      formData.append("img", filename);
      formData.append("file", file);
    }

    const messageData = {
      title,
      desc,
      username: user.username,
      userId: user._id,
      categories,
      photo: file ? Date.now() + file.name : undefined,
    };

    if (file) {
      await axios.post(`http://localhost:5000/api/upload`, formData);
    }

    console.log("Sending message:", { messageData, postId });
    socket.emit("send updated message", { messageData, postId });
  };

  //   socket.on("Post updated", () => {
  //     // Update postData with the received data

  //      navigate("/")

  // });

  const handleCreatee = async () => {
    navigate("/");
  };



  const handleCreateett = async () => {
    // Prevent default form submission behavior
    socket.emit("give detail post", postId);
  };

  socket.on("take post details", (data) => {
    setTitle(data.title);
    setDesc(data.desc);
    setFile(data.photo);
    setCats(data.categories);

    console.log("post detail data", data);
  });










  useEffect(() => {
    handleCreateett();
  }, [postId]);



  const addCategory = () => {
    let updatedCats = [...cats];
    updatedCats.push(cat);
    setCat("");
    setCats(updatedCats);
  };

  return (
    <div>
      <Navbar />

      <div className="px-6 md:px-[200px] mt-8">
        <h1 className="font-bold md:text-2xl text-xl ">Update a post</h1>
        <form className="w-full flex flex-col space-y-4 md:space-y-8 mt-4">
          <input
            onChange={(e) => {
              setTitle(e.target.value);
              setTimeout(() => {
                editPost(e.target.value, desc, cats);
              }, 1000);
            }}
            value={title}
            type="text"
            placeholder="Enter post title"
            className="px-4 py-2 outline-none"
          />
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            className="px-4"
          />
          <div className="flex flex-col">
            <div className="flex items-center space-x-4 md:space-x-8">
              <input
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="px-4 py-2 outline-none"
                placeholder="Enter post category"
                type="text"
              />
              <div
                onClick={addCategory}
                className="bg-black text-white px-4 py-2 font-semibold cursor-pointer"
              >
                Add
              </div>
            </div>

            {/* categories */}
            <div className="flex px-4 mt-3">
              {cats?.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-center items-center space-x-2 mr-4 bg-gray-200 px-2 py-1 rounded-md"
                >
                  <p>{c}</p>
                  <p
                    onClick={() => {
                      let updatedCats = [...cats];
                      updatedCats.splice(i, 1);
                      setCats(updatedCats);
                    }}
                    className="text-white bg-black rounded-full cursor-pointer p-1 text-sm"
                  >
                    <ImCross />
                  </p>
                </div>
              ))}
            </div>
          </div>
          <textarea
            onChange={(e) => {
              setDesc(e.target.value);
              editPost(title, e.target.value, cats);
            }}
            value={desc}
            rows={15}
            cols={30}
            className="px-4 py-2 outline-none"
            placeholder="Enter post description"
          />
          <button
            onClick={handleCreatee}
            className="bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-2 md:text-xl text-lg"
          >
            Update
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditPost;

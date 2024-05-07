import React, { useState,useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Stars from "../components/Stars/Stars";
import { io } from "socket.io-client";
import ACTIONS from "../Actions";
import rug from 'random-username-generator';
export default function Home() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [interest, setInterests] = useState("");
  
  const [socket, setSocket] = useState(null); // Define socket state
  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io(process.env.REACT_APP_BACKEND_URL);
    setSocket(socket); // Save the socket instance to state

    // Listen for the "navigate-to-chat" event from the server
    socket.on(ACTIONS.NAVIGATE_CHAT, ({ roomId }) => {
      // Redirect users to the chat room with the provided roomId
      navigate(`/chat/${roomId}`, {
        state: {
          username,
        },
      });
    });

    // Clean up event listener when the component unmounts
    return () => {
      socket.off("navigate-to-chat");
      socket.disconnect();
    };
  }, [navigate, username]);
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    const name=rug.generate();
    setUsername(name);
    toast.success("Generated random username");
  };

  const joinRoom = () => {
    if (!username) {
      toast.error("ROOM ID & username is required");
      return;
    }

    // Redirect
    // navigate(`/chat/${roomId}`, {
    //   state: {
    //     username,
    //   },
    // });
  };
  const matchUsers = () => {
    if (!username) {
      toast.error("Please enter a username");
      return;
    }
    
    socket.emit(ACTIONS.MATCH_USERS, { username });
  };
  // useEffect(() => {
  //   // Listen for the "navigate-to-chat" event from the server
  //   socket.on("navigate-to-chat", ({ roomId }) => {
  //     // Redirect users to the chat room with the provided roomId
  //     navigate(`/chat/${roomId}`, {
  //       state: {
  //         username,
  //       },
  //     });
  //   });
  
  //   // Clean up event listener when the component unmounts
  //   return () => {
  //     socket.off("navigate-to-chat");
  //   };
  // }, []); // Empty dependency array to run only once on component mount
  

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <>
      <div className="bg-black h-[100vh] w-[100vw]">
        <Stars />

        <div className="flex flex-col items-center h-[90vh] justify-center">
          <div className="mb-4">
              <p className="text-6xl text-center font-bold font-halloween text-white">
                0XCONNECT
              </p>
          </div>
          <div className="bg-gray-800 px-5 py-10 rounded-xl w-[25rem]">
            <form className="flex flex-col items-center">
              <div className="w-full">
                <input
                  type="text"
                  onChange={(e) => setRoomId(e.target.value)}
                  className="rounded-md text-2xl font-halloween outline-none p-2 w-full"
                  placeholder="Enter Interests"
                  value={""}
                  onKeyUp={handleInputEnter}
                  required
                />
              </div>
              <div className="mt-4 w-full">
                <input
                  type="text"
                  // ssjsf
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-md text-2xl font-halloween outline-none p-2 w-full"
                  placeholder="Enter Display Name"
                  value={username}
                  onKeyUp={handleInputEnter}
                  required
                />
              </div>
              <div className="w-full">
                <button
                  onClick={matchUsers}
                  className=" w-full border text-4xl font-halloween border-white text-xl hover:bg-gray-600 text-white px-10 py-3 mt-8"
                >
                  Start Chat
                </button>
              </div>
            </form>
            <div className="text-white font-halloween text-2xl text-center mt-4">
              <p>
                Don't want to reveal you real name ?{" "}
                <span
                  onClick={createNewRoom}
                  className="text-red-300 font-bold cursor-pointer"
                >
                  Generate a random username
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
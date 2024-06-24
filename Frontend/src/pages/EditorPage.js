import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Client from "../components/Client";
import ACTIONS from "../Actions";
import { initSocket } from "../socket";
import ChatArea from "../components/ChatArea";
import Stars from "../components/Stars/Stars";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);


  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));
      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          console.log(location.state?.interests);
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          setOnlineUsersCount(clients.length);
        }
      );      // Listening for user changes
    

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
        setOnlineUsersCount((prevCount) => prevCount - 1);
      });
    };
    init();
    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    };
  }, []);

  function leaveRoom() {
    reactNavigator("/");
  }
  function nextChat() {
    const { username, interests } = location.state;
    console.log(`printing`);
    console.log(username);
    console.log(interests);
    
  }
  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="">
      <Stars />
      <div className="flex items-right justify-evenly pt-4 text-white text-2xl">
        <div className="font-halloween mx-2">
          <span className="text-red-400">Users:{onlineUsersCount}</span>
        </div>
        <div>
          <button
            id="leave-room-button" // Add id attribute here
            onClick={leaveRoom}
            className="text-red-400 border px-8 py-1 font-halloween"
          >
            Leave
          </button>
        </div>
        <div>
          <button
            id="next-chat-button"
            onClick={nextChat}
            className="text-blue-400 border px-8 py-1 font-halloween"
          >
            Next
          </button>
        </div>
      <div className="editorWrap">
        <ChatArea
          socketRef={socketRef}
          roomId={roomId}
          currentUsername={location.state?.username}
          clients={clients}
        />
      </div>
      </div>
      </div>
  );
};

export default EditorPage;
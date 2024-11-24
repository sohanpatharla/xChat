
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Client from "../components/Client";
import ACTIONS from "../Actions";
//import { initSocket,disconnectSocket } from "../socket";
import { socketService } from "../services/socketService";  
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
       // Use existing socket if passed through navigation state
    //    if (location.state?.socketInstance) {
    //     socketRef.current = location.state.socketInstance;
    // } else {
    //     socketRef.current = await initSocket();
    // }
    socketRef.current = socketService.getSocket();

      // socketRef.current = await initSocket();
      // socketRef.current.on("connect_error", (err) => handleErrors(err));
      // socketRef.current.on("connect_failed", (err) => handleErrors(err));
      // function handleErrors(e) {
      //   console.log("socket error", e);
      //   toast.error("Socket connection failed, try again later.");
      //   reactNavigator("/");
      // }

      socketRef.current.on('connect', () => {
        console.log('Socket connected in EditorPage');
        // Join new room
        socketService.joinRoom(roomId);
        // Join room after confirming connection
        socketRef.current.emit(ACTIONS.JOIN, {
            roomId,
            username: location.state?.username,
        });
    });

      // socketRef.current.emit(ACTIONS.JOIN, {
      //   roomId,
      //   username: location.state?.username,
      // });

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
          console.log("socket error", e);
          toast.error("Socket connection failed, try again later.");
          socketService.disconnect(); // Disconnect on error
          reactNavigator("/");
      }

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
      );    
    

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
          // Leave current room before navigating
          socketService.leaveRoom();
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
        setOnlineUsersCount((prevCount) => prevCount - 1);
      });

        // Listening for navigation to the new chat room
        // socketRef.current.on(ACTIONS.NAVIGATE_CHAT, ({ roomId }) => {
        //   reactNavigator(`/chat/${roomId}`, {
        //     state: {
        //       username: location.state?.username,
        //       interests: location.state?.interests,
        //     },
        //   });
        // });
        //};

      // Handle navigation to the next chat room
      socketRef.current.on(ACTIONS.NAVIGATE_CHAT, ({ roomId }) => {
        toast.success("Navigating to the next chat...");
         // Leave current room before navigating
         socketService.leaveRoom();
        reactNavigator(`/chat/${roomId}`, {
          state: {
            username: location.state?.username,
            interests: location.state?.interests,
          },
        });
      });
    };
    init();

    //Cleanup function
    return () => {
      socketService.leaveRoom(); // Leave room when component unmounts
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.NAVIGATE_CHAT);
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('connect_failed');
        // // Only disconnect if navigating away from chat completely
        // if (!location.state?.socketInstance) {
        //     socketRef.current.disconnect();
        // }
    }
      // socketRef.current.off(ACTIONS.JOINED);
      // socketRef.current.off(ACTIONS.DISCONNECTED);
      // //socketRef.current.off(ACTIONS.NAVIGATE_CHAT);
      // socketRef.current.disconnect();
    };
  }, [location.state, roomId,reactNavigator]);

  function leaveRoom() {
    socketService.disconnect();
    reactNavigator("/");
  }
  // function nextChat() {
  //   const { username, interests } = location.state;
  //   console.log(`printing`);
  //   console.log(username);
  //   console.log(interests);
  //   if (socketRef.current) {
  //     socketRef.current.emit(ACTIONS.NEXT_CHAT, { username, interests });
  //   }
    
  // }
  function nextChat() {
    const { username, interests } = location.state;
    console.log(`Searching for the username:${username} with the interests:${interests}`);
    console.log(socketRef.current);

    if (socketRef.current?.connected) {
       // Leave current room before searching for next
      socketService.leaveRoom();
      socketRef.current.emit(ACTIONS.NEXT_CHAT, { username, interests });
      toast("Searching for the next chat...");
  } else {
      toast.error("Socket connection lost. Trying to reconnect...");
      socketRef.current = socketService.connect();
      // Wait for reconnection before trying to emit
      socketRef.current.once('connect', () => {
          socketRef.current.emit(ACTIONS.NEXT_CHAT, { username, interests });
          toast("Searching for the next chat...");
      });
  }
    
    // if (socketRef.current) {
    //   socketRef.current.emit(ACTIONS.NEXT_CHAT, { username, interests });
    //   toast("Searching for the next chat...");
    // }
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
// import React, { useState, useRef, useEffect } from "react";
// import toast from "react-hot-toast";
// import Client from "../components/Client";
// import ACTIONS from "../Actions";
// import { initSocket } from "../socket";
// import ChatArea from "../components/ChatArea";
// import Stars from "../components/Stars/Stars";
// import {
//   useLocation,
//   useNavigate,
//   Navigate,
//   useParams,
// } from "react-router-dom";

// const EditorPage = () => {
//   const [clients, setClients] = useState([]);
//   const socketRef = useRef(null);
//   const location = useLocation();
//   const { roomId } = useParams();
//   const reactNavigator = useNavigate();
//   const [onlineUsersCount, setOnlineUsersCount] = useState(0);

//   useEffect(() => {
//     const init = async () => {
//       socketRef.current = await initSocket();
//       socketRef.current.on("connect_error", (err) => handleErrors(err));
//       socketRef.current.on("connect_failed", (err) => handleErrors(err));

//       function handleErrors(e) {
//         console.error("Socket error", e);
//         toast.error("Socket connection failed, try again later.");
//         reactNavigator("/");
//       }

//       socketRef.current.emit(ACTIONS.JOIN, {
//         roomId,
//         username: location.state?.username,
//       });

//       socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
//         if (username !== location.state?.username) {
//           toast.success(`${username} joined the room.`);
//         }
//         setClients(clients);
//         setOnlineUsersCount(clients.length);
//       });

//       socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
//         toast.success(`${username} left the room.`);
//         setClients((prev) => prev.filter((client) => client.socketId !== socketId));
//         setOnlineUsersCount((prevCount) => prevCount - 1);
//       });

//       socketRef.current.on(ACTIONS.NAVIGATE_CHAT, ({ roomId }) => {
//         toast.success("Navigating to the next chat...");
//         reactNavigator(`/chat/${roomId}`, {
//           state: {
//             username: location.state?.username,
//             interests: location.state?.interests,
//           },
//         });
//       });
//     };

//     init();

//     return () => {
//       socketRef.current.off(ACTIONS.JOINED);
//       socketRef.current.off(ACTIONS.DISCONNECTED);
//       socketRef.current.disconnect();
//     };
//   }, []);

//   const leaveRoom = () => {
//     reactNavigator("/");
//   };

//   const nextChat = () => {
//     const { username, interests } = location.state;
//     console.log(`Searching for the next chat for username: ${username} with interests: ${interests}`);

//     if (socketRef.current) {
//       socketRef.current.emit(ACTIONS.NEXT_CHAT, { username, interests });
//       toast("Searching for the next chat...");
//     }
//   };

//   if (!location.state) {
//     return <Navigate to="/" />;
//   }

//   return (
//     <div className="editorPage">
//       <Stars />
//       <div className="flex items-center justify-evenly pt-4 text-white text-2xl">
//         <div className="font-halloween mx-2">
//           <span className="text-red-400">Users: {onlineUsersCount}</span>
//         </div>
//         <div>
//           <button
//             id="leave-room-button"
//             onClick={leaveRoom}
//             className="text-red-400 border px-8 py-1 font-halloween"
//           >
//             Leave
//           </button>
//         </div>
//         <div>
//           <button
//             id="next-chat-button"
//             onClick={nextChat}
//             className="text-blue-400 border px-8 py-1 font-halloween"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       <div className="editorWrap">
//         <ChatArea
//           socketRef={socketRef}
//           roomId={roomId}
//           currentUsername={location.state?.username}
//           clients={clients}
//         />
//       </div>
//     </div>
//   );
// };

// export default EditorPage;

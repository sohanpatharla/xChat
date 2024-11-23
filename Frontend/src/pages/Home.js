import React, { useState, useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Stars from "../components/Stars/Stars";
import { io } from "socket.io-client";
import ACTIONS from "../Actions";
import rug from "random-username-generator";

export default function Home() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [interests,setInterests]=useState([]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_URL);
    setSocket(socket);

    socket.on(ACTIONS.NAVIGATE_CHAT, ({ roomId }) => {
      setLoading(false);
      navigate(`/chat/${roomId}`, {
        state: {
          username,
          interests,
        },
      });
    });

    return () => {
      socket.off("navigate-to-chat");
      socket.disconnect();
    };
  }, [navigate, username,interests]);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    const name = rug.generate();
    setUsername(name);
    toast.success("Generated random username");
  };

  const joinRoom = () => {
    if (!username) {
      toast.error("ROOM ID & username is required");
      return;
    }
  };

  // const matchUsers = () => {
  //   if (!username || !interest) {
  //     toast.error("Please enter a username and interests");
  //     return;
  //   }
  //   setLoading(true);
  //   console.log(interests);
  //   socket.emit(ACTIONS.MATCH_USERS, { username, interests: interest.split(",") });
  // };
  const matchUsers = () => {
    if (!username || !interest) {
      toast.error("Please enter a username and interests");
      return;
    }
    setLoading(true);
    const formattedInterests = interest.split(",").map((int) => int.trim().toLowerCase());
    socket.emit(ACTIONS.MATCH_USERS, { username, interests: formattedInterests });
  };
  

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      matchUsers();
    }
  };

  return (
    <>
      <div className="bg-black h-[100vh] w-[100vw]">
        <Stars />

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <p className="text-4xl font-halloween animate-pulse">Searching for your cosmic connection...</p>
            <p className="text-2xl mt-4 font-halloween">The stars are aligning, just for you.</p>
          </div>
        ) : (
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
                    onChange={(e) => {
  const input = e.target.value.trim();
  setInterest(input);
  setInterests(input.split(",").map((interest) => interest.trim().toLowerCase()));
}}
                    className="rounded-md text-2xl font-halloween outline-none p-2 w-full"
                    placeholder="Enter Interests (comma separated)"
                    value={interest}
                    onKeyUp={handleInputEnter}
                    required
                  />
                </div>
                <div className="mt-4 w-full">
                  <input
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-md text-2xl font-halloween outline-none p-2 w-full"
                    placeholder="Enter Display Name"
                    value={username}
                    onKeyUp={handleInputEnter}
                    required
                  />
                </div>
              </form>
              <div className="w-full">
                <button
                  onClick={matchUsers}
                  className="w-full border text-4xl font-halloween border-white text-xl hover:bg-gray-600 text-white px-10 py-3 mt-8"
                >
                  Start Chat
                </button>
              </div>
              <div className="text-white font-halloween text-2xl text-center mt-4">
                <p>
                  Don't want to reveal your real name?{" "}
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
        )}
      </div>
    </>
  );
}
// import React, { useState, useEffect } from "react";
// import { v4 as uuidV4 } from "uuid";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import Stars from "../components/Stars/Stars";
// import { io } from "socket.io-client";
// import ACTIONS from "../Actions";
// import rug from "random-username-generator";

// export default function Home() {
//   const navigate = useNavigate();

//   const [roomId, setRoomId] = useState("");
//   const [username, setUsername] = useState("");
//   const [interest, setInterest] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const [interests, setInterests] = useState([]);

//   // Initialize socket and setup navigation handling
//   useEffect(() => {
//     const socket = io(process.env.REACT_APP_BACKEND_URL);
//     setSocket(socket);

//     socket.on(ACTIONS.NAVIGATE_CHAT, ({ roomId }) => {
//       setLoading(false);
//       navigate(`/chat/${roomId}`, {
//         state: {
//           username,
//           interests,
//         },
//       });
//     });

//     return () => {
//       socket.off(ACTIONS.NAVIGATE_CHAT);
//       socket.disconnect();
//     };
//   }, [navigate, username, interests]);

//   // Generate random username
//   const createNewRoom = (e) => {
//     e.preventDefault();
//     const id = uuidV4();
//     const name = rug.generate();
//     setUsername(name);
//     toast.success("Generated random username");
//   };

//   // Match users based on interests
//   const matchUsers = () => {
//     if (!username || !interest) {
//       toast.error("Please enter a username and interests");
//       return;
//     }
//     setLoading(true);
//     const formattedInterests = interest.split(",").map((int) => int.trim().toLowerCase());
//     setInterests(formattedInterests);
//     socket.emit(ACTIONS.MATCH_USERS, { username, interests: formattedInterests });
//   };

//   // Handle "Enter" key to trigger matching
//   const handleInputEnter = (e) => {
//     if (e.code === "Enter") {
//       matchUsers();
//     }
//   };

//   return (
//     <>
//       <div className="bg-black h-[100vh] w-[100vw]">
//         <Stars />

//         {loading ? (
//           <div className="flex flex-col items-center justify-center h-full text-white">
//             <p className="text-4xl font-halloween animate-pulse">Searching for your cosmic connection...</p>
//             <p className="text-2xl mt-4 font-halloween">The stars are aligning, just for you.</p>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center h-[90vh] justify-center">
//             <div className="mb-4">
//               <p className="text-6xl text-center font-bold font-halloween text-white">
//                 0XCONNECT
//               </p>
//             </div>
//             <div className="bg-gray-800 px-5 py-10 rounded-xl w-[25rem]">
//               <form className="flex flex-col items-center">
//                 <div className="w-full">
//                   <input
//                     type="text"
//                     onChange={(e) => {
//                       const input = e.target.value.trim();
//                       setInterest(input);
//                       setInterests(input.split(",").map((int) => int.trim().toLowerCase()));
//                     }}
//                     className="rounded-md text-2xl font-halloween outline-none p-2 w-full"
//                     placeholder="Enter Interests (comma separated)"
//                     value={interest}
//                     onKeyUp={handleInputEnter}
//                     required
//                   />
//                 </div>
//                 <div className="mt-4 w-full">
//                   <input
//                     type="text"
//                     onChange={(e) => setUsername(e.target.value)}
//                     className="rounded-md text-2xl font-halloween outline-none p-2 w-full"
//                     placeholder="Enter Display Name"
//                     value={username}
//                     onKeyUp={handleInputEnter}
//                     required
//                   />
//                 </div>
//               </form>
//               <div className="w-full">
//                 <button
//                   onClick={matchUsers}
//                   className="w-full border text-4xl font-halloween border-white text-xl hover:bg-gray-600 text-white px-10 py-3 mt-8"
//                 >
//                   Start Chat
//                 </button>
//               </div>
//               <div className="text-white font-halloween text-2xl text-center mt-4">
//                 <p>
//                   Don't want to reveal your real name?{" "}
//                   <span
//                     onClick={createNewRoom}
//                     className="text-red-300 font-bold cursor-pointer"
//                   >
//                     Generate a random username
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }


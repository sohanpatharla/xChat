// import React from "react";
import { Link } from "react-router-dom";
import React from "react";
import Stars from "../components/Stars/Stars";
import Typewriter from "typewriter-effect";
import ParticlesComponent from "../components/ParticlesComponent";
import '../components/ParticlesComponent.css'

export default function GetstartedPage() {
  return (
    <>
      <div className="w-[100vw] h-[100vh]">
        <ParticlesComponent id='particles'/>
        <div className="flex flex-col items-center h-[90vh] justify-center">
          <p className="text-8xl font-bold font-halloween text-white">
            0XCONNECT
          </p>
          <div className="text-white font-halloween text-2xl">
          <Typewriter
          options = {{
            strings:"For hearts afar and near, we unite destinies. Welcome to our platform, where connections transcend distance.",
            autoStart: true,
            loop:false,
            typeSpeed:100
          }}
           />
           {/* <Typewriter
          options = {{
            strings:"Bringing together hearts that perceive distance nearby, and bridging the chasm for those afar, behold the epic saga of connection on our platform, akin to the dance of destiny itself.",
            autoStart: true,
            loop:true,
            typeSpeed: 50, 
          }}
           /> */}
           </div>
          {/* <p className="text-3xl font-halloween text-white">
            A collaborative code-editor
          </p> */}
          <Link to="/room">
            <button className="border border-white font-bold text-xl hover:bg-gray-800 text-white px-8 py-3 mt-8">
              Get started
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
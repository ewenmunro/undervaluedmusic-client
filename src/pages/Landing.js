import React from "react";

// assets/styles
import "../assets/styles/home.css";

// components/music
import MusicListLanding from "../components/music/MusicListLanding";

// components/promo
import Promo from "../components/promo/Promo";

function Landing() {
  return (
    <div className="home">
      <h1>The Music List</h1>
      <Promo />
      <MusicListLanding />
    </div>
  );
}

export default Landing;

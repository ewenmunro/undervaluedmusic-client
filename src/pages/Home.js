import React from "react";
import "../assets/styles/home.css";

// components/music
import MusicList from "../components/music/MusicList";

// components/promo
import Promo from "../components/promo/Promo";

function Home() {
  return (
    <div className="home">
      <h1>The Music List</h1>
      <Promo />
      <MusicList />
    </div>
  );
}

export default Home;

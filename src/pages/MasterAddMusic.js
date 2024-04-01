import React, { useState } from "react";
import "../assets/styles/masteraddmusic.css";

// components/auth
import MasterAddMusicForm from "../components/music/MasterAddMusicForm";

function MasterAddMusic() {
  // Define your music state or fetch it as needed
  const [music, setMusic] = useState([]);

  // Function to add a music to the list
  const handleAddMusic = (newMusic) => {
    setMusic([...music, newMusic]);
  };

  return (
    <div className="addmusic">
      <h1>Add Music</h1>
      <MasterAddMusicForm onAddMusic={handleAddMusic} />
    </div>
  );
}

export default MasterAddMusic;

import React, { useState } from "react";
import "../assets/styles/addmusic.css";

// components/auth
import AddMusicForm from "../components/music/AddMusicForm";

function AddMusic() {
  // Define your music state or fetch it as needed
  const [music, setMusic] = useState([]);

  // Function to add a music to the list
  const handleAddMusic = (newMusic) => {
    setMusic([...music, newMusic]);
  };

  return (
    <div className="addmusic">
      <h1>Add Music</h1>
      {/* Message for when I need to disable the Add Music button */}
      {/* <p>Note: I've had to disable the Add Music button because...</p> */}
      {/* Add additional <p></p> message to let users know that they can send me music to be added to The Music List by subscribing to my newsletter and sending them via a chat */}
      <AddMusicForm onAddMusic={handleAddMusic} />
    </div>
  );
}

export default AddMusic;

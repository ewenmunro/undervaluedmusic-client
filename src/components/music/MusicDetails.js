import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// assets/styles
import "../../assets/styles/musicdetails.css";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const MusicDetails = () => {
  const { musicDetails } = useParams();
  const [music, setMusic] = useState(null);

  useEffect(() => {
    const fetchMusicDetails = async () => {
      try {
        // Extract the title
        let title = musicDetails;

        // Replace each '-' with a space
        title = title
          .replace(/-/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Make an API request to fetch music details based on title and artist
        const response = await axios.get(
          `${apiBaseUrl}/api/music/musicdetails`,
          {
            params: {
              title,
            },
          }
        );

        setMusic(response.data.music);
      } catch (error) {
        console.error("Failed to fetch music details:", error);
      }
    };

    fetchMusicDetails();
  }, [musicDetails]);

  // Check if music is defined
  if (!music) {
    // Handle the case where music is not available
    return (
      <div>
        <p className="music-details-error-message">
          Error: Music details not available.
        </p>
      </div>
    );
  }

  const listen = (music) => {
    // Check if there's a valid link in the database for this music
    if (music.listen_link) {
      // Make a request to generate a temporary identifier for a logged-out user
      axios
        .get(`${apiBaseUrl}/api/listen/generatetempid`)
        .then((response) => {
          // Retrieve temporary user id from backend
          const temporaryUserId = response.data.temporaryUserId;

          // Open the music link in a new tab
          window.open(music.listen_link, "_blank");

          // Make an API request to log the click
          axios.post(`${apiBaseUrl}/api/listen/click`, {
            user_id: temporaryUserId,
            music_id: music.music_id,
          });
        })
        .catch((error) => {
          console.error("Failed to generate a temporary identifier:", error);
        });
    }
  };

  const copyMusicURL = () => {
    const musicURL = window.location.href;
    navigator.clipboard.writeText(musicURL).then(() => {
      const customAlert = document.querySelector(".custom-alert");
      customAlert.textContent = `${music.title} URL copied to clipboard!`;
      customAlert.style.display = "block";

      // Hide the alert after a delay (e.g., 3 seconds)
      setTimeout(() => {
        customAlert.style.display = "none";
      }, 3000);
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this music: ${music.title}`);
    const body = encodeURIComponent(
      `I thought you might enjoy this piece of music: ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareOnFacebook = () => {
    const shareText = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}&quote=${shareText}`;
    window.open(shareURL, "_blank");
  };

  const shareOnTwitter = () => {
    const shareText = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const shareURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(shareURL, "_blank");
  };

  return (
    <div className="music-details">
      <h1>{music.title}</h1>
      <p>
        <b>Album:</b> {music.album}
      </p>
      <p>
        <b>Artist:</b> {music.artist}
      </p>
      <p>
        *Disclaimer: If the <b>Listen</b> button is available and goes to
        Amazon, then it is an affiliate link. <i>Undervalued Music</i> will make
        a commission on the sale you make through the link. It is no extra cost
        to you to use the link, it's simply another way to support{" "}
        <i>Undervalued Music</i>.
      </p>
      <p>
        <b>*Listen:</b>
      </p>
      {music.listen_link ? (
        <button
          className="music-details-listen-button"
          onClick={() => listen(music)}
        >
          Listen
        </button>
      ) : (
        <button className="music-details-music-details-disable" disabled>
          Link Not Available
        </button>
      )}
      <p>
        <b>Share Music:</b>
      </p>
      <div className="music-details-share-buttons">
        <button className="music-details-copy-button" onClick={copyMusicURL}>
          Copy URL
        </button>
        <button className="music-details-email-button" onClick={shareViaEmail}>
          Share via Email
        </button>
        <button className="music-details-fb-button" onClick={shareOnFacebook}>
          Share on FB
        </button>
        <button
          className="music-details-twitter-button"
          onClick={shareOnTwitter}
        >
          Share on X
        </button>
      </div>
      <div className="custom-alert"></div>
    </div>
  );
};

export default MusicDetails;

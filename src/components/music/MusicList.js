import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// assets/styles
import "../../assets/styles/musiclist.css";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function MusicList() {
  const [music, setMusic] = useState([]);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Use the useNavigate hook from 'react-router-dom'
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch music data from the server
    const fetchMusic = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/music/allmusic`);
        const musicData = response.data.music;

        // Calculate weighted scores for each music
        const musicWithScores = await Promise.all(
          musicData.map(async (music) => {
            const weightedScore = await calculateWeightedScore(music);
            return { music, weightedScore };
          })
        );

        // Sort music based on weighted scores
        const sortedMusic = musicWithScores.sort(
          (a, b) => b.weightedScore - a.weightedScore
        );

        setMusic(sortedMusic.map((item) => item.music));
        setError(null);
      } catch (error) {
        console.error("Failed to fetch music:", error);
        setError("Failed to fetch music. Please try again later.");
      }
    };

    // Call the function to fetch and sort music when the component mounts
    fetchMusic();
  }, []);

  const calculateWeightedScore = async (music) => {
    try {
      // All declarations for The Music List Algorithm
      let notHeardBeforeCount;
      let haveHeardBeforeNotRatedCount;
      let ratingCount;
      const highestScore = 10;
      let usersTotalScore;

      // Retrieve all the users who have not heard of the music before
      try {
        const response = await axios.get(
          `${apiBaseUrl}/api/mentions/not-heard-before-count`,
          {
            params: {
              music_id: music.music_id,
            },
          }
        );

        notHeardBeforeCount = response.data.count;
      } catch (error) {
        console.error("Error fetching not heard before count:", error);
        throw error;
      }

      // Retrieve all the users who have heard of the music but haven't rated it
      try {
        const responseNotRated = await axios.get(
          `${apiBaseUrl}/api/mentions/heard-not-rated-count`,
          {
            params: {
              music_id: music.music_id,
            },
          }
        );

        haveHeardBeforeNotRatedCount = responseNotRated.data.count;
      } catch (error) {
        console.error("Error fetching heard-not-rated count:", error);
        throw error;
      }

      // Retrieve all the users who have rated the music
      try {
        // Fetch the count of ratings for the music
        const response = await axios.get(
          `${apiBaseUrl}/api/ratings/rating-count`,
          {
            params: {
              music_id: music.music_id,
            },
          }
        );

        ratingCount = response.data.count;
      } catch (error) {
        console.error("Error fetching rating count:", error);
        throw error;
      }

      // Retrieve all the users who have rated the music
      try {
        const response = await axios.get(
          `${apiBaseUrl}/api/ratings/sum-total`,
          {
            params: {
              music_id: music.music_id,
            },
          }
        );

        usersTotalScore = response.data.sum_total;
      } catch (error) {
        console.error("Error fetching rating sum total:", error);
        throw error;
      }

      // THE MUSIC LIST ALGORITH
      const denominator =
        Number(notHeardBeforeCount) +
        Number(haveHeardBeforeNotRatedCount) +
        Number(ratingCount);

      const weightedScore =
        denominator !== 0
          ? ((Number(notHeardBeforeCount) / denominator) * 100 +
              (Number(usersTotalScore) /
                (Number(highestScore) * Number(ratingCount)) /
                Number(ratingCount)) *
                100) /
            2
          : 0;

      return weightedScore;
    } catch (error) {
      console.error("Error calculating weighted score:", error);
      return 0;
    }
  };

  // Function to open music details modal
  const openMusicDetails = (music) => {
    // Construct the URL based on music title
    const urlTitle = music.title.replace(/\s+/g, "-").toLowerCase();
    const musicDetails = `${urlTitle}`;
    const musicUrl = `/music/${musicDetails}`;

    // Pass the music as state to the MusicDetails component
    navigate(musicUrl, { state: { music } });
  };

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

  const openSharePopup = (music) => {
    // Create a modal/pop-up for share options
    const modal = document.createElement("div");
    modal.className = "share-modal";

    // Close button for the modal
    const closeButton = document.createElement("span");
    closeButton.className = "close-button";
    closeButton.textContent = "✖️";
    closeButton.addEventListener("click", () => {
      modal.remove(); // Close the modal when clicking the close button
    });

    // Share options content
    const shareContent = document.createElement("div");
    shareContent.className = "share-content";

    const shareTitle = document.createElement("h1");
    shareTitle.textContent = `Share ${music.title}:`;

    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.textContent = "Copy URL";
    copyButton.addEventListener("click", () => copyMusicURL(music));

    const emailButton = document.createElement("button");
    emailButton.className = "email-button";
    emailButton.textContent = "Share via Email";
    emailButton.addEventListener("click", () => shareViaEmail(music));

    const fbButton = document.createElement("button");
    fbButton.className = "fb-button";
    fbButton.textContent = "Share on FB";
    fbButton.addEventListener("click", () => shareOnFacebook(music));

    const twitterButton = document.createElement("button");
    twitterButton.className = "twitter-button";
    twitterButton.textContent = "Share on X";
    twitterButton.addEventListener("click", () => shareOnTwitter(music));

    // Apply margin to buttons
    [copyButton, emailButton, fbButton, twitterButton].forEach((button) => {
      button.style.marginRight = "10px";
    });

    // Append elements to the modal
    shareContent.appendChild(shareTitle);
    shareContent.appendChild(copyButton);
    shareContent.appendChild(emailButton);
    shareContent.appendChild(fbButton);
    shareContent.appendChild(twitterButton);

    modal.appendChild(closeButton);
    modal.appendChild(shareContent);

    // Append the modal to the document body
    document.body.appendChild(modal);
  };

  const copyMusicURL = (music) => {
    const titleWithHyphens = music.title.toLowerCase().replace(/\s+/g, "-");
    const musicURL = `undervaluedmusic.com/music/${titleWithHyphens}`;

    navigator.clipboard.writeText(musicURL).then(() => {
      const customAlert = document.querySelector(".custom-alert");

      if (customAlert) {
        customAlert.textContent = `${music.title} URL copied to clipboard!`;
        customAlert.style.display = "block";

        // Hide the alert after a delay (e.g., 3 seconds)
        setTimeout(() => {
          customAlert.style.display = "none";
        }, 3000);
      }
    });
  };

  const shareViaEmail = (music) => {
    const titleWithHyphens = music.title.toLowerCase().replace(/\s+/g, "-");
    const subject = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const body = encodeURIComponent(
      `I thought you might enjoy this piece of music: undervaluedmusic.com/music/${titleWithHyphens}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareOnFacebook = (music) => {
    const titleWithHyphens = music.title.toLowerCase().replace(/\s+/g, "-");
    const shareText = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      `undervaluedmusic.com/music/${titleWithHyphens}`
    )}&quote=${shareText}`;
    window.open(shareURL, "_blank");
  };

  const shareOnTwitter = (music) => {
    const titleWithHyphens = music.title.toLowerCase().replace(/\s+/g, "-");
    const shareText = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const shareURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(
      `undervaluedmusic.com/music/${titleWithHyphens}`
    )}`;
    window.open(shareURL, "_blank");
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;

    // Automatically capitalize the first letter of each word
    const formattedQuery = query
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    setSearchQuery(formattedQuery);

    // Filter music based on the formatted query
    const filtered = music.filter((music) =>
      music.title.toLowerCase().startsWith(formattedQuery.toLowerCase())
    );

    if (formattedQuery && filtered.length === 0) {
      setError(`No music title matches your search query! Double-check you've input the
      correct title into the search field. Otherwise, consider adding the
      piece of music to The Music List.`);
    } else {
      setError(false);
    }

    setFilteredMusic(filtered);
  };

  const renderTableHeader = () => {
    // Render table sub-header row
    return (
      <tr>
        <th>Music Title</th>
        <th>Album</th>
        <th>Artist</th>
        <th>Music Info</th>
        <th>*Listen</th>
        <th>Share Music</th>
      </tr>
    );
  };

  const renderMusicRow = (music) => {
    return (
      <tr key={music.music_id}>
        <td>{music.title}</td>
        <td>{music.album}</td>
        <td>{music.artist}</td>
        <td>
          <button
            className="info-button"
            onClick={() => openMusicDetails(music)}
          >
            Info
          </button>
        </td>
        <td>
          {music.listen_link ? (
            <button className="listen-button" onClick={() => listen(music)}>
              Listen
            </button>
          ) : (
            <button className="disabled-button">Link Not Available</button>
          )}
        </td>
        <td>
          <button
            className="share-button"
            onClick={() => openSharePopup(music)}
          >
            Share
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="music-list">
      <div className="custom-alert"></div>
      <p>
        *Disclaimer: All available <b>Listen</b> buttons to Amazon are affiliate
        links. <i>Undervalued Music</i> will make a commission on the sale you
        make through the link. It is no extra cost to you to use the link, it's
        simply another way to support <i>Undervalued Music</i>.
      </p>
      <input
        type="text"
        placeholder="Search Music Title"
        className="search-input"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {error ? (
        <tr>
          <td colSpan="5">
            <p className="error-message">{error}</p>
          </td>
        </tr>
      ) : (
        <table>
          <thead>{renderTableHeader()}</thead>
          <tbody>
            {searchQuery
              ? filteredMusic.map((music) => renderMusicRow(music))
              : music.map((music) => renderMusicRow(music))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MusicList;

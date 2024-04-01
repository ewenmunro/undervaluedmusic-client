import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// assets/styles
import "../../assets/styles/musicdetailsprivate.css";

// components/auth
import { useAuth } from "../auth/AuthContext";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const MusicDetailsPrivate = () => {
  const { musicDetails } = useParams();
  const [music, setMusic] = useState(null);
  const [isMentioned, setIsMentioned] = useState(false);

  const { isAuthenticated } = useAuth();

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

        // Check if the user has mentioned the music
        const mentionResponse = await axios.get(
          `${apiBaseUrl}/api/mentions/checkmentioned`,
          {
            params: {
              user_id: isAuthenticated.user.user_id,
              music_id: response.data.music.music_id,
            },
          }
        );

        setIsMentioned(mentionResponse.data.hasMentioned);
      } catch (error) {
        console.error("Failed to fetch music details:", error);
      }
    };

    fetchMusicDetails();
  }, [musicDetails, isAuthenticated.user.user_id]);

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

  const handleMention = async (mentioned) => {
    try {
      // Make an API request to update the mention status
      await axios.post(
        `${apiBaseUrl}/api/mentions/mentioned`,
        {
          user_id: isAuthenticated.user.user_id,
          music_id: music.music_id,
          mentioned,
        },
        {
          headers: {
            Authorization: `Bearer ${isAuthenticated.token}`,
          },
        }
      );

      // Update the state to reflect the mention status
      setIsMentioned(mentioned);
    } catch (error) {
      console.error("Failed to update mention status:", error);
    }
  };

  // Helper function to highlight stars on hover
  function highlightStars(stars, rating) {
    const starElements = stars.querySelectorAll(".star");
    starElements.forEach((star, index) => {
      star.classList.toggle("highlighted", index < rating);
    });
  }

  // Helper function to remove highlights on mouseout
  function removeHighlights(stars) {
    const starElements = stars.querySelectorAll(".star");
    starElements.forEach((star) => {
      star.classList.remove("highlighted");
    });
  }

  const handleRating = async (music) => {
    // Check if the user has already rated the music
    const userRating = music.userRating;

    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/ratings/checkrating`,
        {
          params: {
            user_id: isAuthenticated.user.user_id,
            music_id: music.music_id,
          },
        }
      );

      const hasRated = response.data.rated;
      const previousUserRating = response.data.userRating;

      // Create a modal/pop-up for rating
      const modal = document.createElement("div");
      modal.className = "rating-modal";

      // Close button for the modal
      const closeButton = document.createElement("span");
      closeButton.className = "close-button";
      closeButton.textContent = "✖️";
      closeButton.addEventListener("click", () => {
        modal.remove(); // Close the modal when clicking the close button
      });

      // Rating stars
      const stars = document.createElement("div");
      stars.className = "rating-stars";

      // Create stars and handle click events
      for (let i = 1; i <= 10; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        star.className = "star";
        star.dataset.value = i;

        // Highlight stars based on user's previous rating or current userRating
        if (hasRated && i <= previousUserRating) {
          star.classList.add("selected", "highlighted");
        }

        star.addEventListener("mouseover", () => {
          highlightStars(stars, i + 1); // Highlight stars up to the one being hovered over
        });

        star.addEventListener("mouseout", () => {
          removeHighlights(stars);
        });

        star.addEventListener("click", async () => {
          // Handle the user's rating
          if (userRating !== i) {
            try {
              if (hasRated) {
                // User has already rated, edit the rating
                await axios.post(
                  `${apiBaseUrl}/api/ratings/edit`,
                  {
                    user_id: isAuthenticated.user.user_id,
                    music_id: music.music_id,
                    rating: i,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${isAuthenticated.token}`,
                    },
                  }
                );
              } else {
                // User has not rated, create a new rating
                await axios.post(
                  `${apiBaseUrl}/api/ratings/rate`,
                  {
                    user_id: isAuthenticated.user.user_id,
                    music_id: music.music_id,
                    rating: i,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${isAuthenticated.token}`,
                    },
                  }
                );
              }
              // Update the user's rating in the music object
              music.userRating = i;

              // If the user rates 7 or higher, open the share pop-up
              if (i >= 7) {
                openSharePopup(music);
              }
            } catch (error) {
              console.error("Failed to update rating:", error);
            }
          }

          modal.remove(); // Close the modal after rating
        });

        stars.appendChild(star);
      }

      // Append elements to the modal
      modal.appendChild(closeButton);
      modal.appendChild(stars);

      // Append the modal to the document body
      document.body.appendChild(modal);
    } catch (error) {
      console.error("Failed to check rating status:", error);
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

  const shareViaEmail = () => {
    const titleWithHyphens = music.title.toLowerCase().replace(/\s+/g, "-");
    const subject = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const body = encodeURIComponent(
      `I thought you might enjoy this piece of music: undervaluedmusic.com/music/${titleWithHyphens}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareOnFacebook = () => {
    const titleWithHyphens = music.title.toLowerCase().replace(/\s+/g, "-");
    const shareText = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      `undervaluedmusic.com/music/${titleWithHyphens}`
    )}&quote=${shareText}`;
    window.open(shareURL, "_blank");
  };

  const shareOnTwitter = () => {
    const titleWithHyphens = music.title.toLowerCase().replace(/\s+/g, "-");
    const shareText = encodeURIComponent(
      `Check out this piece of music: ${music.title}`
    );
    const shareURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(
      `undervaluedmusic.com/music/${titleWithHyphens}`
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
        <b>Heard of Before:</b>
      </p>
      <p>
        Have you heard of {music.title} before visiting undervaluedmusic.com?
      </p>
      <p>
        Note: Once you have answered the question, you won't be able to edit
        your answer. Please make sure you answer this question correctly.
      </p>
      <p>
        {isMentioned ? (
          <button className="music-details-disable" disabled>
            Mentioned
          </button>
        ) : (
          <>
            <button
              className="music-details-mention-button"
              onClick={() => handleMention(true)}
            >
              Yes
            </button>
            <button
              className="music-details-mention-button"
              onClick={() => handleMention(false)}
            >
              No
            </button>
          </>
        )}
      </p>
      <p>
        <b>Score music:</b>
      </p>
      <p>
        <button
          className="music-details-rating-button"
          onClick={() => handleRating(music)}
        >
          Rate
        </button>
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
        <button className="music-details-disable" disabled>
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

export default MusicDetailsPrivate;

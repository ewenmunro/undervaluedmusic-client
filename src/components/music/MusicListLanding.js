import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// assets/styles
import "../../assets/styles/musiclistdashboard.css";

// components/auth
import { useAuth } from "../auth/AuthContext";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function MusicListLanding() {
  const [music, setMusic] = useState([]);
  const [filterOption, setFilterOption] = useState("all");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedMusic, setDisplayedMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [musicSorted, setMusicSorted] = useState(false);
  const [message, setMessage] = useState("");

  const { isAuthenticated } = useAuth();

  // Use the useNavigate hook from 'react-router-dom'
  const navigate = useNavigate();

  const handleInitialMentionButtonState = useCallback(
    async (music) => {
      try {
        // Make an API request to check if the user has mentioned the music
        const response = await axios.get(
          `${apiBaseUrl}/api/mentions/checkmentioned`,
          {
            params: {
              user_id: isAuthenticated.user.user_id,
              music_id: music.music_id,
            },
          }
        );

        const hasMentioned = response.data.hasMentioned;

        if (hasMentioned === true || hasMentioned === false) {
          const mentionButton = document.querySelector(
            `#mention-button-${music.music_id}`
          );

          if (mentionButton) {
            mentionButton.disabled = true;
            mentionButton.textContent = "Mentioned";
            mentionButton.classList.add("disabled-button");
          }
        }
      } catch (error) {
        console.error("Failed to check mention status:", error);
      }
    },
    [isAuthenticated.user.user_id]
  );

  // Handle filter option change
  const handleFilterChange = (option) => {
    setFilterOption(option);
  };

  const updateDisplayedMusic = useCallback(async () => {
    try {
      setLoading(true);

      let updatedMusic = music;

      // Apply filter option
      switch (filterOption) {
        case "notRated":
          if (isAuthenticated && isAuthenticated.user) {
            const notRatedResponse = await axios.get(
              `${apiBaseUrl}/api/ratings/not-rated`,
              {
                params: {
                  user_id: isAuthenticated.user.user_id,
                },
                headers: {
                  Authorization: `Bearer ${isAuthenticated.token}`,
                },
              }
            );
            updatedMusic = notRatedResponse.data.music;
          }
          break;

        case "notMentioned":
          if (isAuthenticated && isAuthenticated.user) {
            const notMentionedResponse = await axios.get(
              `${apiBaseUrl}/api/mentions/not-mentioned`,
              {
                params: {
                  user_id: isAuthenticated.user.user_id,
                },
                headers: {
                  Authorization: `Bearer ${isAuthenticated.token}`,
                },
              }
            );
            updatedMusic = notMentionedResponse.data.music;
          }
          break;

        case "notHeardBefore":
          if (isAuthenticated && isAuthenticated.user) {
            const notHeardBeforeResponse = await axios.get(
              `${apiBaseUrl}/api/mentions/not-heard-before`,
              {
                params: {
                  user_id: isAuthenticated.user.user_id,
                },
                headers: {
                  Authorization: `Bearer ${isAuthenticated.token}`,
                },
              }
            );
            updatedMusic = notHeardBeforeResponse.data.music;
          }
          break;

        case "all":
        default:
        // If no filter is applied, do nothing
      }

      // Apply search filter if there is a search query
      if (searchQuery) {
        updatedMusic = updatedMusic.filter((music) =>
          music.title.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
      }

      // Update the displayedMusic state
      setDisplayedMusic(updatedMusic);
    } catch (error) {
      console.error("Failed to update displayed music:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterOption, music, isAuthenticated]);

  useEffect(() => {
    // Function to fetch music data from the server
    const fetchMusic = async () => {
      try {
        setLoading(true);

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

        // Check and disable Mention buttons for music already mentioned by the user
        sortedMusic.forEach((music) => {
          handleInitialMentionButtonState(music);
        });

        setMusicSorted(true);
        updateDisplayedMusic();
      } catch (error) {
        console.error("Failed to fetch music:", error);
        setError("Failed to fetch music. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Call the function to fetch and sort music when the component mounts
    fetchMusic();
  }, [
    handleInitialMentionButtonState,
    searchQuery,
    filterOption,
    music,
    isAuthenticated,
    updateDisplayedMusic,
  ]);

  // Function to calculate the weighted score for a music
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
    const musicUrl = `/music/private/${musicDetails}`;

    // Pass the music as state to the musicDetails component
    navigate(musicUrl, { state: { music } });
  };

  const handleMention = async (music) => {
    try {
      // Make an API request to check if the user has mentioned the music
      const response = await axios.get(
        `${apiBaseUrl}/api/mentions/checkmentioned`,
        {
          params: {
            user_id: isAuthenticated.user.user_id,
            music_id: music.music_id,
          },
        }
      );

      const hasMentioned = response.data.hasMentioned;

      if (hasMentioned === true || hasMentioned === false) {
        // If the user has already mentioned the music, disable the buttons and return
        const mentionButton = document.querySelector(
          `#mention-button-${music.music_id}`
        );

        if (mentionButton) {
          mentionButton.disabled = true;
          mentionButton.textContent = "Mentioned";
          mentionButton.classList.add("disabled-button");
        }

        return;
      }

      // Modal/pop-up for mentioning if the user hasn't mentioned before
      const modal = document.createElement("div");
      modal.className = "mention-modal";

      // Close button for the modal
      const closeButton = document.createElement("span");
      closeButton.className = "close-button";
      closeButton.textContent = "✖️";
      closeButton.addEventListener("click", () => {
        modal.remove(); // Close the modal when clicking the close button
      });

      // Mention question
      const mentionQuestion = document.createElement("div");
      mentionQuestion.className = "mention-question";
      mentionQuestion.textContent = `Have you heard of ${music.title} before visiting undervaluedmusic.com?`;

      // Disclaimer
      const disclaimer = document.createElement("div");
      disclaimer.className = "disclaimer";
      disclaimer.textContent =
        "Note: Once you have answered the question, you won't be able to edit your answer. Please make sure you answer this question correctly.";

      // Yes button
      const yesButton = document.createElement("button");
      yesButton.textContent = "Yes";
      yesButton.addEventListener("click", async () => {
        // Handle the 'Yes' answer
        try {
          // Show loading message and hide table content
          setLoading(true);
          setDisplayedMusic([]);
          setMessage("Your Mention request is being processed...");

          await axios.post(
            `${apiBaseUrl}/api/mentions/mentioned`,
            {
              user_id: isAuthenticated.user.user_id,
              music_id: music.music_id,
              mentioned: true,
            },
            {
              headers: {
                Authorization: `Bearer ${isAuthenticated.token}`,
              },
            }
          );

          // Hide loading message and show table content after the user answers
          setLoading(false);
          setMessage("");
          updateDisplayedMusic();
        } catch (error) {
          console.error("Failed to update mention status:", error);
        }

        modal.remove(); // Close the modal after answering
      });

      // No button
      const noButton = document.createElement("button");
      noButton.textContent = "No";
      noButton.addEventListener("click", async () => {
        // Handle the 'No' answer
        try {
          // Show loading message and hide table content
          setLoading(true);
          setDisplayedMusic([]);
          setMessage("Your Mention request is being processed...");

          await axios.post(
            `${apiBaseUrl}/api/mentions/mentioned`,
            {
              user_id: isAuthenticated.user.user_id,
              music_id: music.music_id,
              mentioned: false,
            },
            {
              headers: {
                Authorization: `Bearer ${isAuthenticated.token}`,
              },
            }
          );

          // Hide loading message and show table content after the user answers
          setLoading(false);
          setMessage("");
          updateDisplayedMusic();
        } catch (error) {
          console.error("Failed to update mention status:", error);
        }

        modal.remove(); // Close the modal after answering
      });

      // Append elements to the modal
      modal.appendChild(closeButton);
      modal.appendChild(mentionQuestion);
      modal.appendChild(disclaimer);
      modal.appendChild(yesButton);
      modal.appendChild(noButton);

      // Append the modal to the document body
      document.body.appendChild(modal);

      // Hide loading message and show table content after user answers
      setLoading(false);
      setMessage("");
      updateDisplayedMusic();
    } catch (error) {
      console.error("Failed to check mention status:", error);
      setLoading(false);
      setMessage("");
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
          // Show loading message and hide table content
          setLoading(true);
          setDisplayedMusic([]);
          setMessage("Your Rating request is being processed...");

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

              // Hide loading message and show table content after user rates
              setLoading(false);
              setMessage("");
              updateDisplayedMusic();
            } catch (error) {
              console.error("Failed to update rating:", error);
              setLoading(false);
              setMessage("");
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

      // Hide loading message and show table content after user rates
      setLoading(false);
      setMessage("");
      updateDisplayedMusic();
    } catch (error) {
      console.error("Failed to check rating status:", error);
      setLoading(false);
      setMessage("");
    }
  };

  const listen = (music) => {
    // Check if there's a valid link in the database for this music
    if (music.listen_link) {
      // Open the listen link in a new tab
      window.open(music.listen_link, "_blank");

      // Make an API request to log the click
      axios.post(
        `${apiBaseUrl}/api/listen/authclick`,
        {
          user_id: isAuthenticated.user.user_id,
          music_id: music.music_id,
        },
        {
          headers: {
            Authorization: `Bearer ${isAuthenticated.token}`,
          },
        }
      );
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
      setError(
        `No music title matches your search query! Double-check you've input the
        correct title into the search field. Otherwise, consider adding the
        piece of music to The Music List.`
      );
    } else {
      setError(false);
    }

    // Update the displayedMusic state
    setDisplayedMusic(filtered);
  };

  const renderTableHeader = () => {
    // Render table header with filter options
    return (
      <div>
        <div className="filter-options">
          <button
            onClick={() => handleFilterChange("all")}
            className={filterOption === "all" ? "active" : ""}
          >
            All Music
          </button>
          <button
            onClick={() => handleFilterChange("notRated")}
            className={filterOption === "notRated" ? "active" : ""}
          >
            Not Rated
          </button>
          <button
            onClick={() => handleFilterChange("notMentioned")}
            className={filterOption === "notMentioned" ? "active" : ""}
          >
            Not Mentioned
          </button>
          <button
            onClick={() => handleFilterChange("notHeardBefore")}
            className={filterOption === "notHeardBefore" ? "active" : ""}
          >
            Not Heard Before
          </button>
        </div>
        <input
          type="text"
          placeholder="Search Music Title"
          className="search-input"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <table>
          <thead>{renderTableHeaderRow()}</thead>
          <tbody>
            {searchQuery
              ? displayedMusic.map((music) => renderMusicRow(music))
              : Object.keys(displayedMusic).map((musicKey) =>
                  renderMusicRow(displayedMusic[musicKey])
                )}
            {displayedMusic.length === 0 && searchQuery ? (
              <tr>
                <td colSpan="8">
                  <p className="error-message">{error}</p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTableHeaderRow = () => {
    // Render table sub-header row
    return (
      <tr>
        <th>Music Title</th>
        <th>Album</th>
        <th>Artist</th>
        <th>Music Info</th>
        <th>Heard of Before</th>
        <th>Score Music</th>
        <th>*Listen</th>
        <th>Share Music</th>
      </tr>
    );
  };

  const renderMusicRow = (music) => {
    // Render music row
    return (
      <tr key={music.music_id}>
        <td>{loading || !musicSorted ? "Loading..." : music.title}</td>
        <td>{loading || !musicSorted ? "Loading..." : music.album}</td>
        <td>{loading || !musicSorted ? "Loading..." : music.artist}</td>
        <td>
          {loading || !musicSorted ? (
            <button disabled>Loading...</button>
          ) : (
            <button
              className="info-button"
              onClick={() => openMusicDetails(music)}
            >
              Info
            </button>
          )}
        </td>
        <td>
          {loading || !musicSorted ? (
            <button disabled>Loading...</button>
          ) : (
            <button
              id={`mention-button-${music.music_id}`}
              className="mention-button"
              onClick={() => handleMention(music)}
            >
              Mention
            </button>
          )}
        </td>
        <td>
          {loading || !musicSorted ? (
            <button disabled>Loading...</button>
          ) : (
            <button
              className="rating-button"
              onClick={() => handleRating(music)}
            >
              Rate
            </button>
          )}
        </td>
        <td>
          {loading || !musicSorted ? (
            <button disabled>Loading...</button>
          ) : (
            <div>
              {music.listen_link ? (
                <button className="listen-button" onClick={() => listen(music)}>
                  Listen
                </button>
              ) : (
                <button className="disabled-button">Link Not Available</button>
              )}
            </div>
          )}
        </td>
        <td>
          {loading || !musicSorted ? (
            <button disabled>Loading...</button>
          ) : (
            <button
              className="share-button"
              onClick={() => openSharePopup(music)}
            >
              Share
            </button>
          )}
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
      {message && <p className="mention-rating-loading-message">{message}</p>}
      {renderTableHeader()}
    </div>
  );
}

export default MusicListLanding;

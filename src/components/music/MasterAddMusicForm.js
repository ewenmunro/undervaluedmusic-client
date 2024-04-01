import React, { useState, useEffect } from "react";
import axios from "axios";

// assets/styles
import "../../assets/styles/masteraddmusicform.css";

// components/auth
import { useAuth } from "../auth/AuthContext";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function MasterAddMusicForm({ onAddMusic }) {
  const { isAuthenticated } = useAuth();

  // Variable to quickly disable Add Music button if I need to
  let isButtonDisabled = false;

  // State to store user input
  const [formData, setFormData] = useState({
    title: "",
    album: "",
    artist: "",
    listen: "",
    userId: "",
    confirmationChecked: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pathSegments = window.location.pathname.split("/").slice(3);
        const title = pathSegments[0];
        const album = pathSegments[1];
        const artist = pathSegments[2];
        const userId = pathSegments[3];

        // Correct the title, album and artist before sending info to the database
        const formattedTitle = title
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const formattedAlbum = album
          .split("-")
          .map((word, index) =>
            index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
          )
          .join(" ");

        const formattedArtist = artist
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        setFormData({
          title: formattedTitle,
          album: formattedAlbum,
          artist: formattedArtist,
          userId: userId,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false);

  // State to store success, info, and error messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set loading state to true when the form is submitted
    setIsLoading(true);

    // Extract music details from formData
    const { title, album, artist, listen, userId, confirmationChecked } =
      formData;

    // // Disable the Add Music button when I need to
    // setIsButtonDisabled(true);

    // Clear previous messages
    setSuccessMessage("");
    setErrorMessage("");

    // Check if the confirmation checkbox is checked
    if (!confirmationChecked) {
      setErrorMessage(
        "Please confirm that you've double-checked the music details."
      );
      return;
    }

    // Validate the form data
    if (!title.trim() || !album.trim() || !artist.trim()) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    // Validate that the title is not a website link
    if (containsWebsiteLinks(title)) {
      setErrorMessage("Title should not be a website link.");
      return;
    }

    // Validate that the album does not contain website links
    if (containsWebsiteLinks(album)) {
      setErrorMessage("Album should not contain website links.");
      return;
    }

    // Validate that the artist is not a website link
    if (containsWebsiteLinks(artist)) {
      setErrorMessage("Artist should not be a website link.");
      return;
    }

    // Validate that the title do not contain accents
    if (containsAccents(title)) {
      setErrorMessage("Title should not contain accents.");
      return;
    }

    // Validate that the album do not contain accents
    if (containsAccents(album)) {
      setErrorMessage("Album should not contain accents.");
      return;
    }

    // Validate that the artist do not contain accents
    if (containsAccents(artist)) {
      setErrorMessage("Artist should not contain accents.");
      return;
    }

    // Check if a music with the same title and artist already exists in the database
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/music/checkmusic?title=${title}&artist=${artist}`
      );

      if (response.data.exists) {
        setErrorMessage("This piece of music is already on The Music List.");
        return;
      }
    } catch (error) {
      console.error("Error checking music:", error);
      setErrorMessage(
        "Failed to check if this piece of music exists. Please try again."
      );
      return;
    }

    // If no matching music was found, proceed to add the music
    try {
      // Make an Axios POST request to your backend API to review a music
      const response = await axios.post(
        `${apiBaseUrl}/api/music/addmusic`,
        {
          title,
          album,
          artist: artist,
          listen,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${isAuthenticated.token}`,
          },
        }
      );

      if (response.status === 200) {
        // Clear the form data
        setFormData({
          title: "",
          album: "",
          artist: "",
          listen: "",
          userId: "",
        });

        // Clear previous error messages
        setErrorMessage("");

        // Display a success message if the music was added successfully
        setSuccessMessage(
          "This piece of music has been added to The Music List."
        );

        // Call the onAddMusic function passed as a prop to update the music list
        onAddMusic(response.data.music);
      } else {
        // Handle other response statuses, if needed
        setErrorMessage("Failed to add this piece of music. Please try again.");
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Failed to add the music:", error);
      setErrorMessage("Failed to add this piece of music. Please try again.");
    } finally {
      // Set loading state back to false when the request is complete
      setIsLoading(false);
    }
  };

  // Function to handle rejecting the music
  const handleReject = async () => {
    // Set loading state to true when the form is submitted
    setIsLoading(true);

    try {
      // Make an Axios POST request to reject the music
      const response = await axios.post(
        `${apiBaseUrl}/api/music/reject`,
        {
          title: formData.title,
          artist: formData.artist,
          userId: formData.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${isAuthenticated.token}`,
          },
        }
      );

      if (response.status === 200) {
        // Clear the form data
        setFormData({
          title: "",
          album: "",
          artist: "",
          listen: "",
          userId: "",
        });

        // Clear previous error messages
        setErrorMessage("");

        // Display a success message if the music was rejected successfully
        setSuccessMessage("This piece of music has been rejected.");
      } else {
        // Handle other response statuses, if needed
        setErrorMessage(
          "Failed to reject this piece of music. Please try again."
        );
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Failed to reject the music:", error);
      setErrorMessage(
        "Failed to reject this piece of music. Please try again."
      );
    } finally {
      // Set loading state back to false when the request is complete
      setIsLoading(false);
    }
  };

  // Function to check if a string contains website links using regular expressions
  const containsWebsiteLinks = (text) => {
    // Regular expression to match URLs
    const urlPattern = /(https?|ftp|http):\/\/[^\s/$.?#].[^\s]*/gi;

    // Test if the text contains URLs
    return urlPattern.test(text);
  };

  // Function to check if a string contains accents
  const containsAccents = (text) => {
    // Regular expression to match accents
    const accentPattern = /[\u0300-\u036f]/g;

    // Test if the text contains accents
    return accentPattern.test(text);
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let formattedValue = value;

    if (type === "checkbox") {
      // If the input is a checkbox, update the confirmationChecked state
      formattedValue = checked;
    } else if (name === "title") {
      // If the input is for the title, capitalize the first letter of each word and convert the rest to lowercase
      formattedValue = value
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Update the formData state with the formatted input value
    setFormData({ ...formData, [name]: formattedValue });
  };

  return (
    <div className="add-music-form">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" />
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="album" />
          <textarea
            id="album"
            name="album"
            placeholder="Album"
            value={formData.album}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="artist" />
          <input
            type="text"
            id="artist"
            name="artist"
            placeholder="Artist"
            value={formData.artist}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="listen" />
          <input
            type="text"
            id="listen"
            name="listen"
            placeholder="Listen"
            value={formData.listen}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="userId" />
          <input
            type="text"
            id="userId"
            name="userId"
            placeholder="User ID"
            value={formData.userId}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <input
            type="checkbox"
            id="confirmation"
            name="confirmationChecked"
            checked={formData.confirmationChecked}
            onChange={handleInputChange}
          />
          <label htmlFor="confirmation">
            I confirm that I've double-checked the music details
          </label>
        </div>
        <div>
          <button
            type="button"
            className="reject-music-button"
            onClick={handleReject}
          >
            {isLoading ? "Processing..." : "Reject Music"}
          </button>
          <button
            type="submit"
            className="add-music-button"
            disabled={isButtonDisabled}
          >
            {isLoading ? "Processing..." : "Add Music"}
          </button>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </div>
  );
}

export default MasterAddMusicForm;

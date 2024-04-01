import React, { useState } from "react";
import axios from "axios";

// assets/styles
import "../../assets/styles/addmusicform.css";

// components/auth
import { useAuth } from "../auth/AuthContext";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function AddMusic({ onAddMusic }) {
  const { isAuthenticated } = useAuth();

  // Variable to quickly disable Add Music button if I need to
  let isButtonDisabled = false;

  // State to store user input
  const [formData, setFormData] = useState({
    title: "",
    album: "",
    artist: "",
    confirmationChecked: "",
  });

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
    const { title, album, artist, confirmationChecked } = formData;

    // // Disable the Add music button when I need to
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

    // Validate that the title and album do not contain accents
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
        `${apiBaseUrl}/api/music/reviewmusic`,
        {
          title,
          album,
          artist: artist,
        },
        {
          headers: {
            Authorization: `Bearer ${isAuthenticated.token}`,
          },
        }
      );

      if (response.status === 201) {
        // Clear the form data
        setFormData({ title: "", album: "", artist: "" });

        // Clear previous error messages
        setErrorMessage("");

        // Display a success message if the music was added successfully
        setSuccessMessage(
          "Your request has been submitted for review. You will be notified the result of this review via email."
        );

        // Call the onAddMusic function passed as a prop to update the music list
        onAddMusic(response.data.music);
      } else {
        // Handle other response statuses, if needed
        setErrorMessage(
          "Failed to submit your request for review. Please try again."
        );
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Failed to submit your request for review:", error);
      setErrorMessage(
        "Failed to submit your request for review. Please try again."
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

export default AddMusic;

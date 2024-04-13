// routes.js
import React from "react";
import { Routes, Route } from "react-router-dom";

//  components/pages
import Home from "../../pages/Home";
import About from "../../pages/About";
import Landing from "../../pages/Landing";
import AddMusic from "../../pages/AddMusic";
import MasterAddMusic from "../../pages/MasterAddMusic";
import UserProfile from "../../pages/UserProfile";
import Login from "../../pages/Login";
import Signup from "../../pages/Signup";
import TermsConditions from "../../pages/T&C";
import PrivacyPolicy from "../../pages/PrivacyPolicy";

// components/auth
import Logout from "../auth/Logout";
import Verification from "../../pages/Verification";
import AccountDeleted from "../../pages/AccountDeleted";

// components/music
import MusicDetails from "../music/MusicDetails";
import MusicDetailsPrivate from "../music/MusicDetailsPrivate";

// components/route
import PrivateRoutes from "./PrivateRoutes";

const AllRoutes = () => (
  <Routes>
    <Route exact path="/" element={<Home />} />
    <Route path="/music/:musicDetails" element={<MusicDetails />} />
    <Route path="/about" element={<About />} />
    <Route element={<PrivateRoutes />}>
      <Route exact path="/dashboard" element={<Landing />} />
      <Route
        path="/music/private/:musicDetails"
        element={<MusicDetailsPrivate />}
      />
      <Route path="/addmusic" element={<AddMusic />} />
      <Route
        path="/master/addmusic/:title/:album/:artist/:user_id"
        element={<MasterAddMusic />}
      />
      <Route path="/myprofile" element={<UserProfile />} />
    </Route>
    <Route path="/login" element={<Login />} />
    <Route path="/verification/:token" element={<Verification />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/logout" element={<Logout />} />
    <Route path="/account-deleted" element={<AccountDeleted />} />
    <Route path="/terms-conditions" element={<TermsConditions />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  </Routes>
);

export default AllRoutes;

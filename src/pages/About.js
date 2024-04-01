import React from "react";
import "../assets/styles/about.css";

function About() {
  return (
    <div className="about">
      <h1>
        About <i>Undervalued Music</i>
      </h1>
      <p>
        <i>Undervalued Music</i> was founded in 2024 and is a web platform for a
        community of music enthusiasts who recommend music that they feel are
        undervalued to each other in order to give those pieces of music the
        appreciation they deserve.
      </p>
      <p>
        Users are able to recommend any piece of music that hasn’t already been
        recommended by the community, make as many music recommendations as they
        wish, can rate whether or not they have heard of the piece of music
        before coming to the site and can rate the quality of each piece of
        music between 1 to 10 stars.
      </p>
      <p>
        All of these contributions from the community influence The Music List,
        a list of all the music recommended by the community, in order of how
        undervalued the piece of music is. The more undervalued a piece of music
        is the higher up the list it will land and the less undervalued a piece
        of music is the lower it will find itself on the list.
      </p>
      <p>
        But what makes this list different is that as users seek out and watch
        the more undervalued music, the music at the top of the list, and rate
        the quality of those pieces of music on the site, those pieces of music
        will find their way down the list as they’re finally gaining more and
        more appreciation. This reshuffling of the list always gives users more
        undervalued music to seek out and watch, constantly encouraging users to
        discover music that they might not have heard of otherwise.
      </p>
    </div>
  );
}

export default About;

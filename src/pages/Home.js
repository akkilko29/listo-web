import React from "react";

import MegaMenuBar from "../components/MegaMenuBar";
import HeroSection from "../components/HeroSection";
import BrowseCategories from "../components/BrowseCategories";
import TrendingClassifieds from "../components/TrendingClassifieds";

function Home() {
  return React.createElement(
    "div",
    { className: "home-page" },

    React.createElement(MegaMenuBar),

    React.createElement(HeroSection),

    React.createElement(BrowseCategories),

    React.createElement(TrendingClassifieds)
  );
}

export default Home;
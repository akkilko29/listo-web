import React from "react";

import MegaMenuBar from "../components/MegaMenuBar";
import HeroSection from "../components/HeroSection";
import BrowseCategories from "../components/BrowseCategories";
import TrendingClassifieds from "../components/TrendingClassifieds";
import { UI_CONFIG } from "../config/uiConfig";

function Home() {
  return React.createElement(
    "div",
    { className: "home-page" },

    React.createElement(MegaMenuBar),

    UI_CONFIG.showHeroBanner && React.createElement(HeroSection),

    UI_CONFIG.showBrowseCategories && React.createElement(BrowseCategories),

    React.createElement(TrendingClassifieds)
  );
}

export default Home;

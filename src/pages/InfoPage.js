import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { INFO_PAGES } from "../data/infoPages";
import "../style/InfoPage.css";

function InfoPage({ slug: slugProp }) {
  const { slug: slugParam } = useParams();
  const slug = slugProp || slugParam;
  const page = INFO_PAGES[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!page) {
    return React.createElement(
      "main",
      { className: "info-page" },
      React.createElement(
        "div",
        { className: "info-page-card" },
        React.createElement("h1", null, "Page not found"),
        React.createElement(
          "p",
          null,
          "This Listo page does not exist. ",
          React.createElement(Link, { to: "/" }, "Go home")
        )
      )
    );
  }

  return React.createElement(
    "main",
    { className: "info-page" },
    React.createElement(
      "div",
      { className: "info-page-card" },
      React.createElement("h1", null, page.title),
      React.createElement("p", { className: "info-page-subtitle" }, page.subtitle),
      page.sections.map((section) =>
        React.createElement(
          "section",
          { key: section.heading, className: "info-page-section" },
          React.createElement("h2", null, section.heading),
          React.createElement("p", null, section.body)
        )
      )
    )
  );
}

export default InfoPage;

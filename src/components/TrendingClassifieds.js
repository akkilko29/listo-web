import React from "react";
import "../style/TrendingClassifieds.css";

function TrendingClassifieds() {
  const listings = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80",
      price: "₹ 8,45,000",
      title:
        "Honda City ZX i-VTEC (2022) • First Owner, First Registration",
      location: "Bandra, Mumbai",
      time: "2 hrs ago",
      featured: true,
    },

    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80",
      price: "₹ 45,999",
      title:
        "iPhone 13 Pro Max (256 GB) Sierra Blue • Battery health 92%",
      location: "Andheri West, Mumbai",
      time: "4 hrs ago",
      featured: false,
    },

    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
      price: "₹ 18,500",
      title:
        "Solid Teak Wood Dining Table with 6 Upholstered Chairs",
      location: "Thane West, Thane",
      time: "Today",
      featured: false,
    },

    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      price: "₹ 12,000",
      title:
        "Decathlon Rockrider ST100 Mountain Bike • 21 Gears, Medium",
      location: "Nerul, Navi Mumbai",
      time: "Yesterday",
      featured: false,
    },

    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80",
      price: "₹ 1,75,00,000",
      title:
        "Ultra Luxury 2.5 BHK Flat with Balcony in Premium Gated Society",
      location: "Kharghar, Navi Mumbai",
      time: "2 days ago",
      featured: true,
    },

    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
      price: "₹ 72,000",
      title:
        "MacBook Pro M1 (16GB RAM, 512GB SSD) • Space Gray, Apple Care",
      location: "Powai, Mumbai",
      time: "2 days ago",
      featured: false,
    },

    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
      price: "₹ 8,400",
      title:
        "Fossil Grant Automatic Chronograph Leather Watch for Men",
      location: "Worli, Mumbai",
      time: "3 days ago",
      featured: false,
    },

    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80",
      price: "₹ 32,500",
      title:
        "Samsung Double Door Convertible Refrigerator 345L • 5 Star Energy",
      location: "Borivali East, Mumbai",
      time: "4 days ago",
      featured: false,
    },
  ];

  const handleListingClick = (listing) => {
    console.log("Selected listing:", listing);
  };

  return React.createElement(
    "section",
    { className: "trending-section" },

    React.createElement(
      "div",
      { className: "home-section-container" },

      /* Header */

      React.createElement(
        "div",
        { className: "trending-header" },

        React.createElement(
          "h2",
          { className: "home-section-title" },
          "Trending Classifieds"
        ),

        React.createElement(
          "button",
          {
            type: "button",
            className: "view-listings-button",
            onClick: () =>
              console.log("View all listings"),
          },
          "View All Listings"
        )
      ),

      /* Cards */

      React.createElement(
        "div",
        { className: "classifieds-grid" },

        listings.map((listing) =>
          React.createElement(
            "article",
            {
              key: listing.id,
              className: "classified-card",
              onClick: () =>
                handleListingClick(listing),
            },

            /* Image */

            React.createElement(
              "div",
              { className: "classified-image-wrapper" },

              React.createElement("img", {
                src: listing.image,
                alt: listing.title,
                className: "classified-image",
              }),

              listing.featured &&
                React.createElement(
                  "span",
                  { className: "featured-badge" },
                  "FEATURED"
                )
            ),

            /* Content */

            React.createElement(
              "div",
              { className: "classified-content" },

              React.createElement(
                "div",
                { className: "classified-price" },
                listing.price
              ),

              React.createElement(
                "h3",
                null,
                listing.title
              ),

              React.createElement(
                "div",
                { className: "classified-meta" },

                React.createElement(
                  "span",
                  null,

                  React.createElement("i", {
                    className:
                      "fa-solid fa-location-dot",
                  }),

                  listing.location
                ),

                React.createElement(
                  "span",
                  null,
                  listing.time
                )
              )
            )
          )
        )
      )
    )
  );
}

export default TrendingClassifieds;
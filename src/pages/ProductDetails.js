import React, { useState } from "react";
import { useParams } from "react-router-dom";

import "../style/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: id,

    title: "Honda City ZX i-VTEC (2022) - First Owner",

    price: "₹ 8,45,000",

    location: "Bandra, Mumbai, Maharashtra",

    posted: "2 hrs ago",

    images: [
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=80",
    ],

    description:
      "Excellent condition, meticulously maintained Honda City ZX-iVTEC (Top Model). Purchased brand new in 2022. Driven only 15,500 km with full service history recorded at authorized Honda Service Center. Insured till June 2026. Very minor scratch on left bumper, otherwise absolutely scratchless body. Perfect choice for city commute & weekend highway cruises.",

    specifications: [
      {
        label: "Transmission",
        value: "Manual (6-Speed)",
      },
      {
        label: "Fuel Type",
        value: "Petrol",
      },
      {
        label: "Year",
        value: "2022",
      },
      {
        label: "KM Driven",
        value: "15,500 km",
      },
      {
        label: "Owner",
        value: "First Owner",
      },
    ],

    seller: {
      name: "Rajesh Sharma",
      verified: true,
      memberSince: "Member since 2022",
      rating: "4.8",
      reviews: "126",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
  };

  const similarProducts = [
    {
      id: 1,
      title: "Honda City VX 2021",
      price: "₹ 7,95,000",
      image:
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      title: "Honda City V 2022",
      price: "₹ 7,50,000",
      image:
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      title: "Hyundai Verna 2022",
      price: "₹ 9,25,000",
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      title: "Honda City ZX 2023",
      price: "₹ 9,75,000",
      image:
        "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=500&q=80",
    },
  ];

  const handleOffer = () => {
    console.log("Make an offer");
  };

  const handleChat = () => {
    console.log("Chat with seller");
  };

  return React.createElement(
    "div",
    { className: "product-details-page" },

    /* =========================
       BREADCRUMB
    ========================= */

    React.createElement(
      "div",
      { className: "product-breadcrumb" },

      React.createElement(
        "span",
        null,
        "Home"
      ),

      React.createElement("i", {
        className: "fa-solid fa-chevron-right",
      }),

      React.createElement(
        "span",
        null,
        "Vehicles"
      ),

      React.createElement("i", {
        className: "fa-solid fa-chevron-right",
      }),

      React.createElement(
        "span",
        null,
        "Honda Cars"
      ),

      React.createElement("i", {
        className: "fa-solid fa-chevron-right",
      }),

      React.createElement(
        "strong",
        null,
        "Honda City ZX"
      )
    ),

    /* =========================
       PRODUCT MAIN
    ========================= */

    React.createElement(
      "section",
      { className: "product-main-section" },

      /* LEFT */

      React.createElement(
        "div",
        { className: "product-left" },

        /* Image Gallery */

        React.createElement(
          "div",
          { className: "product-gallery" },

          React.createElement("img", {
            src: product.images[selectedImage],
            alt: product.title,
            className: "product-main-image",
          }),

          React.createElement(
            "div",
            { className: "product-thumbnails" },

            product.images.map((image, index) =>
              React.createElement(
                "button",
                {
                  key: image,
                  type: "button",
                  className: `product-thumbnail ${
                    selectedImage === index
                      ? "selected"
                      : ""
                  }`,
                  onClick: () =>
                    setSelectedImage(index),
                },

                React.createElement("img", {
                  src: image,
                  alt: `Product ${index + 1}`,
                })
              )
            )
          )
        ),

        /* Description */

        React.createElement(
          "div",
          { className: "product-info-box" },

          React.createElement(
            "h2",
            null,
            "Description"
          ),

          React.createElement(
            "p",
            null,
            product.description
          )
        ),

        /* Specifications */

        React.createElement(
          "div",
          { className: "product-info-box specifications-box" },

          React.createElement(
            "h2",
            null,
            "Specifications"
          ),

          React.createElement(
            "div",
            { className: "specifications-grid" },

            product.specifications.map(
              (specification) =>
                React.createElement(
                  "div",
                  {
                    key: specification.label,
                    className: "specification-item",
                  },

                  React.createElement(
                    "span",
                    null,
                    specification.label
                  ),

                  React.createElement(
                    "strong",
                    null,
                    specification.value
                  )
                )
            )
          )
        )
      ),

      /* RIGHT */

      React.createElement(
        "aside",
        { className: "product-right" },

        /* Product Summary */

        React.createElement(
          "div",
          { className: "product-summary-card" },

          React.createElement(
            "div",
            { className: "product-price-row" },

            React.createElement(
              "h1",
              null,
              product.price
            ),

            React.createElement("i", {
              className: "fa-regular fa-heart",
            })
          ),

          React.createElement(
            "h2",
            null,
            product.title
          ),

          React.createElement(
            "div",
            { className: "product-location-row" },

            React.createElement("i", {
              className: "fa-solid fa-location-dot",
            }),

            React.createElement(
              "span",
              null,
              product.location
            ),

            React.createElement(
              "time",
              null,
              product.posted
            )
          )
        ),

        /* Seller */

        React.createElement(
          "div",
          { className: "seller-card" },

          React.createElement(
            "h3",
            null,
            "Seller Profile"
          ),

          React.createElement(
            "div",
            { className: "seller-profile" },

            React.createElement("img", {
              src: product.seller.image,
              alt: product.seller.name,
            }),

            React.createElement(
              "div",
              { className: "seller-details" },

              React.createElement(
                "div",
                { className: "seller-name" },

                React.createElement(
                  "strong",
                  null,
                  product.seller.name
                ),

                product.seller.verified &&
                  React.createElement("i", {
                    className:
                      "fa-solid fa-circle-check",
                  })
              ),

              React.createElement(
                "span",
                null,
                product.seller.memberSince
              ),

              React.createElement(
                "div",
                { className: "seller-rating" },

                React.createElement("i", {
                  className: "fa-solid fa-star",
                }),

                `${product.seller.rating} (${product.seller.reviews})`
              )
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: "chat-seller-button",
              onClick: handleChat,
            },

            React.createElement("i", {
              className: "fa-regular fa-message",
            }),

            "CHAT WITH SELLER"
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: "offer-button",
              onClick: handleOffer,
            },
            "MAKE AN OFFER"
          )
        ),

        /* Safety */

        React.createElement(
          "div",
          { className: "safety-card" },

          React.createElement(
            "h3",
            null,

            React.createElement("i", {
              className:
                "fa-solid fa-circle-info",
            }),

            " Safety Tips for Buyers"
          ),

          React.createElement(
            "ul",
            null,

            React.createElement(
              "li",
              null,
              "Meet the seller in a public place."
            ),

            React.createElement(
              "li",
              null,
              "Check the product thoroughly before paying."
            ),

            React.createElement(
              "li",
              null,
              "Avoid making advance payments."
            )
          )
        )
      )
    ),

    /* =========================
       SIMILAR PRODUCTS
    ========================= */

    React.createElement(
      "section",
      { className: "similar-section" },

      React.createElement(
        "div",
        { className: "similar-container" },

        React.createElement(
          "h2",
          null,
          "Similar Recommendations"
        ),

        React.createElement(
          "div",
          { className: "similar-grid" },

          similarProducts.map((item) =>
            React.createElement(
              "article",
              {
                key: item.id,
                className: "similar-card",
              },

              React.createElement("img", {
                src: item.image,
                alt: item.title,
              }),

              React.createElement(
                "div",
                { className: "similar-card-info" },

                React.createElement(
                  "strong",
                  null,
                  item.price
                ),

                React.createElement(
                  "span",
                  null,
                  item.title
                )
              )
            )
          )
        )
      )
    )
  );
}

export default ProductDetails;
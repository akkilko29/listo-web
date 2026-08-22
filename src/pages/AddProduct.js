import React, { useState } from "react";

function AddProduct() {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    const selectedImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((previous) => [
      ...previous,
      ...selectedImages,
    ]);
  };

  const removeImage = (index) => {
    setImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const productData = {
      images,
      category,
      title,
      description,
      price,
      location,
    };

    console.log("Product:", productData);
  };

  return React.createElement(
    "main",
    { className: "add-product-page" },

    React.createElement(
      "div",
      { className: "add-product-container" },

      /* =========================
         PAGE HEADER
      ========================= */

      React.createElement(
        "div",
        { className: "add-product-header" },

        React.createElement(
          "h1",
          null,
          "Post Your Ad"
        ),

        React.createElement(
          "p",
          null,
          "Sell your product quickly and easily on Listo."
        )
      ),

      /* =========================
         FORM
      ========================= */

      React.createElement(
        "form",
        {
          className: "add-product-form",
          onSubmit: handleSubmit,
        },

        /* =========================
           PHOTOS
        ========================= */

        React.createElement(
          "section",
          { className: "product-form-section" },

          React.createElement(
            "h2",
            null,
            "Product Photos"
          ),

          React.createElement(
            "p",
            { className: "section-description" },
            "Add up to 8 photos. The first photo will be your main image."
          ),

          React.createElement(
            "div",
            { className: "product-image-grid" },

            images.map((image, index) =>
              React.createElement(
                "div",
                {
                  className: "product-image-preview",
                  key: index,
                },

                React.createElement("img", {
                  src: image.preview,
                  alt: "Product",
                }),

                React.createElement(
                  "button",
                  {
                    type: "button",
                    className: "remove-image-button",
                    onClick: () => removeImage(index),
                  },

                  React.createElement("i", {
                    className: "fa-solid fa-xmark",
                  })
                ),

                index === 0 &&
                  React.createElement(
                    "span",
                    { className: "main-image-label" },
                    "Main"
                  )
              )
            ),

            images.length < 8 &&
              React.createElement(
                "label",
                { className: "add-image-box" },

                React.createElement("i", {
                  className: "fa-solid fa-camera",
                }),

                React.createElement(
                  "span",
                  null,
                  "Add Photos"
                ),

                React.createElement(
                  "small",
                  null,
                  `${images.length}/8`
                ),

                React.createElement("input", {
                  type: "file",
                  accept: "image/*",
                  multiple: true,
                  onChange: handleImageChange,
                })
              )
          )
        ),

        /* =========================
           CATEGORY
        ========================= */

        React.createElement(
          "section",
          { className: "product-form-section" },

          React.createElement(
            "h2",
            null,
            "Product Information"
          ),

          React.createElement(
            "div",
            { className: "form-field" },

            React.createElement(
              "label",
              { htmlFor: "category" },
              "Category ",
              React.createElement(
                "span",
                { className: "required" },
                "*"
              )
            ),

            React.createElement(
              "select",
              {
                id: "category",
                value: category,
                onChange: (event) =>
                  setCategory(event.target.value),
                required: true,
              },

              React.createElement(
                "option",
                {
                  value: "",
                },
                "Select Category"
              ),

              React.createElement(
                "option",
                { value: "cars" },
                "Cars & Vehicles"
              ),

              React.createElement(
                "option",
                { value: "mobile" },
                "Mobiles & Tablets"
              ),

              React.createElement(
                "option",
                { value: "electronics" },
                "Electronics"
              ),

              React.createElement(
                "option",
                { value: "real-estate" },
                "Real Estate"
              ),

              React.createElement(
                "option",
                { value: "furniture" },
                "Furniture"
              ),

              React.createElement(
                "option",
                { value: "fashion" },
                "Fashion"
              ),

              React.createElement(
                "option",
                { value: "jobs" },
                "Jobs & Services"
              )
            )
          ),

          /* Title */

          React.createElement(
            "div",
            { className: "form-field" },

            React.createElement(
              "label",
              { htmlFor: "productTitle" },
              "Product Title ",
              React.createElement(
                "span",
                { className: "required" },
                "*"
              )
            ),

            React.createElement("input", {
              id: "productTitle",
              type: "text",
              value: title,
              onChange: (event) =>
                setTitle(event.target.value),
              placeholder: "e.g. iPhone 15 Pro Max 256GB",
              maxLength: 100,
              required: true,
            })
          ),

          /* Description */

          React.createElement(
            "div",
            { className: "form-field" },

            React.createElement(
              "label",
              { htmlFor: "description" },
              "Description ",
              React.createElement(
                "span",
                { className: "required" },
                "*"
              )
            ),

            React.createElement("textarea", {
              id: "description",
              value: description,
              onChange: (event) =>
                setDescription(event.target.value),
              placeholder:
                "Describe your product, condition, features and other important details...",
              rows: 6,
              maxLength: 2000,
              required: true,
            }),

            React.createElement(
              "small",
              { className: "character-count" },
              `${description.length}/2000`
            )
          )
        ),

        /* =========================
           PRICE
        ========================= */

        React.createElement(
          "section",
          { className: "product-form-section" },

          React.createElement(
            "h2",
            null,
            "Pricing"
          ),

          React.createElement(
            "div",
            { className: "form-field" },

            React.createElement(
              "label",
              { htmlFor: "price" },
              "Price ",
              React.createElement(
                "span",
                { className: "required" },
                "*"
              )
            ),

            React.createElement(
              "div",
              { className: "price-input" },

              React.createElement(
                "span",
                null,
                "₹"
              ),

              React.createElement("input", {
                id: "price",
                type: "number",
                value: price,
                onChange: (event) =>
                  setPrice(event.target.value),
                placeholder: "Enter price",
                min: "0",
                required: true,
              })
            )
          )
        ),

        /* =========================
           LOCATION
        ========================= */

        React.createElement(
          "section",
          { className: "product-form-section" },

          React.createElement(
            "h2",
            null,
            "Location"
          ),

          React.createElement(
            "div",
            { className: "form-field" },

            React.createElement(
              "label",
              { htmlFor: "location" },
              "Location ",
              React.createElement(
                "span",
                { className: "required" },
                "*"
              )
            ),

            React.createElement(
              "div",
              { className: "location-input" },

              React.createElement("i", {
                className: "fa-solid fa-location-dot",
              }),

              React.createElement("input", {
                id: "location",
                type: "text",
                value: location,
                onChange: (event) =>
                  setLocation(event.target.value),
                placeholder: "Enter your city or locality",
                required: true,
              })
            )
          )
        ),

        /* =========================
           SUBMIT
        ========================= */

        React.createElement(
          "div",
          { className: "add-product-actions" },

          React.createElement(
            "button",
            {
              type: "button",
              className: "cancel-product-button",
            },
            "CANCEL"
          ),

          React.createElement(
            "button",
            {
              type: "submit",
              className: "post-product-button",
            },

            React.createElement("i", {
              className: "fa-solid fa-paper-plane",
            }),

            " POST AD"
          )
        )
      )
    )
  );
}

export default AddProduct;
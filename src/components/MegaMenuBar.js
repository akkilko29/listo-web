import React, { useEffect, useRef, useState } from "react";

function MegaMenuBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");

  const menuRef = useRef(null);

  const categories = [
    {
      name: "All Categories",
      icon: "fa-solid fa-table-cells-large",
      subCategories: [],
    },
    {
      name: "Cars",
      icon: "fa-solid fa-car",
      subCategories: [
        "Cars",
        "SUVs",
        "Sedans",
        "Hatchbacks",
        "Luxury Cars",
        "Electric Cars",
        "Commercial Vehicles",
        "Car Accessories",
      ],
    },
    {
      name: "Properties",
      icon: "fa-solid fa-house",
      subCategories: [
        "Apartments",
        "Flats",
        "Houses",
        "Villas",
        "Plots & Land",
        "Commercial Property",
        "PG & Hostels",
        "Office Space",
      ],
    },
    {
      name: "Mobiles",
      icon: "fa-solid fa-mobile-screen-button",
      subCategories: [
        "Mobile Phones",
        "iPhones",
        "Samsung",
        "OnePlus",
        "Xiaomi",
        "Google Pixel",
        "Mobile Accessories",
        "Tablets",
      ],
    },
    {
      name: "Jobs",
      icon: "fa-solid fa-briefcase",
      subCategories: [
        "IT & Software",
        "Sales",
        "Marketing",
        "Finance",
        "Customer Service",
        "Delivery Jobs",
        "Part Time Jobs",
        "Work From Home",
      ],
    },
    {
      name: "Electronics",
      icon: "fa-solid fa-laptop",
      subCategories: [
        "Laptops",
        "Desktop Computers",
        "TVs",
        "Cameras",
        "Gaming Consoles",
        "Speakers",
        "Printers",
        "Computer Accessories",
      ],
    },
    {
      name: "Fashion",
      icon: "fa-solid fa-shirt",
      subCategories: [
        "Men's Clothing",
        "Women's Clothing",
        "Kids Clothing",
        "Shoes",
        "Watches",
        "Bags",
        "Jewellery",
        "Fashion Accessories",
      ],
    },
    {
      name: "Bikes",
      icon: "fa-solid fa-motorcycle",
      subCategories: [
        "Motorcycles",
        "Scooters",
        "Electric Bikes",
        "Sports Bikes",
        "Cruiser Bikes",
        "Bicycle",
        "Bike Accessories",
        "Spare Parts",
      ],
    },
    {
      name: "Books",
      icon: "fa-solid fa-book",
      subCategories: [
        "Academic Books",
        "Competitive Exams",
        "Fiction",
        "Non Fiction",
        "Children's Books",
        "Comics",
        "Magazines",
        "Other Books",
      ],
    },
    {
      name: "Services",
      icon: "fa-solid fa-screwdriver-wrench",
      subCategories: [
        "Home Services",
        "Repair Services",
        "Cleaning Services",
        "Beauty Services",
        "Tutors",
        "Moving Services",
        "Event Services",
        "Other Services",
      ],
    },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleCategoryClick = (category) => {
    setActiveCategory(category.name);

    if (category.name === "All Categories") {
      setMenuOpen(!menuOpen);
      return;
    }

    setMenuOpen(true);
  };

  const handleSubCategoryClick = (category, subCategory) => {
    console.log(
      "Selected:",
      category,
      "→",
      subCategory
    );

    // Later we can navigate to:
    // /search?category=Cars&subcategory=SUVs
  };

  const activeCategoryData =
    categories.find(
      (category) => category.name === activeCategory
    ) || categories[0];

  return React.createElement(
    "nav",
    {
      className: "mega-menu-bar",
      ref: menuRef,
    },

    /* =========================
       CATEGORY BAR
    ========================= */

    React.createElement(
      "div",
      { className: "mega-menu-container" },

      categories.map((category) =>
        React.createElement(
          "button",
          {
            key: category.name,
            type: "button",
            className: `mega-menu-item ${
              activeCategory === category.name
                ? "active"
                : ""
            }`,
            onClick: () =>
              handleCategoryClick(category),
            onMouseEnter: () => {
              if (
                menuOpen &&
                category.name !== "All Categories"
              ) {
                setActiveCategory(category.name);
              }
            },
          },

          React.createElement("i", {
            className: category.icon,
          }),

          React.createElement(
            "span",
            null,
            category.name
          ),

          category.name === "All Categories" &&
            React.createElement("i", {
              className: `fa-solid ${
                menuOpen
                  ? "fa-chevron-up"
                  : "fa-chevron-down"
              } all-category-arrow`,
            })
        )
      )
    ),

    /* =========================
       MEGA MENU
    ========================= */

    menuOpen &&
      React.createElement(
        "div",
        { className: "mega-dropdown" },

        /* Left */

        React.createElement(
          "div",
          { className: "mega-sidebar" },

          React.createElement(
            "div",
            { className: "mega-sidebar-title" },
            "Categories"
          ),

          categories
            .filter(
              (category) =>
                category.name !== "All Categories"
            )
            .map((category) =>
              React.createElement(
                "button",
                {
                  key: category.name,
                  type: "button",
                  className: `mega-sidebar-item ${
                    activeCategory === category.name
                      ? "selected"
                      : ""
                  }`,
                  onMouseEnter: () =>
                    setActiveCategory(category.name),
                  onClick: () =>
                    setActiveCategory(category.name),
                },

                React.createElement("i", {
                  className: category.icon,
                }),

                React.createElement(
                  "span",
                  null,
                  category.name
                ),

                React.createElement("i", {
                  className:
                    "fa-solid fa-chevron-right",
                })
              )
            )
        ),

        /* Right */

        React.createElement(
          "div",
          { className: "mega-content" },

          React.createElement(
            "div",
            { className: "mega-content-header" },

            React.createElement(
              "div",
              null,

              React.createElement(
                "h3",
                null,
                activeCategoryData.name
              ),

              React.createElement(
                "p",
                null,
                `Explore ${activeCategoryData.name.toLowerCase()} listings`
              )
            ),

            React.createElement(
              "button",
              {
                type: "button",
                className: "view-all-button",
                onClick: () =>
                  console.log(
                    "View all:",
                    activeCategoryData.name
                  ),
              },
              "View All"
            )
          ),

          React.createElement(
            "div",
            { className: "mega-subcategories" },

            activeCategoryData.subCategories.length > 0
              ? activeCategoryData.subCategories.map(
                  (subCategory) =>
                    React.createElement(
                      "button",
                      {
                        key: subCategory,
                        type: "button",
                        className:
                          "mega-subcategory",
                        onClick: () =>
                          handleSubCategoryClick(
                            activeCategoryData.name,
                            subCategory
                          ),
                      },

                      React.createElement(
                        "span",
                        null,
                        subCategory
                      ),

                      React.createElement("i", {
                        className:
                          "fa-solid fa-chevron-right",
                      })
                    )
                )
              : React.createElement(
                  "div",
                  {
                    className:
                      "mega-all-categories",
                  },

                  React.createElement("i", {
                    className:
                      "fa-solid fa-layer-group",
                  }),

                  React.createElement(
                    "div",
                    null,

                    React.createElement(
                      "strong",
                      null,
                      "Browse All Categories"
                    ),

                    React.createElement(
                      "p",
                      null,
                      "Find everything you need on Listo."
                    )
                  )
                )
          )
        )
      )
  );
}

export default MegaMenuBar;
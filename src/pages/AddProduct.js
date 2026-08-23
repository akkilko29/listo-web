import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  formatLocationLabel,
  useAppLocation,
} from "../context/LocationContext";
import {
  getCategories,
  getCategoryAttributes,
  getSubcategoriesByCategory,
  getSubcategoryAttributes,
} from "../services/categoryService";
import {
  createProduct,
  getProductById,
  updateProduct,
  uploadProductImages,
} from "../services/productService";

const CONDITIONS = [
  { value: "NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

function attributeInputType(dataType) {
  const type = String(dataType || "TEXT").toUpperCase();
  if (type === "NUMBER" || type === "DECIMAL" || type === "INTEGER") {
    return "number";
  }
  return "text";
}

function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { location: globalLocation, city: headerCity, state: headerState } =
    useAppLocation();
  const isEdit = Boolean(id);

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [attributeValues, setAttributeValues] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data.filter((item) => item.active !== false));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!categoryId) {
      setSubcategories([]);
      return undefined;
    }

    getSubcategoriesByCategory(categoryId)
      .then((data) => {
        if (!cancelled) {
          setSubcategories(data.filter((item) => item.active !== false));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSubcategories([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;

    if (!categoryId) {
      setAttributes([]);
      return undefined;
    }

    const loader = subCategoryId
      ? getSubcategoryAttributes(categoryId, subCategoryId)
      : getCategoryAttributes(categoryId);

    loader
      .then((data) => {
        if (cancelled) {
          return;
        }

        setAttributes(
          data
            .filter((item) => item.active !== false)
            .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setAttributes([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, subCategoryId]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    getProductById(id)
      .then((product) => {
        if (cancelled) {
          return;
        }

        if (!product) {
          setError("Listing not found");
          return;
        }

        setTitle(product.title || "");
        setDescription(product.description || "");
        setPrice(String(product.priceValue || ""));
        setCondition(
          product.condition === "USED" ? "GOOD" : product.condition || "GOOD"
        );
        setCategoryId(product.categoryId ? String(product.categoryId) : "");
        setSubCategoryId(product.subCategoryId ? String(product.subCategoryId) : "");
        setAttributeValues(
          (product.attributes || []).reduce((values, item) => {
            if (item.attributeId) {
              values[item.attributeId] = item.value || "";
            }
            return values;
          }, {})
        );
        setImages(
          (product.images || []).map((url) => ({
            preview: url,
            file: null,
            existing: true,
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load listing");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    const selectedImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      existing: false,
    }));

    setImages((previous) => [...previous, ...selectedImages].slice(0, 8));
    event.target.value = "";
  };

  const removeImage = (index) => {
    setImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const handleCategoryChange = (event) => {
    setCategoryId(event.target.value);
    setSubCategoryId("");
    setAttributeValues({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const missingRequired = attributes.filter(
      (attribute) =>
        attribute.required && !String(attributeValues[attribute.id] || "").trim()
    );

    if (missingRequired.length > 0) {
      setError(`Please fill ${missingRequired.map((item) => item.name).join(", ")}`);
      return;
    }

    if (!headerCity || !headerState) {
      setError("Select a city and state from the header location picker");
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      description,
      price,
      condition,
      city: headerCity,
      state: headerState,
      categoryId,
      subCategoryId,
      attributes: attributes.map((attribute) => ({
        attributeId: attribute.id,
        value: attributeValues[attribute.id] || "",
      })),
    };

    try {
      const saved = isEdit
        ? await updateProduct(id, payload)
        : await createProduct(payload);

      const filesToUpload = images
        .map((image) => image.file)
        .filter(Boolean);

      if (filesToUpload.length > 0) {
        await uploadProductImages(saved.id, filesToUpload);
      }

      navigate(`/product/${saved.id}`);
    } catch (err) {
      setError(err.message || "Unable to save listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return React.createElement(
      "main",
      { className: "add-product-page" },
      React.createElement("p", { className: "add-product-status" }, "Loading listing...")
    );
  }

  if (isEdit && error && !title) {
    return React.createElement(
      "main",
      { className: "add-product-page" },
      React.createElement("p", { className: "add-product-error" }, error)
    );
  }

  return React.createElement(
    "main",
    { className: "add-product-page" },

    React.createElement(
      "div",
      { className: "add-product-container" },

      React.createElement(
        "div",
        { className: "add-product-header" },
        React.createElement("h1", null, isEdit ? "Edit Your Ad" : "Post Your Ad"),
        React.createElement(
          "p",
          null,
          "Sell your product quickly and easily on Listo."
        )
      ),

      error &&
        React.createElement("div", { className: "add-product-error" }, error),

      React.createElement(
        "form",
        {
          className: "add-product-form",
          onSubmit: handleSubmit,
        },

        React.createElement(
          "section",
          { className: "product-form-section" },
          React.createElement("h2", null, "Product Photos"),
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
                { className: "product-image-preview", key: `${image.preview}-${index}` },
                React.createElement("img", { src: image.preview, alt: "Product" }),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    className: "remove-image-button",
                    onClick: () => removeImage(index),
                  },
                  React.createElement("i", { className: "fa-solid fa-xmark" })
                ),
                index === 0 &&
                  React.createElement("span", { className: "main-image-label" }, "Main")
              )
            ),
            images.length < 8 &&
              React.createElement(
                "label",
                { className: "add-image-box" },
                React.createElement("i", { className: "fa-solid fa-camera" }),
                React.createElement("span", null, "Add Photos"),
                React.createElement("small", null, `${images.length}/8`),
                React.createElement("input", {
                  type: "file",
                  accept: "image/*",
                  multiple: true,
                  onChange: handleImageChange,
                })
              )
          )
        ),

        React.createElement(
          "section",
          { className: "product-form-section" },
          React.createElement("h2", null, "Category"),
          React.createElement(
            "p",
            { className: "section-description" },
            "Choose a category and subcategory. Matching attributes will appear below."
          ),
          React.createElement(
            "div",
            { className: "form-row" },
            React.createElement(
              "div",
              { className: "form-field" },
              React.createElement(
                "label",
                { htmlFor: "category" },
                "Category ",
                React.createElement("span", { className: "required" }, "*")
              ),
              React.createElement(
                "select",
                {
                  id: "category",
                  value: categoryId,
                  onChange: handleCategoryChange,
                  required: true,
                },
                React.createElement("option", { value: "" }, "Select Category"),
                categories.map((item) =>
                  React.createElement(
                    "option",
                    { key: item.id, value: item.id },
                    item.name
                  )
                )
              )
            ),
            React.createElement(
              "div",
              { className: "form-field" },
              React.createElement(
                "label",
                { htmlFor: "subcategory" },
                "Subcategory ",
                React.createElement("span", { className: "required" }, "*")
              ),
              React.createElement(
                "select",
                {
                  id: "subcategory",
                  value: subCategoryId,
                  onChange: (event) => {
                    setSubCategoryId(event.target.value);
                    setAttributeValues({});
                  },
                  required: true,
                  disabled: !categoryId,
                },
                React.createElement("option", { value: "" }, "Select Subcategory"),
                subcategories.map((item) =>
                  React.createElement(
                    "option",
                    { key: item.id, value: item.id },
                    item.name
                  )
                )
              )
            )
          ),
          attributes.length > 0 &&
            React.createElement(
              "div",
              { className: "attribute-grid" },
              attributes.map((attribute) =>
                React.createElement(
                  "div",
                  { className: "form-field", key: attribute.id },
                  React.createElement(
                    "label",
                    { htmlFor: `attribute-${attribute.id}` },
                    attribute.name,
                    " ",
                    attribute.required &&
                      React.createElement("span", { className: "required" }, "*")
                  ),
                  String(attribute.dataType || "").toUpperCase() === "BOOLEAN"
                    ? React.createElement(
                        "select",
                        {
                          id: `attribute-${attribute.id}`,
                          value: attributeValues[attribute.id] || "",
                          required: Boolean(attribute.required),
                          onChange: (event) =>
                            setAttributeValues((previous) => ({
                              ...previous,
                              [attribute.id]: event.target.value,
                            })),
                        },
                        React.createElement("option", { value: "" }, "Select"),
                        React.createElement("option", { value: "true" }, "Yes"),
                        React.createElement("option", { value: "false" }, "No")
                      )
                    : React.createElement("input", {
                        id: `attribute-${attribute.id}`,
                        type: attributeInputType(attribute.dataType),
                        value: attributeValues[attribute.id] || "",
                        required: Boolean(attribute.required),
                        placeholder: attribute.name,
                        onChange: (event) =>
                          setAttributeValues((previous) => ({
                            ...previous,
                            [attribute.id]: event.target.value,
                          })),
                      })
                )
              )
            )
        ),

        React.createElement(
          "section",
          { className: "product-form-section" },
          React.createElement("h2", null, "Product Information"),
          React.createElement(
            "div",
            { className: "form-field" },
            React.createElement(
              "label",
              { htmlFor: "productTitle" },
              "Product Title ",
              React.createElement("span", { className: "required" }, "*")
            ),
            React.createElement("input", {
              id: "productTitle",
              type: "text",
              value: title,
              onChange: (event) => setTitle(event.target.value),
              placeholder: "e.g. Honda City 2018",
              maxLength: 100,
              required: true,
            })
          ),
          React.createElement(
            "div",
            { className: "form-field" },
            React.createElement(
              "label",
              { htmlFor: "description" },
              "Description ",
              React.createElement("span", { className: "required" }, "*")
            ),
            React.createElement("textarea", {
              id: "description",
              value: description,
              onChange: (event) => setDescription(event.target.value),
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

        React.createElement(
          "section",
          { className: "product-form-section" },
          React.createElement("h2", null, "Pricing & Condition"),
          React.createElement(
            "div",
            { className: "form-row" },
            React.createElement(
              "div",
              { className: "form-field" },
              React.createElement(
                "label",
                { htmlFor: "price" },
                "Price ",
                React.createElement("span", { className: "required" }, "*")
              ),
              React.createElement(
                "div",
                { className: "price-input" },
                React.createElement("span", null, "₹"),
                React.createElement("input", {
                  id: "price",
                  type: "number",
                  value: price,
                  onChange: (event) => setPrice(event.target.value),
                  placeholder: "Enter price",
                  min: "0",
                  required: true,
                })
              )
            ),
            React.createElement(
              "div",
              { className: "form-field" },
              React.createElement(
                "label",
                { htmlFor: "condition" },
                "Condition ",
                React.createElement("span", { className: "required" }, "*")
              ),
              React.createElement(
                "select",
                {
                  id: "condition",
                  value: condition,
                  onChange: (event) => setCondition(event.target.value),
                  required: true,
                },
                CONDITIONS.map((item) =>
                  React.createElement(
                    "option",
                    { key: item.value, value: item.value },
                    item.label
                  )
                )
              )
            )
          )
        ),

        React.createElement(
          "section",
          { className: "product-form-section" },
          React.createElement("h2", null, "Location"),
          React.createElement(
            "p",
            { className: "section-description" },
            globalLocation
              ? `This listing will use ${formatLocationLabel(headerCity, headerState) || globalLocation}. Change it from the header location picker.`
              : "Choose a city from the header location picker before posting."
          ),
          React.createElement(
            "div",
            { className: "form-row" },
            React.createElement(
              "div",
              { className: "form-field" },
              React.createElement(
                "label",
                { htmlFor: "listing-city" },
                "City ",
                React.createElement("span", { className: "required" }, "*")
              ),
              React.createElement(
                "div",
                { className: "location-input" },
                React.createElement("i", { className: "fa-solid fa-location-dot" }),
                React.createElement("input", {
                  id: "listing-city",
                  type: "text",
                  value: headerCity,
                  readOnly: true,
                  placeholder: "Select from header",
                  required: true,
                })
              )
            ),
            React.createElement(
              "div",
              { className: "form-field" },
              React.createElement(
                "label",
                { htmlFor: "listing-state" },
                "State ",
                React.createElement("span", { className: "required" }, "*")
              ),
              React.createElement("input", {
                id: "listing-state",
                type: "text",
                value: headerState,
                readOnly: true,
                placeholder: "Select from header",
                required: true,
              })
            )
          )
        ),

        React.createElement(
          "div",
          { className: "add-product-actions" },
          React.createElement(
            "button",
            {
              type: "button",
              className: "cancel-product-button",
              onClick: () => navigate(isEdit ? `/product/${id}` : "/"),
            },
            "CANCEL"
          ),
          React.createElement(
            "button",
            {
              type: "submit",
              className: "post-product-button",
              disabled: submitting,
            },
            React.createElement("i", { className: "fa-solid fa-paper-plane" }),
            submitting
              ? isEdit
                ? " SAVING..."
                : " POSTING..."
              : isEdit
                ? " SAVE CHANGES"
                : " POST AD"
          )
        )
      )
    )
  );
}

export default AddProduct;

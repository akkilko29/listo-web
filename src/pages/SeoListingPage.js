import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getCategories,
  getSubcategoriesByCategory,
} from "../services/categoryService";
import { applySeo } from "../seo/applySeo";
import {
  breadcrumbList,
  categoryHref,
  findCategoryBySlug,
  findPopularLocationBySlug,
  findSubcategoryBySlug,
  listingSeoCopy,
  locationCategoryHref,
  locationHref,
  subcategoryHref,
} from "../seo/seoRoutes";
import ProductListing from "./ProductListing";

function notFoundView(message) {
  return React.createElement(
    "main",
    { className: "product-listing-page" },
    React.createElement(
      "div",
      { className: "listing-content" },
      React.createElement("h1", { className: "listing-results-title" }, "Page not found"),
      React.createElement("p", { className: "listings-status" }, message),
      React.createElement(Link, { to: "/listings" }, "Browse listings")
    )
  );
}

function SeoListingPage({ mode }) {
  const params = useParams();
  const [seoContext, setSeoContext] = useState(null);
  const [notFound, setNotFound] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setLoading(true);
      setNotFound("");
      setSeoContext(null);

      try {
        const categories = await getCategories();

        if (mode === "category" || mode === "subcategory") {
          const category = findCategoryBySlug(categories, params.categorySlug);
          if (!category) {
            if (!cancelled) {
              setNotFound("This category is not available.");
            }
            return;
          }

          if (mode === "category") {
            const copy = listingSeoCopy({ categoryName: category.name });
            const path = categoryHref(category);
            if (!cancelled) {
              setSeoContext({
                mode,
                category,
                canonicalPath: path,
                ...copy,
                breadcrumb: breadcrumbList([
                  { name: "Home", path: "/" },
                  { name: category.name, path },
                ]),
              });
            }
            return;
          }

          const subcategories = await getSubcategoriesByCategory(category.id);
          const subcategory = findSubcategoryBySlug(
            subcategories,
            params.subcategorySlug
          );

          if (!subcategory) {
            if (!cancelled) {
              setNotFound("This subcategory is not available.");
            }
            return;
          }

          const copy = listingSeoCopy({
            categoryName: category.name,
            subcategoryName: subcategory.name,
          });
          const path = subcategoryHref(category, subcategory);
          if (!cancelled) {
            setSeoContext({
              mode,
              category,
              subcategory,
              canonicalPath: path,
              ...copy,
              breadcrumb: breadcrumbList([
                { name: "Home", path: "/" },
                { name: category.name, path: categoryHref(category) },
                { name: subcategory.name, path },
              ]),
            });
          }
          return;
        }

        const place = findPopularLocationBySlug(params.citySlug);
        if (!place) {
          if (!cancelled) {
            setNotFound("This location page is not available.");
          }
          return;
        }

        if (mode === "location") {
          const copy = listingSeoCopy({ cityName: place.city });
          const path = locationHref(place.label);
          if (!cancelled) {
            setSeoContext({
              mode,
              locationLabel: place.label,
              cityName: place.city,
              canonicalPath: path,
              ...copy,
              breadcrumb: breadcrumbList([
                { name: "Home", path: "/" },
                { name: place.city, path },
              ]),
            });
          }
          return;
        }

        const category = findCategoryBySlug(categories, params.categorySlug);
        if (!category) {
          if (!cancelled) {
            setNotFound("This category is not available.");
          }
          return;
        }

        const copy = listingSeoCopy({
          categoryName: category.name,
          cityName: place.city,
        });
        const path = locationCategoryHref(place.label, category);
        if (!cancelled) {
          setSeoContext({
            mode,
            category,
            locationLabel: place.label,
            cityName: place.city,
            canonicalPath: path,
            ...copy,
            breadcrumb: breadcrumbList([
              { name: "Home", path: "/" },
              { name: place.city, path: locationHref(place.label) },
              { name: category.name, path },
            ]),
          });
        }
      } catch {
        if (!cancelled) {
          setNotFound("Unable to load this page.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [mode, params.categorySlug, params.subcategorySlug, params.citySlug]);

  useEffect(() => {
    if (notFound) {
      applySeo({
        title: "Page not found | LISTO",
        description: "This LISTO page is not available.",
        path: window.location.pathname,
        noIndex: true,
      });
    }
  }, [notFound]);

  if (loading) {
    return React.createElement(
      "main",
      { className: "product-listing-page" },
      React.createElement("p", { className: "listings-status" }, "Loading listings...")
    );
  }

  if (notFound || !seoContext) {
    return notFoundView(notFound || "This page is not available.");
  }

  return React.createElement(ProductListing, { seoContext });
}

export default SeoListingPage;

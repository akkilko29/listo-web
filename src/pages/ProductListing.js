import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, useParams, useLocation } from "react-router-dom";

import {
  filterProductsPage,
  fromApiCondition,
  toApiCondition,
} from "../services/productService";
import {
  attachAttributeOptions,
  getCategories,
  getCategoryAttributes,
  getSubcategoriesByCategory,
  getSubcategoryAttributes,
  isSelectAttribute,
} from "../services/categoryService";
import { isFavorite, ensureFavoritesLoaded, toggleFavorite } from "../services/favoriteService";
import { useAuth } from "../context/AuthContext";
import { appendLocationParam, useAppLocation } from "../context/LocationContext";
import { POPULAR_LOCATIONS } from "../data/popularLocations";
import { applySeo, canonicalPath } from "../seo/applySeo";
import { breadcrumbJsonLd } from "../seo/breadcrumbJsonLd";
import { absoluteUrl } from "../config/seoConfig";
import {
  findPopularLocationBySlug,
  seoListingPath,
} from "../seo/seoPaths";
import {
  resolveCategoryBySlug,
  resolveSubcategoryBySlug,
} from "../services/seoTaxonomy";
import "../style/ProductListing.css";

const PAGE_SIZE = 10;

const RESERVED_PARAMS = new Set([
  "keyword",
  "category",
  "categoryId",
  "subcategory",
  "subCategoryId",
  "location",
  "minPrice",
  "maxPrice",
  "condition",
  "sort",
  "page",
  "size",
  "attribute",
  "attributeId",
  "attributeValue",
]);

function getAttributeQuery(searchParams) {
  const attributes = {};

  searchParams.forEach((value, key) => {
    if (!RESERVED_PARAMS.has(key) && String(value).trim()) {
      attributes[key] = value;
    }
  });

  const legacySlug = searchParams.get("attribute");
  const legacyValue = searchParams.get("attributeValue");

  if (legacySlug && legacyValue && !attributes[legacySlug]) {
    attributes[legacySlug] = legacyValue;
  }

  return attributes;
}

function attributeInputType(dataType) {
  const type = String(dataType || "TEXT").toUpperCase();

  if (type === "NUMBER" || type === "DECIMAL" || type === "INTEGER") {
    return "number";
  }

  return "text";
}

function ProductListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routeParams = useParams();
  const routerLocation = useLocation();
  const { isAuthenticated } = useAuth();
  const { location: globalLocation, setLocation } = useAppLocation();

  const isCategorySeo = routerLocation.pathname.startsWith("/category/");
  const isLocationSeo = routerLocation.pathname.startsWith("/location/");
  const isSeoRoute = isCategorySeo || isLocationSeo;

  const [seoReady, setSeoReady] = useState(!isSeoRoute);
  const [seoNotFound, setSeoNotFound] = useState(false);
  const [seoCategory, setSeoCategory] = useState(null);
  const [seoSubcategory, setSeoSubcategory] = useState(null);
  const [seoPlace, setSeoPlace] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!isSeoRoute) {
      setSeoReady(true);
      setSeoNotFound(false);
      setSeoCategory(null);
      setSeoSubcategory(null);
      setSeoPlace(null);
      return undefined;
    }

    setSeoReady(false);
    setSeoNotFound(false);

    const load = async () => {
      try {
        let place = null;
        let category = null;
        let subcategory = null;

        if (isLocationSeo) {
          place = findPopularLocationBySlug(routeParams.citySlug);
          if (!place) {
            if (!cancelled) {
              setSeoNotFound(true);
              setSeoReady(true);
            }
            return;
          }

          if (routeParams.categorySlug) {
            category = await resolveCategoryBySlug(routeParams.categorySlug);
            if (!category) {
              if (!cancelled) {
                setSeoNotFound(true);
                setSeoReady(true);
              }
              return;
            }
          }
        }

        if (isCategorySeo) {
          category = await resolveCategoryBySlug(routeParams.categorySlug);
          if (!category) {
            if (!cancelled) {
              setSeoNotFound(true);
              setSeoReady(true);
            }
            return;
          }

          if (routeParams.subcategorySlug) {
            subcategory = await resolveSubcategoryBySlug(
              category,
              routeParams.subcategorySlug
            );
            if (!subcategory) {
              if (!cancelled) {
                setSeoNotFound(true);
                setSeoReady(true);
              }
              return;
            }
          }
        }

        if (!cancelled) {
          setSeoPlace(place);
          setSeoCategory(category);
          setSeoSubcategory(subcategory);
          setSeoNotFound(false);
          setSeoReady(true);
        }
      } catch {
        if (!cancelled) {
          setSeoNotFound(true);
          setSeoReady(true);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    isSeoRoute,
    isCategorySeo,
    isLocationSeo,
    routeParams.categorySlug,
    routeParams.subcategorySlug,
    routeParams.citySlug,
  ]);

  const category = isSeoRoute
    ? seoCategory?.name || "All Categories"
    : searchParams.get("category") || "All Categories";
  const subcategory = isSeoRoute
    ? seoSubcategory?.name || null
    : searchParams.get("subcategory");
  const categoryId = isSeoRoute
    ? seoCategory
      ? String(seoCategory.id)
      : ""
    : searchParams.get("categoryId") || "";
  const subCategoryId = isSeoRoute
    ? seoSubcategory
      ? String(seoSubcategory.id)
      : ""
    : searchParams.get("subCategoryId") || "";
  const keyword = searchParams.get("keyword") || "";
  const urlLocation = searchParams.get("location") || "";
  const locationParam = isLocationSeo
    ? seoPlace?.label || ""
    : isCategorySeo
      ? urlLocation || ""
      : urlLocation || globalLocation || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const conditionParam = searchParams.get("condition") || "";
  const pageNumber = Math.max(1, Number(searchParams.get("page")) || 1);
  const appliedAttributes = getAttributeQuery(searchParams);

  const hydratedLocation = useRef(false);
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistTick, setWishlistTick] = useState(0);
  const [favoritePending, setFavoritePending] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filterAttributes, setFilterAttributes] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [sortBy, setSortBy] = useState("Date Published: Newest");
  const [filters, setFilters] = useState({
    keyword,
    categoryId,
    categoryName: category === "All Categories" ? "" : category,
    subCategoryId,
    subCategoryName: subcategory || "",
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    location: locationParam,
    condition: fromApiCondition(conditionParam),
    attributes: appliedAttributes,
  });

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
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    ensureFavoritesLoaded().then(() => {
      if (!cancelled) {
        setWishlistTick((value) => value + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (hydratedLocation.current || isLocationSeo) {
      return;
    }

    hydratedLocation.current = true;
    const nextLocation = searchParams.get("location") || "";
    if (nextLocation && nextLocation !== globalLocation) {
      setLocation(nextLocation);
    }
  }, [globalLocation, searchParams, setLocation]);

  useEffect(() => {
    if (isSeoRoute && !seoReady) {
      return;
    }

    setFilters((previous) => ({
      ...previous,
      keyword,
      categoryId,
      categoryName: category === "All Categories" ? "" : category,
      subCategoryId,
      subCategoryName: subcategory || "",
      location: locationParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      condition: fromApiCondition(conditionParam),
      attributes: appliedAttributes,
    }));
  }, [
    keyword,
    category,
    categoryId,
    subcategory,
    subCategoryId,
    locationParam,
    minPriceParam,
    maxPriceParam,
    conditionParam,
    searchParams,
    seoReady,
    isSeoRoute,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!filters.categoryId) {
      setSubcategories([]);
      return undefined;
    }

    getSubcategoriesByCategory(filters.categoryId)
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
  }, [filters.categoryId]);

  useEffect(() => {
    let cancelled = false;

    if (!filters.categoryId) {
      setFilterAttributes([]);
      return undefined;
    }

    const loader = filters.subCategoryId
      ? getSubcategoryAttributes(filters.categoryId, filters.subCategoryId)
      : getCategoryAttributes(filters.categoryId);

    loader
      .then((data) => {
        const next = data
          .filter((item) => item.active !== false && item.filterable !== false)
          .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));

        return attachAttributeOptions(next);
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        setFilterAttributes(data);
      })
      .catch(() => {
        if (!cancelled) {
          setFilterAttributes([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters.categoryId, filters.subCategoryId]);

  useEffect(() => {
    let cancelled = false;

    if (isSeoRoute && (!seoReady || seoNotFound)) {
      setProducts([]);
      setTotalElements(0);
      setTotalPages(1);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");

    filterProductsPage({
      keyword,
      categoryId,
      subCategoryId,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      location: locationParam,
      condition: conditionParam,
      sort: sortBy,
      page: pageNumber - 1,
      size: PAGE_SIZE,
      attributes: appliedAttributes,
    })
      .then((page) => {
        if (!cancelled) {
          setProducts(page.products);
          setTotalElements(page.totalElements);
          setTotalPages(page.totalPages);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load products");
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
  }, [
    keyword,
    categoryId,
    subCategoryId,
    minPriceParam,
    maxPriceParam,
    locationParam,
    globalLocation,
    conditionParam,
    searchParams,
    sortBy,
    pageNumber,
    seoReady,
    seoNotFound,
    isSeoRoute,
  ]);

  useEffect(() => {
    if (!filtersOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLocationFilterChange = (value) => {
    handleFilterChange("location", value);

    const complete =
      !value ||
      POPULAR_LOCATIONS.includes(value) ||
      /^[^,]+,\s*[^,]+/.test(value);

    if (complete) {
      setLocation(value);
    }
  };

  const handleCategoryChange = (event) => {
    const nextId = event.target.value;
    const selected = categories.find((item) => String(item.id) === String(nextId));

    setFilters((previous) => ({
      ...previous,
      categoryId: nextId,
      categoryName: selected?.name || "",
      subCategoryId: "",
      subCategoryName: "",
      attributes: {},
    }));
  };

  const handleSubcategoryChange = (event) => {
    const nextId = event.target.value;
    const selected = subcategories.find(
      (item) => String(item.id) === String(nextId)
    );

    setFilters((previous) => ({
      ...previous,
      subCategoryId: nextId,
      subCategoryName: selected?.name || "",
      attributes: {},
    }));
  };

  const handleAttributeChange = (slug, value) => {
    setFilters((previous) => ({
      ...previous,
      attributes: {
        ...previous.attributes,
        [slug]: value,
      },
    }));
  };

  const applyFilters = () => {
    const extra = new URLSearchParams();

    if (filters.keyword) {
      extra.set("keyword", filters.keyword);
    }

    if (filters.minPrice) {
      extra.set("minPrice", filters.minPrice);
    }

    if (filters.maxPrice) {
      extra.set("maxPrice", filters.maxPrice);
    }

    const condition = toApiCondition(filters.condition);
    if (condition) {
      extra.set("condition", condition);
    }

    Object.entries(filters.attributes || {}).forEach(([slug, value]) => {
      if (String(value || "").trim()) {
        extra.set(slug, String(value).trim());
      }
    });

    const selectedCategory = categories.find(
      (item) => String(item.id) === String(filters.categoryId)
    );
    const selectedSubcategory = subcategories.find(
      (item) => String(item.id) === String(filters.subCategoryId)
    );

    if (filters.location) {
      setLocation(filters.location);
    } else if (!isLocationSeo) {
      setLocation("");
    }

    const nextPath = seoListingPath({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      locationLabel: filters.location,
    });

    if (nextPath === "/listings") {
      if (filters.categoryId && selectedCategory) {
        extra.set("categoryId", filters.categoryId);
        extra.set("category", filters.categoryName || selectedCategory.name);
      }
      if (filters.subCategoryId && selectedSubcategory) {
        extra.set("subCategoryId", filters.subCategoryId);
        extra.set("subcategory", filters.subCategoryName || selectedSubcategory.name);
      }
      if (filters.location) {
        extra.set("location", filters.location);
      }
    }

    const query = extra.toString();
    navigate(query ? `${nextPath}?${query}` : nextPath);
    setFiltersOpen(false);
  };

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams);

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    navigate(
      query ? `${routerLocation.pathname}?${query}` : routerLocation.pathname
    );
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      categoryId: "",
      categoryName: "",
      subCategoryId: "",
      subCategoryName: "",
      minPrice: "",
      maxPrice: "",
      location: globalLocation || "",
      condition: "Any",
      attributes: {},
    });
    const params = new URLSearchParams();
    appendLocationParam(params, globalLocation);
    navigate(params.toString() ? `/listings?${params.toString()}` : "/listings");
  };

  const handleHeartClick = async (event, productId) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (favoritePending) {
      return;
    }

    setFavoritePending(String(productId));

    try {
      await toggleFavorite(productId);
      setWishlistTick((value) => value + 1);
    } catch {
      /* keep current heart state */
    } finally {
      setFavoritePending("");
    }
  };

  const heading = isSeoRoute
    ? seoSubcategory?.name
      ? `Buy & Sell ${seoSubcategory.name}`
      : seoCategory?.name && seoPlace
        ? `Buy & Sell ${seoCategory.name} in ${seoPlace.city}`
        : seoPlace
          ? `Buy & Sell in ${seoPlace.city}`
          : seoCategory?.name
            ? `Buy & Sell ${seoCategory.name}`
            : "Listings"
    : keyword
      ? `Results for "${keyword}"`
      : subcategory || category;

  useEffect(() => {
    if (isSeoRoute && !seoReady) {
      return undefined;
    }

    if (seoNotFound) {
      applySeo({
        title: "Page not found | LISTO",
        description: "This LISTO page does not exist.",
        path: routerLocation.pathname,
        noIndex: true,
      });
      return undefined;
    }

    if (isSeoRoute) {
      const crumbs = [{ name: "Home", path: "/" }];
      let title = "Browse Listings | LISTO";
      let description =
        "Search local classified ads on LISTO. Find products from local buyers and sellers near you.";
      const canonicalPathname = routerLocation.pathname;

      if (seoPlace && seoCategory) {
        title = `Buy & Sell ${seoCategory.name} in ${seoPlace.city} | LISTO`;
        description = `Buy and sell ${seoCategory.name.toLowerCase()} in ${seoPlace.city} on LISTO. Find listings from local buyers and sellers.`;
        crumbs.push({
          name: seoPlace.city,
          path: `/location/${seoPlace.citySlug}`,
        });
        crumbs.push({
          name: seoCategory.name,
          path: canonicalPathname,
        });
      } else if (seoPlace) {
        title = `Buy & Sell in ${seoPlace.city} | LISTO`;
        description = `Buy and sell products in ${seoPlace.city} on LISTO. Post a free ad and connect with local buyers and sellers.`;
        crumbs.push({ name: seoPlace.city, path: canonicalPathname });
      } else if (seoSubcategory && seoCategory) {
        title = `Buy & Sell ${seoSubcategory.name} | LISTO`;
        description = `Buy and sell ${seoSubcategory.name.toLowerCase()} on LISTO. Find new and used ${seoSubcategory.name.toLowerCase()} from local sellers near you.`;
        crumbs.push({
          name: seoCategory.name,
          path: `/category/${routeParams.categorySlug}`,
        });
        crumbs.push({ name: seoSubcategory.name, path: canonicalPathname });
      } else if (seoCategory) {
        title = `Buy & Sell ${seoCategory.name} | LISTO`;
        description = `Buy and sell ${seoCategory.name.toLowerCase()} on LISTO. Find new and used ${seoCategory.name.toLowerCase()} from local sellers near you.`;
        crumbs.push({ name: seoCategory.name, path: canonicalPathname });
      }

      const isCategoryOnlyPage =
        isCategorySeo &&
        Boolean(seoCategory) &&
        !seoSubcategory &&
        !seoPlace &&
        !routeParams.subcategorySlug;

      const isSubcategoryPage =
        isCategorySeo &&
        Boolean(seoCategory) &&
        Boolean(seoSubcategory) &&
        !seoPlace &&
        Boolean(routeParams.subcategorySlug);

      const isLocationOnlyPage =
        isLocationSeo &&
        Boolean(seoPlace) &&
        !seoCategory &&
        !routeParams.categorySlug;

      const isLocationCategoryPage =
        isLocationSeo &&
        Boolean(seoPlace) &&
        Boolean(seoCategory) &&
        Boolean(routeParams.categorySlug);

      let listingRobots;
      if (isCategoryOnlyPage && !loading) {
        listingRobots = totalElements > 0 ? "index, follow" : "noindex, follow";
      } else if (isSubcategoryPage && !loading) {
        listingRobots = totalElements > 0 ? "index, follow" : "noindex, follow";
      } else if (isLocationOnlyPage && !loading) {
        listingRobots = totalElements > 0 ? "index, follow" : "noindex, follow";
      } else if (isLocationCategoryPage && !loading) {
        listingRobots = totalElements > 0 ? "index, follow" : "noindex, follow";
      }

      applySeo({
        title,
        description,
        path: canonicalPathname,
        robots: listingRobots,
        jsonLd: breadcrumbJsonLd(crumbs, absoluteUrl),
      });
      return undefined;
    }

    const place = locationParam ? ` in ${locationParam}` : " near you";
    const topic = keyword || subcategory || (category !== "All Categories" ? category : "classifieds");
    applySeo({
      title: `${topic} for sale${place} | LISTO`,
      description: `Find ${topic} ads on LISTO${place}. Filter by price, condition and category, then chat with local buyers and sellers.`,
      path: canonicalPath("/listings", `?${searchParams.toString()}`),
    });
  }, [
    heading,
    keyword,
    category,
    subcategory,
    locationParam,
    searchParams,
    isSeoRoute,
    seoReady,
    seoNotFound,
    seoCategory,
    seoSubcategory,
    seoPlace,
    routerLocation.pathname,
    routeParams.categorySlug,
    routeParams.subcategorySlug,
    isCategorySeo,
    isLocationSeo,
    loading,
    totalElements,
  ]);

  if (seoNotFound) {
    return React.createElement(
      "div",
      { className: "product-listing-page" },
      React.createElement(
        "div",
        { className: "listing-content" },
        React.createElement("h1", { className: "listing-results-title" }, "Page not found"),
        React.createElement(
          "p",
          { className: "listings-status" },
          "This category, subcategory, or location page is not available."
        )
      )
    );
  }

  if (isSeoRoute && !seoReady) {
    return React.createElement(
      "div",
      { className: "product-listing-page" },
      React.createElement("p", { className: "listings-status" }, "Loading listings...")
    );
  }

  const appliedFilterCount = [
    keyword,
    categoryId,
    subCategoryId,
    minPriceParam,
    maxPriceParam,
    locationParam,
    conditionParam,
    ...Object.keys(appliedAttributes),
  ].filter(Boolean).length;

  return React.createElement(
    "div",
    { className: "product-listing-page" },

    React.createElement(
      "div",
      { className: "listing-breadcrumb" },

      React.createElement("span", { onClick: () => navigate("/"), style: { cursor: "pointer" } }, "Home"),

      React.createElement("i", {
        className: "fa-solid fa-chevron-right",
      }),

      React.createElement("strong", null, heading)
    ),

    React.createElement(
      "div",
      { className: "listing-top-bar" },

      React.createElement(
        "div",
        { className: "active-filters" },

        React.createElement(
          "span",
          { className: "active-filter-label" },
          `${totalElements} listings`
        ),

        keyword &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            `Search: ${keyword}`
          ),

        categoryId &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            category
          ),

        subCategoryId &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            subcategory
          ),

        Object.entries(appliedAttributes).map(([slug, value]) =>
          React.createElement(
            "span",
            { key: slug, className: "filter-chip" },
            `${
              filterAttributes.find((item) => item.slug === slug)?.name || slug
            }: ${value}`
          )
        ),

        locationParam &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            `Location: ${locationParam}`
          )
      ),

      React.createElement(
        "div",
        { className: "listing-toolbar" },

        React.createElement(
          "button",
          {
            type: "button",
            className: "filter-open-button",
            onClick: () => {
              setFilters({
                keyword,
                categoryId,
                categoryName: category === "All Categories" ? "" : category,
                subCategoryId,
                subCategoryName: subcategory || "",
                minPrice: minPriceParam,
                maxPrice: maxPriceParam,
                location: locationParam,
                condition: fromApiCondition(conditionParam),
                attributes: appliedAttributes,
              });
              setFiltersOpen(true);
            },
          },
          React.createElement("i", { className: "fa-solid fa-sliders" }),
          "Filters",
          appliedFilterCount > 0 &&
            React.createElement(
              "span",
              { className: "filter-count-badge" },
              appliedFilterCount
            )
        ),

        React.createElement(
          "div",
          { className: "sort-wrapper" },

          React.createElement("span", null, "Sort by:"),

          React.createElement(
            "select",
            {
              value: sortBy,
              onChange: (event) => setSortBy(event.target.value),
            },

            React.createElement("option", null, "Date Published: Newest"),
            React.createElement("option", null, "Date Published: Oldest"),
            React.createElement("option", null, "Price: Low to High"),
            React.createElement("option", null, "Price: High to Low")
          )
        )
      )
    ),

    filtersOpen &&
      React.createElement(
        "div",
        {
          className: "filter-modal-backdrop",
          onClick: () => setFiltersOpen(false),
        },

        React.createElement(
          "div",
          {
            className: "filter-modal",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "listing-filter-title",
            onClick: (event) => event.stopPropagation(),
          },

          React.createElement(
            "div",
            { className: "filter-header" },

            React.createElement("h2", { id: "listing-filter-title" }, "Filters"),

            React.createElement(
              "div",
              { className: "filter-header-actions" },

              React.createElement(
                "button",
                {
                  type: "button",
                  className: "filter-clear-button",
                  onClick: clearFilters,
                },
                "Clear All"
              ),

              React.createElement(
                "button",
                {
                  type: "button",
                  className: "filter-close-button",
                  "aria-label": "Close filters",
                  onClick: () => setFiltersOpen(false),
                },
                React.createElement("i", { className: "fa-solid fa-xmark" })
              )
            )
          ),

          React.createElement(
            "div",
            { className: "filter-modal-body" },

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "KEYWORD"),

          React.createElement("input", {
            type: "text",
            placeholder: "Search listings",
            value: filters.keyword,
            onChange: (event) => handleFilterChange("keyword", event.target.value),
          })
        ),

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "CATEGORY"),

          React.createElement(
            "select",
            {
              value: filters.categoryId,
              onChange: handleCategoryChange,
            },
            React.createElement("option", { value: "" }, "All"),
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
          { className: "filter-group" },

          React.createElement("label", null, "SUBCATEGORY"),

          React.createElement(
            "select",
            {
              value: filters.subCategoryId,
              onChange: handleSubcategoryChange,
              disabled: !filters.categoryId,
            },
            React.createElement("option", { value: "" }, "All"),
            subcategories.map((item) =>
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
          { className: "filter-group" },

          React.createElement("label", null, "BUDGET (PRICE RANGE)"),

          React.createElement(
            "div",
            { className: "price-inputs" },

            React.createElement(
              "div",
              null,
              React.createElement("small", null, "Min (₹)"),
              React.createElement("input", {
                type: "number",
                placeholder: "10,000",
                value: filters.minPrice,
                onChange: (event) =>
                  handleFilterChange("minPrice", event.target.value),
              })
            ),

            React.createElement(
              "div",
              null,
              React.createElement("small", null, "Max (₹)"),
              React.createElement("input", {
                type: "number",
                placeholder: "10,00,000",
                value: filters.maxPrice,
                onChange: (event) =>
                  handleFilterChange("maxPrice", event.target.value),
              })
            )
          )
        ),

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "LOCATION"),

          React.createElement(
            "div",
            { className: "location-filter" },

            React.createElement("input", {
              type: "text",
              list: "filter-popular-locations",
              placeholder: "City, State",
              value: filters.location,
              onChange: (event) =>
                handleLocationFilterChange(event.target.value),
            }),

            React.createElement(
              "datalist",
              { id: "filter-popular-locations" },
              POPULAR_LOCATIONS.map((item) =>
                React.createElement("option", { key: item, value: item })
              )
            ),

            React.createElement("i", {
              className: "fa-solid fa-location-dot",
            })
          )
        ),

        filterAttributes.map((attribute) =>
          React.createElement(
            "div",
            { key: attribute.id || attribute.slug, className: "filter-group" },

            React.createElement(
              "label",
              null,
              String(attribute.name || attribute.slug).toUpperCase()
            ),

            String(attribute.dataType || "").toUpperCase() === "BOOLEAN"
              ? React.createElement(
                  "select",
                  {
                    value: filters.attributes[attribute.slug] || "",
                    onChange: (event) =>
                      handleAttributeChange(attribute.slug, event.target.value),
                  },
                  React.createElement("option", { value: "" }, "All"),
                  React.createElement("option", { value: "true" }, "Yes"),
                  React.createElement("option", { value: "false" }, "No")
                )
              : isSelectAttribute(attribute.dataType)
                ? React.createElement(
                    "select",
                    {
                      value: filters.attributes[attribute.slug] || "",
                      onChange: (event) =>
                        handleAttributeChange(attribute.slug, event.target.value),
                    },
                    React.createElement("option", { value: "" }, "All"),
                    (attribute.options || []).map((option) =>
                      React.createElement(
                        "option",
                        {
                          key: option.id || option.slug || option.name,
                          value: option.name || option.slug,
                        },
                        option.name || option.slug
                      )
                    )
                  )
              : React.createElement("input", {
                  type: attributeInputType(attribute.dataType),
                  placeholder: `All ${attribute.name || "values"}`,
                  value: filters.attributes[attribute.slug] || "",
                  onChange: (event) =>
                    handleAttributeChange(attribute.slug, event.target.value),
                })
          )
        ),

        React.createElement(
          "div",
          { className: "filter-group condition-group" },

          React.createElement("label", null, "CONDITION"),

          ["Any", "Brand New", "Like New", "Good", "Fair", "Poor"].map((option) =>
            React.createElement(
              "label",
              {
                key: option,
                className: "radio-option",
              },
              React.createElement("input", {
                type: "radio",
                name: "condition",
                checked: filters.condition === option,
                onChange: () => handleFilterChange("condition", option),
              }),
              React.createElement("span", null, option)
            )
          )
        )
          ),

          React.createElement(
            "div",
            { className: "filter-modal-footer" },
            React.createElement(
              "button",
              {
                type: "button",
                className: "apply-filter-button",
                onClick: applyFilters,
              },
              "APPLY FILTERS"
            )
          )
        )
      ),

    React.createElement(
      "div",
      { className: "listing-content" },

      React.createElement(
        "main",
        { className: "listing-results" },

        React.createElement("h1", { className: "listing-results-title" }, heading),

        loading &&
          React.createElement("p", { className: "listings-status" }, "Loading products..."),

        error &&
          React.createElement("p", { className: "listings-status listings-error" }, error),

        !loading && !error && products.length === 0 &&
          React.createElement(
            "p",
            { className: "listings-status" },
            "No products found."
          ),

        !loading && !error && products.length > 0 &&
          React.createElement(
            "div",
            { className: "results-grid" },

            products.map((product) =>
              React.createElement(
                "article",
                {
                  key: `${product.id}-${wishlistTick}`,
                  className: "listing-card",
                  onClick: () => navigate(`/product/${product.id}`),
                },

                React.createElement(
                  "div",
                  { className: "listing-image-wrapper" },

                  product.image
                    ? React.createElement("img", {
                        src: product.image,
                        alt: product.title,
                      })
                    : React.createElement(
                        "div",
                        { className: "listing-image-empty" },
                        React.createElement("i", { className: "fa-regular fa-image" })
                      ),

                  product.featured &&
                    React.createElement(
                      "span",
                      { className: "listing-featured" },
                      "FEATURED"
                    ),

                  product.sold &&
                    React.createElement(
                      "span",
                      { className: "listing-sold" },
                      "SOLD"
                    ),

                  React.createElement(
                    "button",
                    {
                      type: "button",
                      className: `listing-heart ${
                        isFavorite(product.id) ? "active" : ""
                      }`,
                      disabled: favoritePending === String(product.id),
                      onClick: (event) => handleHeartClick(event, product.id),
                    },
                    React.createElement("i", {
                      className: isFavorite(product.id)
                        ? "fa-solid fa-heart"
                        : "fa-regular fa-heart",
                    })
                  )
                ),

                React.createElement(
                  "div",
                  { className: "listing-card-content" },

                  React.createElement(
                    "strong",
                    { className: "listing-price" },
                    product.price
                  ),

                  React.createElement("h3", null, product.title),

                  React.createElement(
                    "div",
                    { className: "listing-meta" },

                    React.createElement(
                      "span",
                      null,
                      React.createElement("i", {
                        className: "fa-solid fa-location-dot",
                      }),
                      product.location || "India"
                    ),

                    React.createElement("span", null, product.time)
                  )
                )
              )
            )
          ),

        !loading && totalPages > 1 &&
          React.createElement(
            "div",
            { className: "listing-pagination" },

            React.createElement(
              "button",
              {
                type: "button",
                disabled: pageNumber === 1,
                onClick: () => goToPage(pageNumber - 1),
              },
              React.createElement("i", {
                className: "fa-solid fa-chevron-left",
              })
            ),

            Array.from({ length: totalPages }, (_, index) => index + 1).map((pageItem) =>
              React.createElement(
                "button",
                {
                  key: pageItem,
                  type: "button",
                  className: pageNumber === pageItem ? "active" : "",
                  onClick: () => goToPage(pageItem),
                },
                pageItem
              )
            ),

            React.createElement(
              "button",
              {
                type: "button",
                disabled: pageNumber === totalPages,
                onClick: () => goToPage(pageNumber + 1),
              },
              React.createElement("i", {
                className: "fa-solid fa-chevron-right",
              })
            )
          )
      )
    )
  );
}

export default ProductListing;

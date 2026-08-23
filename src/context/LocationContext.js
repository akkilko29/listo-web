import React, { createContext, useContext, useMemo, useState } from "react";

export const LOCATION_STORAGE_KEY = "listo.selectedLocation";

const LocationContext = createContext(null);

export function readStoredLocation() {
  try {
    return window.localStorage.getItem(LOCATION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function appendLocationParam(params, location) {
  const value = String(location || "").trim();
  if (value) {
    params.set("location", value);
  }
  return params;
}

export function listingsHref(location, extra = {}) {
  const params = new URLSearchParams(extra);
  appendLocationParam(params, location);
  const query = params.toString();
  return query ? `/listings?${query}` : "/listings";
}

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => readStoredLocation());

  const setLocation = (next) => {
    const value = String(next || "").trim();
    setLocationState(value);

    try {
      if (value) {
        window.localStorage.setItem(LOCATION_STORAGE_KEY, value);
      } else {
        window.localStorage.removeItem(LOCATION_STORAGE_KEY);
      }
    } catch {
      /* ignore storage errors */
    }
  };

  const value = useMemo(
    () => ({
      location,
      setLocation,
    }),
    [location]
  );

  return React.createElement(LocationContext.Provider, { value }, children);
}

export function useAppLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useAppLocation must be used within LocationProvider");
  }

  return context;
}

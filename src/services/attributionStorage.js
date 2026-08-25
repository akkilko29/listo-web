const STORAGE_KEY = "listo.registrationAttribution";

const URL_PARAM_KEYS = [
  "registration_source",
  "campaign_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

function readStoredAttribution() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function captureAttributionFromSearch(search) {
  if (typeof window === "undefined") {
    return readStoredAttribution();
  }

  const query = String(search || window.location.search || "");
  const params = new URLSearchParams(
    query.startsWith("?") ? query.slice(1) : query
  );
  const captured = {};

  URL_PARAM_KEYS.forEach((key) => {
    const value = String(params.get(key) || "").trim();
    if (value) {
      captured[key] = value;
    }
  });

  if (Object.keys(captured).length === 0) {
    return readStoredAttribution();
  }

  const next = {
    ...readStoredAttribution(),
    ...captured,
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }

  return next;
}

export function getRegistrationAttribution(registrationMethod) {
  const stored = readStoredAttribution();
  const attribution = {};

  URL_PARAM_KEYS.forEach((key) => {
    const value = String(stored[key] || "").trim();
    if (value) {
      attribution[key] = value;
    }
  });

  if (!attribution.registration_source && attribution.utm_source) {
    attribution.registration_source = attribution.utm_source;
  }

  if (!attribution.registration_source) {
    attribution.registration_source = "web";
  }

  attribution.registration_method = registrationMethod;
  attribution.registered_at = new Date().toISOString();

  return attribution;
}

export function applyRegistrationAttribution(target, registrationMethod) {
  const attribution = getRegistrationAttribution(registrationMethod);

  Object.entries(attribution).forEach(([key, value]) => {
    if (value == null || String(value).trim() === "") {
      return;
    }

    if (typeof FormData !== "undefined" && target instanceof FormData) {
      target.append(key, String(value));
      return;
    }

    target[key] = String(value);
  });

  return target;
}

export function clearRegistrationAttribution() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

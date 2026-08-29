const REGISTRATION_SEND_TO = "AW-18413932451/FTCXCOP8yeckEKOfucxE";

let registrationConversionSent = false;

function truthyFlag(value) {
  return value === true || value === "true";
}

/**
 * Google /api/auth/google does not document a new-user field in this
 * frontend. Only treat the response as a new registration when the API
 * explicitly says so, so existing Google logins are never counted.
 */
export function isNewGoogleRegistration(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (
    truthyFlag(payload.isNewUser) ||
    truthyFlag(payload.newUser) ||
    truthyFlag(payload.isNew) ||
    truthyFlag(payload.accountCreated) ||
    truthyFlag(payload.userCreated)
  ) {
    return true;
  }

  const nested = payload.user;
  if (nested && nested !== payload && typeof nested === "object") {
    return isNewGoogleRegistration(nested);
  }

  return false;
}

export function trackGoogleAdsRegistrationConversion() {
  if (registrationConversionSent) {
    return;
  }

  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  registrationConversionSent = true;
  window.gtag("event", "conversion", {
    send_to: REGISTRATION_SEND_TO,
  });
}

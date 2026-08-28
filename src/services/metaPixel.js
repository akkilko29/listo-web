const COMPLETE_REGISTRATION_KEY = "listo.metaCompleteRegistration";

function canUseFbq() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function alreadyTrackedCompleteRegistration() {
  try {
    return window.sessionStorage.getItem(COMPLETE_REGISTRATION_KEY) === "1";
  } catch {
    return Boolean(window.__listoMetaCompleteRegistration);
  }
}

function markCompleteRegistrationTracked() {
  try {
    window.sessionStorage.setItem(COMPLETE_REGISTRATION_KEY, "1");
  } catch {
    window.__listoMetaCompleteRegistration = true;
  }
}

export function trackCompleteRegistration() {
  if (!canUseFbq() || alreadyTrackedCompleteRegistration()) {
    return;
  }

  markCompleteRegistrationTracked();
  window.fbq("track", "CompleteRegistration");
}

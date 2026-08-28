const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const DEFAULT_GOOGLE_CLIENT_ID =
  "1030081817796-06cee4tqkstpgj3gda0na6afd0uij0hg.apps.googleusercontent.com";

export function getGoogleClientId() {
  return String(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
  ).trim();
}

let scriptPromise = null;

export function loadGoogleIdentity() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Sign-In is only available in the browser")
    );
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-google-gsi]");
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      existing.addEventListener("load", () => resolve(window.google), {
        once: true,
      });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Sign-In")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = "true";
    script.onload = () => resolve(window.google);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Google Sign-In"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function mountGoogleSignInButton(container, onCredential) {
  if (!container) {
    throw new Error("Google Sign-In button is missing");
  }

  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google Sign-In is not configured");
  }

  const google = await loadGoogleIdentity();
  if (!google?.accounts?.id) {
    throw new Error("Google Sign-In is unavailable");
  }

  const generation = String(Date.now() + Math.random());
  container.dataset.gsiGeneration = generation;
  container.innerHTML = "";

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response?.credential) {
        onCredential(response.credential);
        return;
      }

      onCredential("", new Error("Google did not return an ID token"));
    },
    auto_select: false,
  });

  google.accounts.id.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    width: 320,
    logo_alignment: "left",
  });

  return () => {
    if (container.dataset.gsiGeneration !== generation) {
      return;
    }

    container.innerHTML = "";
    delete container.dataset.gsiGeneration;
    try {
      google.accounts.id.cancel();
    } catch {
      /* ignore */
    }
  };
}

let googleIdTokenAttempt = 0;
let settlePreviousGoogleIdToken = null;

function cancelledGoogleSignInError() {
  const error = new Error("Google sign-in cancelled");
  error.code = "GOOGLE_SIGNIN_CANCELLED";
  return error;
}

export async function requestGoogleIdToken() {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google Sign-In is not configured");
  }

  const google = await loadGoogleIdentity();
  if (!google?.accounts?.id) {
    throw new Error("Google Sign-In is unavailable");
  }

  if (settlePreviousGoogleIdToken) {
    settlePreviousGoogleIdToken(cancelledGoogleSignInError());
    settlePreviousGoogleIdToken = null;
  }

  const attempt = ++googleIdTokenAttempt;

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error, token, cancelPrompt) => {
      if (settled || attempt !== googleIdTokenAttempt) {
        return;
      }
      settled = true;
      if (settlePreviousGoogleIdToken) {
        settlePreviousGoogleIdToken = null;
      }
      if (cancelPrompt) {
        try {
          google.accounts.id.cancel();
        } catch {
          /* ignore */
        }
      }
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    };

    settlePreviousGoogleIdToken = (error) => {
      finish(error, undefined, false);
    };

    const finishCancelled = () => {
      finish(cancelledGoogleSignInError(), undefined, false);
    };

    const promptReason = (getter) => {
      try {
        return getter?.() || "";
      } catch {
        return "";
      }
    };

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          finish(null, response.credential, true);
          return;
        }
        finish(new Error("Google did not return an ID token"), undefined, true);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
    });

    google.accounts.id.prompt((notification) => {
      if (!notification || attempt !== googleIdTokenAttempt) {
        return;
      }

      if (notification.isDismissedMoment?.()) {
        const reason = promptReason(notification.getDismissedReason);
        if (reason === "credential_returned" || reason === "flow_restarted") {
          return;
        }
        finishCancelled();
        return;
      }

      if (notification.isSkippedMoment?.()) {
        const reason = promptReason(notification.getSkippedReason);
        if (reason === "issuing_failed") {
          finish(
            new Error("Google could not complete sign-in. Please try again."),
            undefined,
            true
          );
          return;
        }
        finishCancelled();
        return;
      }

      if (notification.isNotDisplayed?.()) {
        const reason = promptReason(notification.getNotDisplayedReason);
        if (reason === "unregistered_origin") {
          finish(
            new Error(
              "Google sign-in is blocked for this site. Add this origin in Google Cloud Console."
            ),
            undefined,
            true
          );
          return;
        }
        if (reason === "invalid_client" || reason === "missing_client_id") {
          finish(
            new Error("Google Sign-In is not configured correctly."),
            undefined,
            true
          );
          return;
        }
        if (reason === "secure_http_required") {
          finish(
            new Error("Google sign-in requires a secure (HTTPS) connection."),
            undefined,
            true
          );
          return;
        }
        if (reason === "browser_not_supported") {
          finish(
            new Error("Google sign-in is not supported in this browser."),
            undefined,
            true
          );
          return;
        }
        finishCancelled();
      }
    });
  });
}

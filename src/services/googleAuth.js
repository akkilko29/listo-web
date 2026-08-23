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

export async function requestGoogleIdToken() {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google Sign-In is not configured");
  }

  const google = await loadGoogleIdentity();
  if (!google?.accounts?.id) {
    throw new Error("Google Sign-In is unavailable");
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error, token) => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        google.accounts.id.cancel();
      } catch {
        /* ignore */
      }
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    };

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          finish(null, response.credential);
          return;
        }
        finish(new Error("Google did not return an ID token"));
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
        finish(new Error("Google sign-in is blocked for this site. Add this origin in Google Cloud Console."));
      }
    });
  });
}

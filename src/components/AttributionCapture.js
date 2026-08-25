import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { captureAttributionFromSearch } from "../services/attributionStorage";

function AttributionCapture() {
  const location = useLocation();

  useEffect(() => {
    captureAttributionFromSearch(location.search);
  }, [location.search]);

  return null;
}

export default AttributionCapture;

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { applySeo, seoForLocation } from "../seo/applySeo";

function SeoHead() {
  const location = useLocation();

  useEffect(() => {
    applySeo(seoForLocation(location.pathname, location.search));
  }, [location.pathname, location.search]);

  return null;
}

export default SeoHead;

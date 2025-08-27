import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SaveLastPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/login") {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);


  return null;
}

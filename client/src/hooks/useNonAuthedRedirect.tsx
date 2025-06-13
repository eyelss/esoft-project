import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/authSlice";
import ROUTES, { NON_AUTH_DRIAN } from "../pages/routes";

// hook for redirect if user not authorized
const useNonAuthedRedirect = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      navigate(ROUTES[NON_AUTH_DRIAN].pathUrl);
    }
  }, [navigate, user])
}

export default useNonAuthedRedirect;
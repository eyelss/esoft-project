import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/authSlice";
import ROUTES, { AUTH_DRIAN } from "../pages/routes";

// hook for redirect if user IS authorized
const useAuthedRedirect = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useEffect uar');

    if (user !== null) {
      navigate(ROUTES[AUTH_DRIAN].pathUrl);
    }
  }, [navigate, user])
}

export default useAuthedRedirect;
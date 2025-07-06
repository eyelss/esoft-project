import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/authSlice";
import routes, { authDrain } from "../pages/routes";

// hook for redirect if user IS authorized
const useAuthedRedirect = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  if (user !== null) {
    navigate(routes[authDrain].pathUrl);
  }

  useEffect(() => {
    if (user !== null) {
      navigate(routes[authDrain].pathUrl);
    }
  }, [navigate, user]);

  return navigate;
}

export default useAuthedRedirect;
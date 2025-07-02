import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/authSlice";
import routes, { nonAuthDrain } from "../pages/routes";

// hook for redirect if user not authorized
const useNonAuthedRedirect = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      navigate(routes[nonAuthDrain].pathUrl);
    }
  }, [navigate, user])
}

export default useNonAuthedRedirect;
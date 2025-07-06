import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, verifySession } from "../features/authSlice";
import routes, { nonAuthDrain } from "../pages/routes";
import { useAppDispatch } from "../store";

// hook for redirect if user not authorized
const useNonAuthedRedirect = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(verifySession());

    if (user === null) {
      navigate(routes[nonAuthDrain].pathUrl);
    }
  }, [navigate, user]);

  return navigate;
}

export default useNonAuthedRedirect;
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/authSlice";
import routes, { nonAuthDrain } from "../pages/routes";

// Hook for recipe page authentication logic
const useRecipeAuth = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const { recipeId } = useParams();

  useEffect(() => {
    // If user is not authenticated and trying to create a new recipe (no recipeId)
    if (user === null && !recipeId) {
      navigate(routes[nonAuthDrain].pathUrl);
    }
  }, [user, recipeId, navigate]);
};

export default useRecipeAuth; 
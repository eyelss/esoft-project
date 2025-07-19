import themeReducer from "./themeSlice";
import authReducer from "./authSlice";
import recipeReducer from "./recipeSlice";
import recipeListReducer from "./recipeListSlice";

const reducers = {
  theme: themeReducer,
  recipe: recipeReducer,
  auth: authReducer,
  recipeList: recipeListReducer,
};

export default reducers;
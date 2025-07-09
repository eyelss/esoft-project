import type { Reducer } from "@reduxjs/toolkit"
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";
import recipeReducer from "./recipeSlice";
import recipeListReducer from "./recipeListSlice";

// type ReducersDict = {
//   [key: string]: Reducer;
// };

const reducers = {
  theme: themeReducer,
  recipe: recipeReducer,
  auth: authReducer,
  recipeList: recipeListReducer,
};

export default reducers;
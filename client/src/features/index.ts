import type { Reducer } from "@reduxjs/toolkit"
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";
import recipeReducer from "./recipeSlice";

type ReducersDict = {
  [key: string]: Reducer;
};

const reducers: ReducersDict = {
  theme: themeReducer,
  recipe: recipeReducer,
  auth: authReducer,
};

export default reducers;
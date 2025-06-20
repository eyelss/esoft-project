import type { Reducer } from "@reduxjs/toolkit"
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";

type ReducersDict = {
  [key: string]: Reducer;
};

const reducers: ReducersDict = {
  theme: themeReducer,
  auth: authReducer,
}

export default reducers;
import type { Reducer } from "@reduxjs/toolkit"
import themeReducer from "./themeSlice";

type ReducersDict = {
  [key: string]: Reducer;
};

const reducers: ReducersDict = {
  theme: themeReducer,
}

export default reducers;
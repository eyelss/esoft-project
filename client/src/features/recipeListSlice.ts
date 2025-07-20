import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchApi, trimObject } from "../utils/simple";

export type RecipeListItem = {
  id: string;
  title: string;
  description: string;
  owner: string;
  likes: number;
  likedByMe?: boolean;
};

type RecipeListState = {
  recipes: RecipeListItem[];
  loading: boolean;
  error: string | null;
};

type RecipeQuery = {
  q?: string;
  a?: string;
  p?: number;
  f?: string;
};

const initialState: RecipeListState = {
  recipes: [],
  loading: false,
  error: null,
};

const transformRecipe = (backRecipes: any[]) => {
  return backRecipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    likes: recipe.likes,
    likedByMe: recipe.likedByMe,
    owner: recipe.owner || 'Unknown',
  }));
}

export const fetchRecipes = createAsyncThunk(
  'recipeList/fetchRecipes',
  async (query: RecipeQuery, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(trimObject(query)).toString();
      
      const response = await fetchApi('/api/recipes?' + params, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const recipes = await response.json();

      return transformRecipe(recipes);
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  }
);

const recipeListSlice = createSlice({
  name: 'recipeList',
  initialState,
  reducers: {
    clearRecipes: (state) => {
      state.recipes = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
        state.error = null;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
  selectors: {
    selectRecipes: (state) => state.recipes,
    selectRecipesLoading: (state) => state.loading,
    selectRecipesError: (state) => state.error,
  },
});

export const { clearRecipes } = recipeListSlice.actions;
export const { selectRecipes, selectRecipesLoading, selectRecipesError } = recipeListSlice.selectors;

export default recipeListSlice.reducer; 
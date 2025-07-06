import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type RecipeListItem = {
  id: string;
  title: string;
  description: string;
  owner: string;
};

type RecipeListState = {
  recipes: RecipeListItem[];
  loading: boolean;
  error: string | null;
};

const initialState: RecipeListState = {
  recipes: [],
  loading: false,
  error: null,
};

export const fetchAllRecipes = createAsyncThunk(
  'recipeList/fetchAllRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/recipes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const recipes = await response.json();
      
      // Transform backend response to match frontend format
      return recipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        owner: recipe.owner || 'Unknown',
      }));
    } catch (err) {
      return rejectWithValue((err as Error).message);
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
      .addCase(fetchAllRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
        state.error = null;
      })
      .addCase(fetchAllRecipes.rejected, (state, action) => {
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
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchApi } from "../utils/simple";

export type UserType = {
  login: string;
}

export type AuthState = {
  user: UserType | null,
  error: string | null;
  loading: boolean,
};

const initialState: AuthState = {
  user: null,
  error: null,
  loading: true,
};

export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/auth/verify', { 
        method: 'POST' 
      });

      if (!response.ok) {
        throw new Error('Session invalid');
      }

      return await response.json();

    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetchApi('/api/auth/logout', {
        method: 'POST'
      });
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(verifySession.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(verifySession.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        state.loading = false;
      });
  },
  selectors: {
    selectUser: (state) => state.user,
    selectLogin: (state) => state.user?.login,
  },
});

export const { selectUser, selectLogin } = authSlice.selectors;
export default authSlice.reducer;
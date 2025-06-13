import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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
      const response = await fetch('/api/auth/verify', { 
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
      await fetch('/api/auth/logout', {
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
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(verifySession.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
  selectors: {
    selectUser: (state) => state.user,
  },
});

export const { selectUser } = authSlice.selectors;
export default authSlice.reducer;
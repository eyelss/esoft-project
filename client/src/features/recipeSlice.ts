import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { hasCycle, isDescendant } from "../utils/graph";

export type ChangeStatus = 
| 'created'
| 'modified'
| 'deleted'
| 'untouched';

const generateTempId = () => String(new Date().getTime());

export type Step = {
  id: string;
  title: string;
  description?: string;
  status: ChangeStatus;
};

export type Relation = {
  // id: string;
  status: ChangeStatus;
  parentId: string;
  childId: string;
}

type Recipe = {
  id: string;
  title: string;
  description: string;

  status: ChangeStatus;
  currentStepId: string;
  rootStepId: string;

  // [id: string]: Step;
  steps: { [id: string]: Step };
  relations: { [id: string]: Relation };
};

type RecipeState = {
  recipe: Recipe | null;
  error: string | null;
  loading: boolean;
}

const initialState = {
  recipe: null,
  error: null,
  loading: true,
} satisfies RecipeState as RecipeState;

export const loadRecipe = createAsyncThunk(
  'recipe/loadRecipe',
  async ( id: string, { rejectWithValue } ) => {
    const response = await fetch(`/api/recipes/${id}`);

    if (!response.ok) {
      return await rejectWithValue(response.status)
    }

    return await response.json();
  }
);

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    createStep: (state, action) => {
      if (state.recipe === null) {
        return;
      }
      
      const id = generateTempId();

      state.recipe.steps[id] = {
        id,
        title: action.payload,
        status: 'created',
      };
    },
    deleteStep: (state, action) => {
      const id = action.payload;

      if (state.recipe === null || state.recipe.rootStepId === id) {
        return;
      }

      if (state.recipe.steps[id].status !== 'created') {
        state.recipe.steps[id].status = 'deleted';
      } else {
        delete state.recipe.steps[id];
      }
    },
    updateStep: (state, action) => {
      const { id, step } = action.payload;

      if (state.recipe === null) {
        return;
      }

      if (state.recipe.steps[id].status !== 'created') {
        state.recipe.steps[id].status = 'modified';
      }

      state.recipe.steps[id] = { ...state.recipe.steps[id], ...step };
    },
    appendStep: (state, action) => {
      if (state.recipe === null) {
        return;
      }

      const title = action.payload;
      
      const stepId = generateTempId();

      state.recipe.steps[stepId] = {
        id: stepId,
        title,
        status: 'created',
      };

      const relId = generateTempId();
      state.recipe.relations[relId] = {
        status: 'created',
        childId: stepId,
        parentId: state.recipe.currentStepId,
      }
    },
    createConn: (state, action) => {
      const { parentId, childId } = action.payload;

      if (state.recipe === null) {
        return;
      }

      const id = generateTempId();
      state.recipe.relations[id] = {
        status: 'created',
        parentId,
        childId,
      };
    },
    deleteConn: (state, action) => {
      const id = action.payload;

      if (state.recipe === null) {
        return;
      }

      if (state.recipe.relations[id].status !== 'created') {
        state.recipe.relations[id].status = 'deleted';
      } else {
        delete state.recipe.relations[id];
      }
    },
    createEmpty: (state) => {
      state.loading = false;
      state.error = null;
      
      const stepId = generateTempId()
      const root: Step = {
        id: stepId,
        title: 'New step',
        status: 'created',
      }


      state.recipe = {
        id: generateTempId(),
        title: 'New recipe',
        description: 'Description of your recipe',

        status: 'created',
        currentStepId: stepId,
        rootStepId: stepId,
        steps: {},
        relations: {},
      }

      state.recipe.steps[stepId] = root;
    },
    shiftCurrent: (state, action) => {
      if (state.recipe === null) {
        return;
      }

      const stepId = action.payload;
      
      const newCurrentStepId = Object.keys(state.recipe.steps).find((id) => id === stepId);

      if (newCurrentStepId !== undefined) {
        state.recipe.currentStepId = newCurrentStepId;
      }
    }
  },
  selectors: {
    selectRecipeContent: (state): [string | undefined, string | undefined , ChangeStatus | undefined] => {
      return [state.recipe?.title, state.recipe?.description, state.recipe?.status];
    },
    selectCurrentStep: (state) => {
      if (state.recipe === null) {
        return null;
      }

      const currentStepId = state.recipe.currentStepId;
      return state.recipe.steps[currentStepId]
    },
    selectChildrenOfCurrent: (state) => {
      if (state.recipe === null) {
        return [];
      }

      const currentStepId = state.recipe.currentStepId;

      const steps = state.recipe.steps;

      return Object.values(state.recipe.relations)
        .filter(rel => rel.parentId === currentStepId)
        .map(rel => steps[rel.childId]);
    },
    selectParentsOfCurrent: (state) => {
      if (state.recipe === null) {
        return [];
      }

      const currentStepId = state.recipe.currentStepId;

      const steps = state.recipe.steps;

      return Object.values(state.recipe.relations)
        .filter(rel => rel.childId === currentStepId)
        .map(rel => steps[rel.parentId]);
    },
    selectPossibleChildren: (state) => {
      if (state.recipe === null) {
        return [];
      }

      const currentStepId = state.recipe.currentStepId;

      const steps = Object.values(state.recipe.steps);
      const rels = Object.values(state.recipe.relations);
      
      return steps.filter(step => 
        !hasCycle(steps, rels, currentStepId, step.id) && 
        !isDescendant(steps, rels, currentStepId, step.id)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRecipe.pending, (state) => {
        state.loading = true;
        state.recipe = null;
      })
      .addCase(loadRecipe.rejected, (state, action) => {
        state.loading = false;
        state.recipe = null;
        state.error = action.payload as string;
      })
      .addCase(loadRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.recipe = action.payload;
        state.error = null;
      });
  }
})

export const { 
  createStep,
  deleteStep,
  updateStep,
  appendStep,
  createConn,
  deleteConn,
  createEmpty,
  shiftCurrent,
} = recipeSlice.actions;

export const {  
  selectRecipeContent,
  selectCurrentStep,
  selectChildrenOfCurrent,
  selectParentsOfCurrent,
  selectPossibleChildren,
} = recipeSlice.selectors;

export default recipeSlice.reducer;
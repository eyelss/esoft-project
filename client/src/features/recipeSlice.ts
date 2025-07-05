import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { hasCycle, isDescendant, canDeleteConnection, getDeletableConnections } from "../utils/graph";
import { selectLogin } from "./authSlice";

export type ChangeStatus = 
| 'created'
| 'modified'
| 'deleted'
| 'untouched';

export type PlayStatus = 
| 'idle'
| 'playing'
| 'paused'
| 'completed';

export type StepExecutionStatus = 
| 'waiting'
| 'active'
| 'completed'
| 'skipped';

const generateTempId = () => String(new Date().getTime());

export type Step = {
  id: string;
  title: string;
  instruction: string;
  status: ChangeStatus;
  ext?: StepExt;
};

type StepExt = {
  body: string;
  duration: number;
};

export type Relation = {
  // id: string;
  status: ChangeStatus;
  parentId: string;
  childId: string;
}

export type Recipe = {
  id: string;
  title: string;
  description: string;
  owner: string;

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
  playMode: {
    status: PlayStatus;
    activeSteps: { [stepId: string]: StepExecutionStatus };
    completedSteps: { [stepId: string]: boolean };
    stepTimers: { [stepId: string]: { startTime: number; duration: number } };
  };
}

const initialState = {
  recipe: null,
  error: null,
  loading: true,
  playMode: {
    status: 'idle',
    activeSteps: {},
    completedSteps: {},
    stepTimers: {},
  },
} satisfies RecipeState as RecipeState;

export const downloadRecipe = createAsyncThunk(
  'recipe/downloadRecipe',
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
        instruction: 'New instruction',
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

      const { title, instruction } = action.payload;
      
      const stepId = generateTempId();

      state.recipe.steps[stepId] = {
        id: stepId,
        title,
        instruction,
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

      // Check if the connection can be deleted
      const canDelete = canDeleteConnection(
        Object.values(state.recipe.steps),
        state.recipe.relations,
        id,
        state.recipe.rootStepId
      );

      if (!canDelete) {
        return; // Don't delete if it's not allowed
      }

      if (state.recipe.relations[id].status !== 'created') {
        state.recipe.relations[id].status = 'deleted';
      } else {
        delete state.recipe.relations[id];
      }
    },
    createEmpty: (state, action) => {
      state.loading = false;
      state.error = null;
      
      const stepId = generateTempId()
      const root: Step = {
        id: stepId,
        title: 'Root step',
        instruction: 'Write your step instructions!',
        status: 'created',
      }

      state.recipe = {
        id: generateTempId(),
        owner: action.payload,
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
    },
    expandCurrent: (state) => {
      if (state.recipe === null) {
        return;
      }

      const currentStep = state.recipe.steps[state.recipe.currentStepId];

      
      if (currentStep.ext === undefined) {
        currentStep.ext = {
          body: '',
          duration: 0,
        }
      } else {
        currentStep.ext = undefined;
      }
    },
    setCurrent: (state, action) => {
      if (state.recipe === null) {
        return;
      }

      const currentId = state.recipe.currentStepId;
      const currentStep = state.recipe.steps[currentId];
      
      state.recipe.steps[currentId] = { ...currentStep, ...action.payload };
    },
    setRecipe: (state, action) => {
      if (state.recipe === null) {
        return;
      }

      state.recipe = { ...state.recipe, ...action.payload };
    },
    startPlayMode: (state) => {
      if (state.recipe === null) {
        return;
      }

      // Reset play mode state
      state.playMode.status = 'playing';
      state.playMode.activeSteps = {};
      state.playMode.completedSteps = {};
      state.playMode.stepTimers = {};

      // Find all steps that have no parents (root steps)
      const rootSteps = Object.values(state.recipe!.steps).filter(step => {
        const hasParents = Object.values(state.recipe!.relations).some(rel => rel.childId === step.id);
        return !hasParents;
      });

      // Activate root steps
      rootSteps.forEach(step => {
        state.playMode.activeSteps[step.id] = 'active';
        if (step.ext?.duration) {
          state.playMode.stepTimers[step.id] = {
            startTime: Date.now(),
            duration: step.ext.duration * 1000 // Convert to milliseconds
          };
        }
      });
    },
    pausePlayMode: (state) => {
      state.playMode.status = 'paused';
    },
    resumePlayMode: (state) => {
      state.playMode.status = 'playing';
    },
    stopPlayMode: (state) => {
      state.playMode.status = 'idle';
      state.playMode.activeSteps = {};
      state.playMode.completedSteps = {};
      state.playMode.stepTimers = {};
    },
    completeStep: (state, action) => {
      const stepId = action.payload;
      
      if (state.recipe === null || state.playMode.status !== 'playing') {
        return;
      }

      // Mark step as completed
      state.playMode.activeSteps[stepId] = 'completed';
      state.playMode.completedSteps[stepId] = true;
      delete state.playMode.stepTimers[stepId];

      // Find child steps that can now be activated
      const childRelations = Object.values(state.recipe!.relations).filter(rel => rel.parentId === stepId);
      
      childRelations.forEach(relation => {
        const childId = relation.childId;
        const childStep = state.recipe!.steps[childId];
        
        if (!childStep) return;

        // Check if all parents of this child are completed
        const childParentRelations = Object.values(state.recipe!.relations).filter(rel => rel.childId === childId);
        const allParentsCompleted = childParentRelations.every(rel => 
          state.playMode.completedSteps[rel.parentId]
        );

        if (allParentsCompleted && !state.playMode.completedSteps[childId]) {
          state.playMode.activeSteps[childId] = 'active';
          if (childStep.ext?.duration) {
            state.playMode.stepTimers[childId] = {
              startTime: Date.now(),
              duration: childStep.ext.duration * 1000
            };
          }
        }
      });

      // Check if all steps are completed
      const allStepsCompleted = Object.values(state.recipe!.steps).every(step => 
        state.playMode.completedSteps[step.id]
      );

      if (allStepsCompleted) {
        state.playMode.status = 'completed';
      }
    },
    skipStep: (state, action) => {
      const stepId = action.payload;
      
      if (state.recipe === null || state.playMode.status !== 'playing') {
        return;
      }

      state.playMode.activeSteps[stepId] = 'skipped';
      state.playMode.completedSteps[stepId] = true;
      delete state.playMode.stepTimers[stepId];

      // Same logic as completeStep for activating children
      const childRelations = Object.values(state.recipe!.relations).filter(rel => rel.parentId === stepId);
      
      childRelations.forEach(relation => {
        const childId = relation.childId;
        const childStep = state.recipe!.steps[childId];
        
        if (!childStep) return;

        const childParentRelations = Object.values(state.recipe!.relations).filter(rel => rel.childId === childId);
        const allParentsCompleted = childParentRelations.every(rel => 
          state.playMode.completedSteps[rel.parentId]
        );

        if (allParentsCompleted && !state.playMode.completedSteps[childId]) {
          state.playMode.activeSteps[childId] = 'active';
          if (childStep.ext?.duration) {
            state.playMode.stepTimers[childId] = {
              startTime: Date.now(),
              duration: childStep.ext.duration * 1000
            };
          }
        }
      });

      const allStepsCompleted = Object.values(state.recipe!.steps).every(step => 
        state.playMode.completedSteps[step.id]
      );

      if (allStepsCompleted) {
        state.playMode.status = 'completed';
      }
    },
  },
  selectors: {
    selectRecipe: (state) => {
      return state.recipe;
    },
    selectLoading: (state) => {
      return state.loading;
    },
    selectError: (state) => {
      return state.error;
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
    selectDeletableConnections: (state) => {
      if (state.recipe === null) {
        return [];
      }

      const currentStepId = state.recipe.currentStepId;
      
      return getDeletableConnections(
        Object.values(state.recipe.steps),
        state.recipe.relations,
        currentStepId,
        state.recipe.rootStepId
      );
    },
    selectDeletableParentConnections: (state) => {
      if (state.recipe === null) {
        return [];
      }

      const currentStepId = state.recipe.currentStepId;
      const parentConnections = Object.entries(state.recipe.relations)
        .filter(([_, rel]) => rel.childId === currentStepId)
        .map(([id, _]) => id);

      return parentConnections.filter(relationId => 
        canDeleteConnection(
          Object.values(state.recipe!.steps),
          state.recipe!.relations,
          relationId,
          state.recipe!.rootStepId
        )
      );
    },
    selectDeletableChildConnections: (state) => {
      if (state.recipe === null) {
        return [];
      }

      const currentStepId = state.recipe.currentStepId;
      const childConnections = Object.entries(state.recipe.relations)
        .filter(([_, rel]) => rel.parentId === currentStepId)
        .map(([id, _]) => id);

      return childConnections.filter(relationId => 
        canDeleteConnection(
          Object.values(state.recipe!.steps),
          state.recipe!.relations,
          relationId,
          state.recipe!.rootStepId
        )
      );
    },
    selectPlayModeStatus: (state) => {
      return state.playMode.status;
    },
    selectActiveSteps: (state) => {
      return state.playMode.activeSteps;
    },
    selectCompletedSteps: (state) => {
      return state.playMode.completedSteps;
    },
    selectStepTimers: (state) => {
      return state.playMode.stepTimers;
    },
    selectActiveStepsList: (state) => {
      if (state.recipe === null) {
        return [];
      }

      return Object.entries(state.playMode.activeSteps)
        .filter(([_, status]) => status === 'active')
        .map(([stepId, _]) => state.recipe!.steps[stepId])
        .filter(Boolean);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(downloadRecipe.pending, (state) => {
        state.loading = true;
        state.recipe = null;
      })
      .addCase(downloadRecipe.rejected, (state, action) => {
        state.loading = false;
        state.recipe = null;
        state.error = action.payload as string;
      })
      .addCase(downloadRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.recipe = action.payload;
        state.error = null;
      });
  }
});

export const { 
  createStep,
  deleteStep,
  updateStep,
  appendStep,
  createConn,
  deleteConn,
  createEmpty,
  shiftCurrent,
  expandCurrent,
  setCurrent,
  setRecipe,
  startPlayMode,
  pausePlayMode,
  resumePlayMode,
  stopPlayMode,
  completeStep,
  skipStep,
} = recipeSlice.actions;

export const {  
  selectRecipe,
  selectLoading,
  selectError,
  selectCurrentStep,
  selectChildrenOfCurrent,
  selectParentsOfCurrent,
  selectPossibleChildren,
  selectDeletableConnections,
  selectDeletableParentConnections,
  selectDeletableChildConnections,
  selectPlayModeStatus,
  selectActiveSteps,
  selectCompletedSteps,
  selectStepTimers,
  selectActiveStepsList,
} = recipeSlice.selectors;

export const selectIsUserOwner = createSelector(
  [selectLogin, selectRecipe],
  (login, recipe) => login === recipe?.owner,
);

export default recipeSlice.reducer;
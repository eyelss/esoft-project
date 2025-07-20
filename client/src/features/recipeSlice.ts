import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { hasCycle, isDescendant, canDeleteConnection, getDeletableConnections } from "../utils/graph";
import { selectLogin } from "./authSlice";
import type { RootState } from "../store";
import { fetchApi } from "../utils/simple";

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
  status: ChangeStatus;
  parentId: string;
  childId: string;
}

export type Recipe = {
  id: string;
  title: string;
  description: string;
  owner: string;

  likes: number;
  likedByMe?: boolean;

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

export const deleteRecipe = createAsyncThunk(
  'recipe/deleteRecipe',
  async (id: Recipe['id'], { rejectWithValue }) => {
    const response = await fetch(`/api/recipes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error);
    }

    return await response.json();
  }
);

export const updateRecipe = createAsyncThunk(
  'recpie/uploadRecipe',
  async (_, { rejectWithValue, getState }) => {
    const recipe = (getState() as RootState).recipe.recipe;

    if (recipe === null) {
      return rejectWithValue('Null recipe state');
    }

    const payload = {
      recipeDto: recipe.status === 'modified' ? {
        title: recipe.title,
        description: recipe.description,
      } : {},
      stepsDto: Object.values(recipe.steps)
        .filter(step => step.status !== 'untouched')
        .map(step => {
          switch (step.status) {
            case 'created':
              return {
                tempId: step.id,
                action: 'create',
                title: step.title,
                instruction: step.instruction,
                extension: step.ext,
              }
            case 'modified':
              return {
                id: step.id,
                title: step.title,
                instruction: step.instruction,
                extension: step.ext,
                action: 'modified',
              }
            case 'deleted':
              return {
                id: step.id,
                action: 'delete',
              }
            default:
              throw new Error('Unreachable');
          }
        }),
      relationsDto: Object.values(recipe.relations)
        .filter(rel => rel.status !== 'untouched')
        .map(({ parentId, childId, status }) => ({ 
          parentId, 
          childId,
          action: status === 'created' ? 'create' : 'delete',
        })),
    }

    const response = await fetch(`/api/recipes/${recipe.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error);
    }

    return await response.json();
  }
)

export const createRecipe = createAsyncThunk(
  'recipe/createRecipe',
  async (_, { rejectWithValue, getState }) => {
    const recipe = (getState() as RootState).recipe.recipe;

    if (recipe === null) {
      return rejectWithValue('Null recipe state');
    }

    const recipeData = {
      title: recipe.title,
      description: recipe.description,
      rootId: recipe.rootStepId,
      steps: Object.values(recipe.steps).map(step => ({
        tempId: step.id,
        title: step.title,
        instruction: step.instruction,
        extension: step.ext,
      })),
      relations: Object.values(recipe.relations).map(rel => ({
        parentId: rel.parentId,
        childId: rel.childId,
      })),
    }

    const response = await fetchApi('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData);
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
        Object.entries(state.recipe.relations).forEach(([key, rel]) => {
          if (rel.parentId === id || rel.childId === id) {
            delete state.recipe?.relations[key];
          }
        })
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
        likes: 0,
        likedByMe: false,
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

      if (currentStep.status !== 'created') {
        currentStep.status = 'modified';
      }

      state.recipe.steps[currentId] = { ...currentStep, ...action.payload };
    },
    setRecipe: (state, action) => {
      if (state.recipe === null) {
        return;
      }

      if (state.recipe.status !== 'created') {
        state.recipe.status = 'modified';
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
    toggleLike: (state) => {
      if (state.recipe === null) {
        return;
      }
      
      if (state.recipe.likedByMe) {
        state.recipe.likes--;
      } else {
        state.recipe.likes++;
      }

      state.recipe.likedByMe = !state.recipe.likedByMe;
    }
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
      return state.recipe.steps[currentStepId];
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
    selectRecipeChangeStatus: (state) => {
      if (state.recipe === null) {
        return 'untouched';
      }

      if (state.recipe.status !== 'untouched') {
        return state.recipe.status;
      }

      if (Object.values(state.recipe.steps).find(step => step.status != 'untouched') !== undefined) {
        return 'modified';
      }

      if (Object.values(state.recipe.relations).find(rel => rel.status != 'untouched') !== undefined) {
        return 'modified';
      }

      return 'untouched'
    },
    selectStatusOfCurrent: (state) => {
      if (state.recipe === null) {
        return 'untouched';
      }

      const currentId = state.recipe.currentStepId;
      return state.recipe.steps[currentId].status;
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
        const payload = action.payload;
        
        // Map backend response to frontend Recipe format
        state.recipe = {
          id: payload.id,
          title: payload.title,
          description: payload.description,
          owner: payload.owner,
          status: 'untouched',
          currentStepId: payload.rootStepId,
          rootStepId: payload.rootStepId,
          likes: payload.likes,
          likedByMe: payload.likedByMe,
          steps: Object.entries(payload.steps).reduce((acc, [id, step]: [string, any]) => {
            acc[id] = {
              id: step.id,
              title: step.title,
              instruction: step.instruction,
              status: 'untouched' as ChangeStatus,
              ext: step.extension ? {
                body: step.extension.body,
                duration: step.extension.duration
              } : undefined
            };
            return acc;
          }, {} as { [id: string]: Step }),
          relations: Object.entries(payload.relations).reduce((acc, [key, relation]: [string, any]) => {
            acc[key] = {
              status: 'untouched' as ChangeStatus,
              parentId: relation.parentId,
              childId: relation.childId
            };
            return acc;
          }, {} as { [id: string]: Relation })
        };
        
        state.error = null;
      })
      .addCase(createRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.loading = false;
        const errorPayload = action.payload as any;
        state.error = errorPayload?.error || 'Failed to create recipe';
      })
      .addCase(createRecipe.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state) => {
        state.recipe = null;
      })
      .addCase(updateRecipe.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRecipe.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.recipe = {
          id: payload.id,
          title: payload.title,
          description: payload.description,
          owner: payload.owner,
          status: 'untouched',
          currentStepId: payload.rootStepId,
          rootStepId: payload.rootStepId,
          likes: payload.likes,
          likedByMe: payload.likedByMe,
          steps: Object.entries(payload.steps).reduce((acc, [id, step]: [string, any]) => {
            acc[id] = {
              id: step.id,
              title: step.title,
              instruction: step.instruction,
              status: 'untouched' as ChangeStatus,
              ext: step.extension ? {
                body: step.extension.body,
                duration: step.extension.duration
              } : undefined
            };
            return acc;
          }, {} as { [id: string]: Step }),
          relations: Object.entries(payload.relations).reduce((acc, [key, relation]: [string, any]) => {
            acc[key] = {
              status: 'untouched' as ChangeStatus,
              parentId: relation.parentId,
              childId: relation.childId
            };
            return acc;
          }, {} as { [id: string]: Relation })
        };
      });
  }
});

export const selectChildrenOfCurrent = createSelector(
  [ (state: RootState) => state.recipe.recipe ],
  (recipe) => {
    if (recipe === null) {
      return [];
    }

    const currentStepId = recipe.currentStepId;

    const steps = recipe.steps;

    return Object.values(recipe.relations)
      .filter(rel => rel.parentId === currentStepId)
      .map(rel => steps[rel.childId]);
});
export const selectParentsOfCurrent = createSelector(
  [ (state: RootState) => state.recipe.recipe ],
  (recipe) => {
  if (recipe === null) {
    return [];
  }

  const currentStepId = recipe.currentStepId;

  const steps = recipe.steps;

  return Object.values(recipe.relations)
    .filter(rel => rel.childId === currentStepId)
    .map(rel => steps[rel.parentId]);
});

export const selectPossibleChildren = createSelector(
  [
    (state: RootState) => state.recipe.recipe,
  ],
  (recipe) => {
  if (recipe === null) {
    return [];
  }

  const currentStepId = recipe.currentStepId;

  const steps = Object.values(recipe.steps);
  const rels = Object.values(recipe.relations);

  return steps.filter(step => 
    !hasCycle(steps, rels, currentStepId, step.id) && 
    !isDescendant(steps, rels, currentStepId, step.id)
  );
});

export const selectDeletableParentConnections = createSelector(
  [
    (state: RootState) => state.recipe.recipe,
  ],
  (recipe) => {
  if (recipe === null) {
    return [];
  }

  const currentStepId = recipe.currentStepId;
  const parentConnections = Object.entries(recipe.relations)
    .filter(([_, rel]) => rel.childId === currentStepId)
    .map(([id, _]) => id);

  return parentConnections.filter(relationId => 
    canDeleteConnection(
      Object.values(recipe!.steps),
      recipe!.relations,
      relationId,
      recipe!.rootStepId
    )
  );
});

export const selectDeletableChildConnections = createSelector(
  [
    (state: RootState) => state.recipe.recipe,
  ],
  (recipe) => {
  if (recipe === null) {
    return [];
  }

  const currentStepId = recipe.currentStepId;
  const childConnections = Object.entries(recipe.relations)
    .filter(([_, rel]) => rel.parentId === currentStepId)
    .map(([id, _]) => id);

  return childConnections.filter(relationId => 
    canDeleteConnection(
      Object.values(recipe!.steps),
      recipe!.relations,
      relationId,
      recipe!.rootStepId
    )
  );
});

export const selectActiveStepsList = createSelector(
  [
    (state: RootState) => state.recipe.recipe,
    (state: RootState) => state.recipe.playMode,
  ],
  (recipe, playMode) => {
    return Object.entries(playMode.activeSteps)
      .filter(([_, status]) => status === 'active')
      .map(([stepId, _]) => recipe!.steps[stepId])
      .filter(Boolean);
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
  toggleLike,
} = recipeSlice.actions;

export const {  
  selectRecipe,
  selectLoading,
  selectError,
  selectCurrentStep,
  selectStatusOfCurrent,
  selectDeletableConnections,
  selectPlayModeStatus,
  selectActiveSteps,
  selectCompletedSteps,
  selectStepTimers,
  selectRecipeChangeStatus,
} = recipeSlice.selectors;

export const selectIsUserOwner = createSelector(
  [selectLogin, selectRecipe],
  (login, recipe) => login === recipe?.owner,
);

export default recipeSlice.reducer;
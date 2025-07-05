import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, ButtonGroup, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, FormControl, Grow, IconButton, InputLabel, Link, List, ListItem, ListItemButton, ListSubheader, MenuItem, OutlinedInput, Paper, Rating, Select, TextField, Toolbar, Tooltip, Typography, type SelectChangeEvent, Skeleton, Alert } from "@mui/material";
import { useAppDispatch } from "../store";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import { downloadRecipe, createEmpty, selectCurrentStep, selectParentsOfCurrent, selectChildrenOfCurrent, appendStep, selectPossibleChildren, shiftCurrent, createConn, expandCurrent, setCurrent, selectRecipe, selectIsUserOwner, setRecipe, deleteConn, selectDeletableParentConnections, selectDeletableChildConnections, selectPlayModeStatus, selectLoading, selectError } from "../features/recipeSlice";
import { selectUser } from "../features/authSlice";
import { TransitionGroup } from 'react-transition-group';
import ListItemButtonStep from "../components/ListItemButtonStep";
import PlayMode from "../components/PlayMode";
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { parseTime } from "../utils/time";
import useRecipeAuth from "../hooks/useRecipeAuth";

// Loading Skeleton Components
const RecipeSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="text" width={300} height={40} />
      <Skeleton variant="rectangular" width={120} height={40} />
    </Box>
    
    <Paper sx={{ p: 2, mb: 2 }}>
      <Skeleton variant="text" width="100%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} />
    </Paper>
    
    <Accordion>
      <AccordionSummary>
        <Skeleton variant="text" width={150} height={32} />
      </AccordionSummary>
      <AccordionDetails>
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={20} />
      </AccordionDetails>
    </Accordion>
  </Box>
);

const EditModeSkeleton = () => (
  <Box sx={{ display: 'flex', height: '100vh', gap: 1 }}>
    <Paper sx={{ width: '10vw', overflow: 'auto' }}>
      <List subheader={<ListSubheader>Parents</ListSubheader>}>
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="80%" height={48} />
      </List>
    </Paper>

    <Paper sx={{ flex: 1 }}>
      <Box sx={{ m: 1 }}>
        <Skeleton variant="text" width={200} height={32} />
      </Box>
      
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Skeleton variant="text" width="100%" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={80} />
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={80} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 2 }} />
      </Box>
    </Paper>

    <Paper sx={{ width: '10vw', overflow: 'auto' }}>
      <List subheader={<ListSubheader>Children</ListSubheader>}>
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="90%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="85%" height={48} />
      </List>
    </Paper>
  </Box>
);

// Error Component
const RecipeNotFound = ({ recipeId }: { recipeId: string }) => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      p: 3
    }}>
      <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>
          Recipe Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          The recipe with ID "{recipeId}" could not be found. It may have been deleted or you may not have permission to access it.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/recipe')}
          >
            Create New Recipe
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};

function Editor() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentStep = useSelector(selectCurrentStep);
  const children = useSelector(selectChildrenOfCurrent);
  const parents = useSelector(selectParentsOfCurrent);
  const possibleChildren = useSelector(selectPossibleChildren);
  const deletableParentConnections = useSelector(selectDeletableParentConnections);
  const deletableChildConnections = useSelector(selectDeletableChildConnections);
  const recipe = useSelector(selectRecipe);
  const { title, description, status } = recipe || {};
  const isOwning = useSelector(selectIsUserOwner);
  const [dialOpen, setDialOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const isDeletable = children.length === 0; // && isOwning; 

  const params = useParams();

  // Get loading and error states from Redux
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  // Get user authentication status
  const user = useSelector(selectUser);

  useRecipeAuth();

  useEffect(() => {
    if (params.recipeId === undefined) {
      if (status !== 'created') {
        dispatch(createEmpty('owner'));
      }
    } else {
      dispatch(downloadRecipe(params.recipeId));
    }
    
  }, [params.recipeId, status, dispatch]);

  // Prevent non-authenticated users from accessing edit mode
  useEffect(() => {
    if (editMode && !user) {
      setEditMode(false);
    }
  }, [editMode, user]);

  // Show loading skeleton
  if (loading) {
    return editMode ? <EditModeSkeleton /> : <RecipeSkeleton />;
  }

  // Show error for 404 or other errors
  if (error && params.recipeId) {
    if (String(error) === '404') {
      return <RecipeNotFound recipeId={params.recipeId} />;
    }
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        p: 3
      }}>
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
          <Typography variant="h5" gutterBottom>
            Error Loading Recipe
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            An error occurred while loading the recipe. Please try again.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Helper function to find relation ID for a parent connection
  const getParentRelationId = (parentId: string) => {
    if (!recipe || !currentStep) return null;
    
    const relationEntry = Object.entries(recipe.relations).find(
      ([_, rel]) => rel.childId === currentStep.id && rel.parentId === parentId
    );
    return relationEntry ? relationEntry[0] : null;
  };

  // Helper function to find relation ID for a child connection
  const getChildRelationId = (childId: string) => {
    if (!recipe || !currentStep) return null;
    
    const relationEntry = Object.entries(recipe.relations).find(
      ([_, rel]) => rel.parentId === currentStep.id && rel.childId === childId
    );
    return relationEntry ? relationEntry[0] : null;
  };

  // Handle parent connection deletion
  const handleDeleteParentConnection = (parentId: string) => {
    const relationId = getParentRelationId(parentId);
    if (relationId && deletableParentConnections.includes(relationId)) {
      dispatch(deleteConn(relationId));
    }
  };

  // Handle child connection deletion
  const handleDeleteChildConnection = (childId: string) => {
    const relationId = getChildRelationId(childId);
    if (relationId && deletableChildConnections.includes(relationId)) {
      dispatch(deleteConn(relationId));
    }
  };

  return (

    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        gap: 1,
      }}
    >
      {editMode && (
        <Paper sx={{ width: '10vw', overflow: 'auto' }}>
          <List subheader={
            <ListSubheader>
              Parents
            </ListSubheader>
          }>
            <TransitionGroup>
            {currentStep !== undefined ? 
              parents.map(parent => {
                const relationId = getParentRelationId(parent.id);
                const isDeletable = relationId && deletableParentConnections.includes(relationId);
                
                return (
                  <Collapse key={parent.id}>
                  <ListItemButtonStep 
                    key={parent.id}
                    status={parent.status}
                    onClick={() => dispatch(shiftCurrent(parent.id))}
                    deletable={!!(isDeletable && editMode)}
                    onClickDelete={() => handleDeleteParentConnection(parent.id)}
                  >
                    {parent.title}
                  </ListItemButtonStep>
                  </Collapse>
                );
              }) : ''
            }
            </TransitionGroup>
          </List>
        </Paper>
      )}

      <Paper sx={{ flex: 1 }}>
        {!editMode ? (
          // Play Mode View
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                {title || 'Recipe Title'}
              </Typography>
              {user && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Edit Recipe
                </Button>
              )}
            </Box>
            
            <PlayMode />
            
            {/* Recipe Info */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography variant="h6">
                  Recipe Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {description || 'Recipe description'}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        ) : (
          // Edit Mode View
          <>
            <Breadcrumbs aria-label="breadcrumb" sx={{ m: 1, alignContent: 'center'}}>
              { editMode &&
                <Link
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center' }}
                  color="inherit"
                  component="button"
                  onClick={() => setEditMode(false)}
                >
                  <PlayArrowIcon sx={{ mr: .6 }} fontSize="inherit"/>
                  Play
                </Link>
              }
              { isDeletable && editMode &&
                <Link
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center' }}
                  color="inherit"
                  component="button"
                  onClick={() => {}}
                >
                  <DeleteIcon sx={{ mr: .6 }} fontSize="inherit"/>
                  Delete
                </Link>
              }
            </Breadcrumbs>
            
            {/* Recipe Title and Description */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField 
                fullWidth
                id="recipe-title" 
                label="Recipe Title" 
                variant="standard" 
                value={title} 
                onChange={(e) => dispatch(setRecipe({ title: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField 
                fullWidth
                multiline 
                id="recipe-description" 
                label="Recipe Description" 
                value={description} 
                onChange={(e) => dispatch(setRecipe({ description: e.target.value }))}
                rows={3}
              />
            </Box>
            
            {/* Current Step */}
            <Box sx={{ p: 2, minHeight: 0, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Current Step
              </Typography>
              <TextField
                fullWidth 
                id="step-title" 
                variant="standard" 
                label="Step Title" 
                value={currentStep?.title ?? ''} 
                onChange={(e) => dispatch(setCurrent({ title: e.target.value }))} 
                sx={{ mb: 2 }}
              />
              <TextField 
                multiline 
                fullWidth 
                label="Step Instruction" 
                id="step-instruction" 
                value={currentStep?.instruction ?? ''} 
                onChange={(e) => dispatch(setCurrent({ instruction: e.target.value }))}
                rows={3}
                sx={{ mb: 2 }}
              />
              
              <Button sx={{ mb: 2 }} fullWidth onClick={() => dispatch(expandCurrent())}>
                {currentStep?.ext === undefined ?
                  'Add Duration & Body' : 'Remove Duration & Body'
                }
              </Button>
              
              {currentStep?.ext !== undefined && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <TextField 
                    sx={{ mb: 2 }} 
                    multiline 
                    fullWidth 
                    label="Step Body" 
                    id="ext-step-body" 
                    value={currentStep?.ext?.body || ''} 
                    onChange={(e) => dispatch(setCurrent({ 
                      ext: { 
                        ...currentStep.ext!, 
                        body: e.target.value 
                      } 
                    }))}
                    rows={3}
                  />
                  <TimeField 
                    sx={{ mb: 2 }} 
                    label="Duration" 
                    value={parseTime(currentStep?.ext?.duration ?? 0)} 
                    format="HH:mm:ss"
                    onChange={(newValue) => {
                      if (newValue) {
                        const duration = newValue.hour() * 3600 + newValue.minute() * 60 + newValue.second();
                        dispatch(setCurrent({ 
                          ext: { 
                            ...currentStep.ext!, 
                            duration 
                          } 
                        }));
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          </>
        )}
      </Paper>

      {editMode && (
        <Paper sx={{ width: '10vw', overflow: 'auto' }}>
          <List subheader={
            <ListSubheader>
              <Box sx={{ textAlign: 'center' }}>
                Children
              </Box>
              <Collapse in={editMode}>
              <ButtonGroup>
                <Tooltip title="Add new child from existing step">
                  <IconButton onClick={() => setDialOpen(true)}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Create new child">
                  <IconButton onClick={() => dispatch(appendStep({ title: 'New step', instruction: 'New beginning' }))}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
              </Collapse>
            </ListSubheader>
          }>
            <TransitionGroup>
            {currentStep !== undefined ? 
              children.map(child => {
                const relationId = getChildRelationId(child.id);
                const isDeletable = relationId && deletableChildConnections.includes(relationId);
                
                return (
                  <Collapse key={child.id}>
                  <ListItemButtonStep
                    status={child.status}
                    key={child.id}
                    onClick={() => dispatch(shiftCurrent(child.id))}
                    deletable={!!(isDeletable && editMode)}
                    onClickDelete={() => handleDeleteChildConnection(child.id)}
                  >
                    {child.title}
                  </ListItemButtonStep>
                  </Collapse>
                );
              }) : ''
            }
            </TransitionGroup>
          </List>
        </Paper>
      )}
      <Dialog
        open={dialOpen}
      >
        <DialogTitle>Choose existed step.</DialogTitle>
        <DialogContent>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="step-existed-connection-label">Step</InputLabel>
            <Select
              labelId="step-existed-connection-label"
              id="step-existed-connection"
              value={selectedStepId}
              onChange={(e: SelectChangeEvent<string>) => {
                setSelectedStepId(e.target.value);
              }}
              input={<OutlinedInput label="Step" id="step-existed-connection-label" />}
            >
              {possibleChildren.map(step => 
                <MenuItem value={step.id}>{step.title}</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            dispatch(createConn({ parentId: currentStep?.id, childId: selectedStepId }))
            setDialOpen(false);
          }}>Ok</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Editor;
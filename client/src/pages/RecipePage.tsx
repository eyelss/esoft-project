import { Box, List, ListItem, ListItemButton, ListSubheader, Paper } from "@mui/material";
import { useAppDispatch } from "../store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { loadRecipe, createEmpty, selectCurrentStep, selectParentsOfCurrent, selectChildrenOfCurrent, appendStep } from "../features/recipeSlice";

function Editor() {
  const dispatch = useAppDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const children = useSelector(selectChildrenOfCurrent);
  const parents = useSelector(selectParentsOfCurrent);

  const params = useParams();

  useEffect(() => {
    if (params.recipeId === undefined) {
      dispatch(createEmpty());
    } else {
      dispatch(loadRecipe(params.recipeId));
    }
    
  }, [params.recipeId, dispatch]);

  // useEffect(() => {
  //   setCurrentStep(recipe?.root);
  // }, [recipe]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        p: 2,
        gap: 2,
      }}
    >
      <Paper sx={{ width: '10vw', overflow: 'auto' }}>
        <List subheader={
          <ListSubheader>
            Parents
          </ListSubheader>
        }>
          {currentStep !== undefined ? 
            parents.map(parent => 
              <ListItemButton key={parent.title}>{parent.title}</ListItemButton>
            ) : ''
          }
          <ListItemButton key="add" onClick={() => console.log('add parent')}>Add</ListItemButton>
        </List>
      </Paper>

      <Paper sx={{ flex: 1 }}>
        <Box sx={{ p: 3 }}>
          <h2>Recipe content</h2>
          <p>Primary recipe content section</p>
          <h2>{currentStep?.title}</h2>
          <p>{currentStep?.description}</p>
        </Box>
      </Paper>

      <Paper sx={{ width: '10vw', overflow: 'auto' }}>
        <List subheader={
          <ListSubheader>
            Children
          </ListSubheader>
        }>
          {currentStep !== undefined ? 
            children.map(child => 
              <ListItemButton key={child.title}>{child.title}</ListItemButton>
            ) : ''
          }
          <ListItemButton key="add" onClick={() => dispatch(appendStep('another one'))}>Add</ListItemButton>
        </List>
      </Paper>
    </Box>
  );
}

export default Editor;
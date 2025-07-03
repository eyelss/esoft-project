import { Box, Button, ButtonGroup, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, List, ListItemButton, ListSubheader, MenuItem, OutlinedInput, Paper, Select, Toolbar, type SelectChangeEvent } from "@mui/material";
import { useAppDispatch } from "../store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share"
import EditIcon from '@mui/icons-material/Edit';
import { loadRecipe, createEmpty, selectCurrentStep, selectParentsOfCurrent, selectChildrenOfCurrent, appendStep, selectPossibleChildren, shiftCurrent, createConn, selectRecipeContent } from "../features/recipeSlice";
import { TransitionGroup } from 'react-transition-group';
import ListItemButtonStep from "../components/ListItemButtonStep";

function Editor() {
  const dispatch = useAppDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const children = useSelector(selectChildrenOfCurrent);
  const parents = useSelector(selectParentsOfCurrent);
  const possibleChildren = useSelector(selectPossibleChildren);
  const [recipeTitle, recipeDescription, recipeStatus] = useSelector(selectRecipeContent);
  const [dialOpen, setDialOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState('');
  const [editable, setEditable] = useState(false);

  const params = useParams();

  useEffect(() => {
    if (params.recipeId === undefined) {
      if (recipeStatus !== 'created') {
        dispatch(createEmpty());
      }
    } else {
      dispatch(loadRecipe(params.recipeId));
    }
    
  }, [params.recipeId, dispatch]);

  return (

    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        gap: 1,
      }}
    >
      <Paper sx={{ width: '10vw', overflow: 'auto' }}>
        <List subheader={
          <ListSubheader>
            Parents
          </ListSubheader>
        }>
          <TransitionGroup>
          {currentStep !== undefined ? 
            parents.map(parent => 
              <Collapse key={parent.id}>
              <ListItemButton 
                key={parent.id}
                onClick={() => dispatch(shiftCurrent(parent.id))}
                >
                {parent.title}
              </ListItemButton>
              </Collapse>
            ) : ''
          }
          </TransitionGroup>
        </List>
      </Paper>

      <Paper sx={{ flex: 1 }}>
        <EditIcon/>
        <Box sx={{ p: 3 }}>
          <h2>{recipeTitle}</h2>
          <p>{recipeDescription}</p>
          <h2>{currentStep?.title}</h2>
          <p>{currentStep?.description}</p>
        </Box>
      </Paper>

      <Paper sx={{ width: '10vw', overflow: 'auto' }}>
        <List subheader={
          <ListSubheader sx={{ alignItems: 'center', justifyItems: 'center', justifyContent: 'center'}}>
            <Box sx={{ textAlign: 'center' }}>
              Children
            </Box>
            <ButtonGroup sx={{ justifySelf: 'center'}}>
              <IconButton onClick={() => setDialOpen(true)}>
                <ShareIcon />
              </IconButton>
              <IconButton onClick={() => dispatch(appendStep('another one'))}>
                <AddIcon />
              </IconButton>
            </ButtonGroup>
          </ListSubheader>
        }>
          <TransitionGroup>
          {currentStep !== undefined ? 
            children.map(child => 
              <Collapse key={child.id}>
              <ListItemButtonStep
                status={child.status}
                key={child.id}
                onClick={() => dispatch(shiftCurrent(child.id))}
              >
                {child.title}
              </ListItemButtonStep>
              </Collapse>
            ) : ''
          }
          </TransitionGroup>
        </List>
      </Paper>
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
            // console.log(selected)
            dispatch(createConn({ parentId: currentStep?.id, childId: selectedStepId }))
            setDialOpen(false);
          }}>Ok</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Editor;
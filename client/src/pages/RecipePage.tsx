import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, List, ListItemButton, ListSubheader, MenuItem, OutlinedInput, Paper, Select, type SelectChangeEvent } from "@mui/material";
import { useAppDispatch } from "../store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share"
import { loadRecipe, createEmpty, selectCurrentStep, selectParentsOfCurrent, selectChildrenOfCurrent, appendStep, selectPossibleChildren, shiftCurrent, createConn } from "../features/recipeSlice";

function Editor() {
  const dispatch = useAppDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const children = useSelector(selectChildrenOfCurrent);
  const parents = useSelector(selectParentsOfCurrent);
  const possibleChildren = useSelector(selectPossibleChildren);
  const [dialOpen, setDialOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState('');

  const params = useParams();

  useEffect(() => {
    if (params.recipeId === undefined) {
      dispatch(createEmpty());
    } else {
      dispatch(loadRecipe(params.recipeId));
    }
    
  }, [params.recipeId, dispatch]);

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
              <ListItemButton 
                key={parent.id}
                onClick={() => dispatch(shiftCurrent(parent.id))}
              >
                {parent.title}
              </ListItemButton>
            ) : ''
          }
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
            <IconButton onClick={() => setDialOpen(true)}>
              <ShareIcon />
            </IconButton>
            <IconButton onClick={() => dispatch(appendStep('another one'))}>
              <AddIcon />
            </IconButton>
          </ListSubheader>
        }>
          {currentStep !== undefined ? 
            children.map(child => 
              <ListItemButton
                key={child.id}
                onClick={() => dispatch(shiftCurrent(child.id))}
              >
                {child.title}
              </ListItemButton>
            ) : ''
          }
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
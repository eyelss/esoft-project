import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, ButtonGroup, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, FormControl, Grow, IconButton, InputLabel, Link, List, ListItem, ListItemButton, ListSubheader, MenuItem, OutlinedInput, Paper, Rating, Select, TextField, Toolbar, Tooltip, Typography, type SelectChangeEvent } from "@mui/material";
import { useAppDispatch } from "../store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from '@mui/icons-material/Remove';
import ShareIcon from "@mui/icons-material/Share"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import FeedIcon from '@mui/icons-material/Feed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { downloadRecipe, createEmpty, selectCurrentStep, selectParentsOfCurrent, selectChildrenOfCurrent, appendStep, selectPossibleChildren, shiftCurrent, createConn, expandCurrent, setCurrent, selectRecipe, selectIsUserOwner, setRecipe, deleteConn } from "../features/recipeSlice";
import { TransitionGroup } from 'react-transition-group';
import ListItemButtonStep from "../components/ListItemButtonStep";
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { parseTime } from "../utils/time";

function Editor() {
  const dispatch = useAppDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const children = useSelector(selectChildrenOfCurrent);
  const parents = useSelector(selectParentsOfCurrent);
  const possibleChildren = useSelector(selectPossibleChildren);
  const { title, description, status } = useSelector(selectRecipe) || {};
  const isOwning = useSelector(selectIsUserOwner);
  const [dialOpen, setDialOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState('');
  const [editMode, setEditMode] = useState(false);

  const params = useParams();

  useEffect(() => {
    if (params.recipeId === undefined) {
      if (status !== 'created') {
        dispatch(createEmpty('owner'));
      }
    } else {
      dispatch(downloadRecipe(params.recipeId));
    }
    
  }, [params.recipeId, status, dispatch]);

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
              <ListItemButtonStep 
                key={parent.id}
                status={parent.status}
                onClick={() => dispatch(shiftCurrent(parent.id))}
                deletable={parents.length > 1}
              >
                {parent.title}
              </ListItemButtonStep>
              </Collapse>
            ) : ''
          }
          </TransitionGroup>
        </List>
      </Paper>

      <Paper sx={{ flex: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ m: 1, alignContent: 'center'}}>
          {!editMode &&
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
              color="inherit"
              component="button"
              onClick={() => {}}
            >
              <PlayArrowIcon sx={{ mr: .6 }} fontSize="inherit"/>
              Play
            </Link>
          }
          { !editMode &&
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
              color="inherit"
              component="button"
              onClick={() => setEditMode(true)}
            >
              <EditIcon sx={{ mr: .6 }} fontSize="inherit"/>
              Edit
            </Link>
          }
          { editMode &&
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
              color="inherit"
              component="button"
              onClick={() => setEditMode(false)}
            >
              <SaveIcon sx={{ mr: .6 }} fontSize="inherit"/>
              Save
            </Link>
          }
          {children.length === 0 &&
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
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon/>}
          >
            <TextField 
              fullWidth
              id="recipe-title" 
              label="Title" 
              variant="standard" 
              value={title} 
              slotProps={{ input: { readOnly: !editMode } }}
              onChange={(e) => dispatch(setRecipe({ title: e.target.value }))}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </AccordionSummary>
          <AccordionDetails>
            <TextField 
              fullWidth
              multiline 
              id="recipe-description" 
              label="Description" 
              value={description} 
              slotProps={{ input: { readOnly: !editMode } }}
              onChange={(e) => dispatch(setRecipe({ description: e.target.value }))}
            />
            <Rating sx={{ py: 1 }} size="small"/>
          </AccordionDetails>
        </Accordion>
        <Divider/>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon/>}
          >
            <TextField
              fullWidth 
              id="step-title" 
              variant="standard" 
              label="Title" 
              value={currentStep?.title ?? ''} 
              slotProps={{ input: { readOnly: !editMode } }}
              onChange={(e) => dispatch(setCurrent({ title: e.target.value }))}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </AccordionSummary>
          <AccordionDetails>
            <TextField 
              multiline 
              fullWidth 
              label="Instruction" 
              id="step-instruction" 
              value={currentStep?.instruction ?? ''} 
              slotProps={{ input: { readOnly: !editMode } }}
              onChange={(e) => dispatch(setCurrent({ instruction: e.target.value }))}

            />
              <Collapse in={editMode}>
              <Button sx={{ my: 2 }} fullWidth onClick={() => dispatch(expandCurrent())}>
                {currentStep?.ext === undefined ?
                  'Extend' : 'Short'
                }
              </Button>
              </Collapse>
            <Collapse in={currentStep?.ext !== undefined}>
              <TextField sx={{ my: 1 }} multiline fullWidth label="Body" id="ext-step-body" defaultValue={currentStep?.ext?.body} slotProps={{ input: { readOnly: !editMode } }}/>
              <TimeField sx={{ my: 1 }} label="Duration" defaultValue={parseTime(currentStep?.ext?.duration ?? 0)} format="HH:mm:ss"/>
            </Collapse>
          </AccordionDetails>
        </Accordion>
        <Fade in={editMode}>
          <Button sx={{ my: 2 }} fullWidth onClick={() => {}}>
            Update
          </Button>
        </Fade>
      </Paper>

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
import { Box, Typography, Paper, IconButton, Button, Chip } from "@mui/material";
import { useSelector } from "react-redux";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { 
  selectPlayModeStatus, 
  selectActiveSteps, 
  selectCompletedSteps, 
  selectStepTimers,
  selectActiveStepsList,
  selectRecipe,
  startPlayMode,
  pausePlayMode,
  resumePlayMode,
  stopPlayMode,
  completeStep,
  skipStep
} from "../features/recipeSlice";
import { useAppDispatch } from "../store";
import StepTimer from "./StepTimer";

const PlayMode = () => {
  const dispatch = useAppDispatch();
  const playStatus = useSelector(selectPlayModeStatus);
  const activeSteps = useSelector(selectActiveSteps);
  const completedSteps = useSelector(selectCompletedSteps);
  const stepTimers = useSelector(selectStepTimers);
  const activeStepsList = useSelector(selectActiveStepsList);
  const recipe = useSelector(selectRecipe);

  const handleStart = () => {
    dispatch(startPlayMode());
  };

  const handlePause = () => {
    dispatch(pausePlayMode());
  };

  const handleResume = () => {
    dispatch(resumePlayMode());
  };

  const handleStop = () => {
    dispatch(stopPlayMode());
  };

  const handleCompleteStep = (stepId: string) => {
    dispatch(completeStep(stepId));
  };

  const handleSkipStep = (stepId: string) => {
    dispatch(skipStep(stepId));
  };

  const isPlaying = playStatus === 'playing';
  const isPaused = playStatus === 'paused';
  const isCompleted = playStatus === 'completed';

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Recipe Play Mode
        </Typography>
        
        <Chip 
          label={playStatus.toUpperCase()} 
          color={
            playStatus === 'playing' ? 'success' :
            playStatus === 'paused' ? 'warning' :
            playStatus === 'completed' ? 'info' : 'default'
          }
          sx={{ mr: 2 }}
        />
        
        <Box sx={{ flexGrow: 1 }} />
        
        {playStatus === 'idle' && (
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleStart}
          >
            Start Recipe
          </Button>
        )}
        
        {isPlaying && (
          <Button
            variant="outlined"
            startIcon={<PauseIcon />}
            onClick={handlePause}
          >
            Pause
          </Button>
        )}
        
        {isPaused && (
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleResume}
          >
            Resume
          </Button>
        )}
        
        {(isPlaying || isPaused) && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStop}
            sx={{ ml: 1 }}
          >
            Stop
          </Button>
        )}
      </Box>

      {isCompleted && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" color="success.main">
            Recipe Completed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            All steps have been completed successfully.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleStart}
          >
            Play Again
          </Button>
        </Box>
      )}

      {activeStepsList.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Active Steps ({activeStepsList.length})
          </Typography>
          
          {activeStepsList.map(step => {
            const hasTimer = step.ext?.duration && stepTimers[step.id];
            
            if (hasTimer) {
              const timer = stepTimers[step.id];
              return (
                <StepTimer
                  key={step.id}
                  stepId={step.id}
                  title={step.title}
                  duration={step.ext!.duration}
                  startTime={timer.startTime}
                  body={step.ext!.body}
                  onComplete={handleCompleteStep}
                  onSkip={handleSkipStep}
                />
              );
            } else {
              return (
                <Box key={step.id} sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'primary.main', 
                  borderRadius: 2, 
                  mb: 2,
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.instruction}
                    </Typography>
                    {step.ext?.body && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                        {step.ext.body}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box>
                    <IconButton 
                      color="success" 
                      onClick={() => handleCompleteStep(step.id)}
                      title="Mark as completed"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton 
                      color="warning" 
                      onClick={() => handleSkipStep(step.id)}
                      title="Skip step"
                    >
                      <SkipNextIcon />
                    </IconButton>
                  </Box>
                </Box>
              );
            }
          })}
        </Box>
      )}

      {completedSteps && Object.keys(completedSteps).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Completed Steps ({Object.keys(completedSteps).length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.keys(completedSteps).map(stepId => {
              const stepTitle = recipe?.steps[stepId]?.title || `Step ${stepId}`;
              return (
                <Chip 
                  key={stepId} 
                  label={stepTitle}
                  color="success" 
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PlayMode; 
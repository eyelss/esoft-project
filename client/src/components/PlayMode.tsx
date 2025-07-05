import { Box, Typography, Paper, IconButton, Button, Chip } from "@mui/material";
import { useSelector } from "react-redux";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { 
  selectPlayModeStatus,
  selectCompletedSteps,
  selectActiveStepsList,
  selectRecipe,
  startPlayMode,
  pausePlayMode,
  resumePlayMode,
  stopPlayMode,
  completeStep,
  skipStep,
  type Step
} from "../features/recipeSlice";
import { useAppDispatch } from "../store";
import StepTimer from "./StepTimer";
import { useState, useRef, useEffect } from 'react';

type Timer = {
  startTime: number;
  accumulatedPause: number;
  pauseStart: number | null;
  isCompleted: boolean;
};

const PlayMode = () => {
  const dispatch = useAppDispatch();
  const playStatus = useSelector(selectPlayModeStatus);
  const completedSteps = useSelector(selectCompletedSteps);
  const activeStepsList = useSelector(selectActiveStepsList);
  const recipe = useSelector(selectRecipe);
  const [timers, setTimers] = useState<{ [stepId: string]: Timer }>({});
  const intervalRef = useRef<number | null>(null);
  const timersRef = useRef(timers);

  // Keep timersRef in sync with timers state
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  const handleStart = () => {
    resetTimers();
    dispatch(startPlayMode());
  };

  const handlePause = () => {
    setTimers(t => {
      const updated = { ...t };
      Object.keys(updated).forEach(stepId => {
        if (!updated[stepId].isCompleted && updated[stepId].pauseStart === null) {
          updated[stepId].pauseStart = Date.now();
        }
      });
      return updated;
    });
    dispatch(pausePlayMode());
  };

  const handleResume = () => {
    setTimers(t => {
      const updated = { ...t };
      Object.keys(updated).forEach(stepId => {
        if (!updated[stepId].isCompleted && updated[stepId].pauseStart !== null) {
          updated[stepId].accumulatedPause += Date.now() - updated[stepId].pauseStart!;
          updated[stepId].pauseStart = null;
        }
      });
      return updated;
    });
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

  // Helper to initialize timer for a step
  const initTimer = (stepId: string) => {
    setTimers(t => ({
      ...t,
      [stepId]: {
        startTime: Date.now(),
        accumulatedPause: 0,
        pauseStart: null,
        isCompleted: false,
      }
    }));
  };

  // Start timer for a step
  const handleStartTimer = (stepId: string) => {
    initTimer(stepId);
  };

  // Reset all timers (for replay)
  const resetTimers = () => {
    setTimers({});
  };

  // Timer ticking effect
  useEffect(() => {
    if (playStatus !== 'playing') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setTimers(() => {
        const updated = { ...timersRef.current };
        Object.keys(updated).forEach(stepId => {
          const timer = updated[stepId];
          if (!timer.isCompleted && timer.pauseStart === null) {
            // Find the step to get its duration
            const step = activeStepsList.find(s => s.id === stepId);
            const duration = step?.ext?.duration || 0;
            const elapsed = Math.floor((Date.now() - timer.startTime - timer.accumulatedPause) / 1000);
            const timeLeft = Math.max(0, duration - elapsed);
            if (timeLeft === 0) {
              updated[stepId].isCompleted = true;
            }
          }
        });
        return updated;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playStatus, activeStepsList]);

  // Helper function to render a timer step
  const renderTimerStep = (step: Step, timer: Timer, timeLeft: number) => {
    if (!step.ext) return null;
    const { duration, body } = step.ext;
    return (
      <StepTimer
        key={step.id}
        stepId={step.id}
        title={step.title}
        duration={duration}
        startTime={timer.startTime}
        body={body}
        paused={isPaused || !!timer.pauseStart}
        onComplete={handleCompleteStep}
        onSkip={handleSkipStep}
        timeLeft={timeLeft}
        isCompleted={timer.isCompleted}
      />
    );
  };

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
            if (step.ext?.duration) {
              const timer = timers[step.id];
              if (!timer) {
                if (!step.ext) return null;
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
                    justifyContent: 'space-between',
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{step.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{step.instruction}</Typography>
                      {step.ext?.body && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          {step.ext.body}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleStartTimer(step.id)}
                      sx={{ ml: 2 }}
                      disabled={isPaused}
                    >
                      Start
                    </Button>
                  </Box>
                );
              }
              if (!step.ext) return null;
              const { duration } = step.ext;
              // Calculate timeLeft for this timer
              const elapsed = Math.floor((Date.now() - timer.startTime - timer.accumulatedPause) / 1000);
              const timeLeft = Math.max(0, duration - elapsed);
              return renderTimerStep(step, timer, timeLeft);
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
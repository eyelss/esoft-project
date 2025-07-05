import { Box, Typography, LinearProgress, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { formatTime } from "../utils/time";

interface StepTimerProps {
  stepId: string;
  title: string;
  duration: number; // in seconds
  startTime: number;
  body?: string;
  paused?: boolean;
  timeLeft: number;
  isCompleted: boolean;
  onComplete: (stepId: string) => void;
  onSkip: (stepId: string) => void;
}

const StepTimer = ({ stepId, title, duration, body, paused = false, timeLeft, isCompleted, onComplete, onSkip }: StepTimerProps) => {
  const progress = ((duration - timeLeft) / duration) * 100;

  const handleComplete = () => {
    onComplete(stepId);
  };

  const handleSkip = () => {
    onSkip(stepId);
  };

  return (
    <Box sx={{ 
      p: 2, 
      border: 1, 
      borderColor: 'primary.main', 
      borderRadius: 2, 
      mb: 2,
      backgroundColor: 'background.paper'
    }}>
      <Typography variant="h6" gutterBottom>
        {title} (Timer: {duration}s)
      </Typography>
      
      {body && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          {body}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" color="primary" sx={{ mr: 2 }}>
          {formatTime(timeLeft)}
        </Typography>
        
        <Box sx={{ flexGrow: 1, mr: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Box>
          {isCompleted ? (
            <IconButton 
              color="success" 
              onClick={handleComplete}
              title="Mark as completed"
            >
              <CheckCircleIcon />
            </IconButton>
          ) : (
            <IconButton 
              color="warning" 
              onClick={handleSkip}
              title="Skip step"
            >
              <SkipNextIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        {isCompleted ? "Timer finished! Click the checkmark to complete." : paused ? "Timer paused." : "Timer running..."}
      </Typography>
    </Box>
  );
};

export default StepTimer; 
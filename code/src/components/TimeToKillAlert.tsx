import React, { useState, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

export default function TimeToKillTooltip() {
  const [timeLeft, setTimeLeft] = useState(0);

  // Function to calculate time left to kill the enemy drone
  const timeToKill = () => {
    // Replace this with your actual timeToKill function implementation
    // For demonstration, let's set a timer for 60 seconds
    return 60;
  };

  useEffect(() => {
    // Set up a timer to update the time left every second
    const interval = setInterval(() => {
      setTimeLeft(timeToKill());
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <Tooltip title={`Time To Kill: ${timeLeft} seconds`} style={{ zIndex: 1000 }}>
      <Button variant="contained" color="primary">
        Hover me
      </Button>
    </Tooltip>
  );
}

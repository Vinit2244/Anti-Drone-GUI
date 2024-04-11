
import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import ScheduleSharpIcon from '@mui/icons-material/ScheduleSharp';

function TimeToKillSnackbar({cName} : {cName: string}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerDuration = 100;
  const [startTime, setStartTime] = useState(Date.now());
  const [open, setOpen] = useState(true);

  const timeToKill = () => {
    return Math.max(timerDuration - Math.floor((Date.now() - startTime) / 1000), 0);
  };

  useEffect(() => {
    setStartTime(Date.now());
    const interval = setInterval(() => {
      const remainingTime = timeToKill();
      setTimeLeft(remainingTime);
      setOpen(remainingTime > 0); // Close Snackbar if remainingTime is 0
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []); // No dependencies here to run only once on mount

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={cName}>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={open}
        onClose={handleClose}
        message={
          <Typography variant="body1" style={{ fontFamily: 'Roboto, sans-serif', display: 'flex', alignItems: 'center' }}>
          <ScheduleSharpIcon style={{ marginRight: '0.5em' }} />
          Time left to kill enemy drone: {timeLeft} seconds
        </Typography>
        }
        ContentProps={{
          sx:{
            border: "0.1px solid #5ba25f",
            borderRadius: "10px",
            color: "#5ba25f",
            bgcolor: "black",
            fontWeight: "bold",
            textAlign: "center",
            // centering our message
            width:"100%",
            "& .MuiSnackbarContent-message":{
              width:"inherit",
              textAlign: "center",
            }
          }
         }}
      />
    </div>
  );
}



export default TimeToKillSnackbar;

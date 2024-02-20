import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

export function DateTimeDisplay() {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <Typography>
      {date.toLocaleTimeString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </Typography>
  );
}

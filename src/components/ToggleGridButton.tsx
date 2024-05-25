import React, { useState } from "react";
import { IconButton } from "@mui/material";
import GridOffIcon from "@mui/icons-material/GridOff";
import GridOnIcon from "@mui/icons-material/GridOn";

interface ToggleGridButtonProps {
  onToggle: () => void;
}

const ToggleGridButton: React.FC<ToggleGridButtonProps> = ({ onToggle }) => {
  const [gridOn, setGridOn] = useState(false);

  const handleClick = () => {
    setGridOn(!gridOn);
    onToggle();
  };

  return (
    <IconButton onClick={handleClick}>
      {gridOn ? <GridOnIcon /> : <GridOffIcon />}
    </IconButton>
  );
};

export default ToggleGridButton;


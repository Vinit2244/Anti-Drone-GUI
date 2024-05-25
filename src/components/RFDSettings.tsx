import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

export function RFDSettings() {
  const [freq, setFreq] = useState(865);
  return (
    <ToggleButtonGroup
      exclusive
      value={freq}
      onChange={(_, v) => {
        setFreq(v as number);
      }}
    >
      <ToggleButton value={865}>865 MHz</ToggleButton>
      <ToggleButton value={915}>915 MHz</ToggleButton>
    </ToggleButtonGroup>
  );
}

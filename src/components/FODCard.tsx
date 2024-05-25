import { Typography, Chip } from "@mui/material";
import { useContext } from "react";
import { MapControlContext } from "../contexts/MapControlContext";
import { useSelector } from "@xstate/react";
import { FODDataContext } from "../contexts/FODDataContext";

export function FODCard({
  id,
  label,
  remove,
}: {
  id: string;
  label: string;
  remove: () => void;
}) {
  const { mapControlService } = useContext(MapControlContext);
  const { send } = mapControlService;
  const isSelected = useSelector(
    mapControlService,
    (state) => state.matches("FOD Selected") && state.context.selectedID === id
  );
  const { fodDataService } = useContext(FODDataContext);
  const { send: fodSend } = fodDataService;
  const isCleared = useSelector(
    fodDataService,
    (state) =>
      state.context.currentMissionData?.detected_objects.find(
        (fod) => fod.object_id === id
      )?.cleared ?? false
  );

  return (
    <Chip
      variant={isSelected ? "filled" : "outlined"}
      onDelete={
        isCleared
          ? undefined
          : () => {
              fodSend({ type: "Set Cleared", objectId: id });
              if (isSelected) send("Deselect");
            }
      }
      onClick={() => {
        if (!isSelected) send({ type: "Select FOD", newSelectedFOD: id });
        else send("Deselect");
      }}
      color={isCleared ? "default" : "info"}
      sx={{ height: "40px", width: "100%" }}
      label={
        <Typography
          sx={{ textDecoration: isCleared ? "line-through" : "none" }}
        >
          {label}
        </Typography>
      }
    />
  );
}

export const LoadingFODCard = () => {
  return (
    <Chip
      variant={"outlined"}
      disabled
      color="info"
      sx={{ height: "40px", width: "100%" }}
      label={<Typography>Loading</Typography>}
    />
  );
};

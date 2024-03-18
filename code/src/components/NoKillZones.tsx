import Typography from "@mui/material/Typography";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { NoKillZone } from "../types/payloads";
import { Box, Card, CardContent, CardHeader, IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useImmer } from "use-immer";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

function NoKillZoneCard({
  index,
  noKillzone,
  updating,
  setUpdating,
  newZone = false,
}: {
  index: number;
  noKillzone: NoKillZone;
  updating: boolean;
  setUpdating: (newUpdating: boolean) => void;
  newZone?: boolean;
}) {
  const [updatedNoKillZone, setUpdatedNoKillZone] = useImmer(noKillzone);

  useEffect(() => {
    // Fetch data or perform side effects if necessary
  }, []);

  return (
    <Card variant="outlined" sx={{ marginTop: "10px" }}>
      <CardHeader
        title={
          <TextField
            fullWidth
            id="standard-basic"
            label="No Kill Zone Name"
            variant="standard"
            value={updatedNoKillZone.name}
            onChange={(e) => {
              setUpdatedNoKillZone((draft: NoKillZone) => {
                draft.name = e.target.value;
              });
            }}
          />
        }
        action={
          <IconButton
            disabled={updating}
            onClick={async () => {
              setUpdating(true);
              if (newZone)
                await invoke("add_no_kill_zone", {
                  newNoKillZone: updatedNoKillZone,
                });
              else
                await invoke("update_no_kill_zone", {
                  index,
                  newNoKillZone: updatedNoKillZone,
                });
              setUpdating(false);
            }}>
            <SaveIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
          }}>
          <TextField
            type="number"
            label="Latitude"
            value={updatedNoKillZone.latitude}
            onChange={(e) => {
              setUpdatedNoKillZone((draft: NoKillZone) => {
                draft.latitude = +e.target.value;
              });
            }}
          />
          <TextField
            type="number"
            label="Longitude"
            value={updatedNoKillZone.longitude}
            onChange={(e) => {
              setUpdatedNoKillZone((draft: NoKillZone) => {
                draft.longitude = +e.target.value;
              });
            }}
          />
          <TextField
            type="number"
            label="Radius"
            value={updatedNoKillZone.radius}
            onChange={(e) => {
              setUpdatedNoKillZone((draft: NoKillZone) => {
                draft.radius = +e.target.value;
              });
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export function NoKillZones({
  updating,
  setUpdating,
}: {
  updating: boolean;
  setUpdating: (newUpdating: boolean) => void;
}) {
  const [noKillZones, setNoKillZones] = useState([] as NoKillZone[]);
  const [newNoKillZones, setNewNoKillZones] = useState([] as NoKillZone[]);

  useEffect(() => {
    (async () => {
      try {
        const newNoKillZones = (await invoke(
          "get_no_kill_zones"
        )) as NoKillZone[];
        setNoKillZones(newNoKillZones);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <>
      {noKillZones.map((noKillZone, index) => (
        <NoKillZoneCard
          index={index}
          updating={updating}
          setUpdating={setUpdating}
          noKillzone={noKillZone}
          key={index.toString()}
        />
      ))}
      {newNoKillZones.map((noKillZone, index) => (
        <NoKillZoneCard
          index={index}
          noKillzone={noKillZone}
          updating={updating}
          setUpdating={setUpdating}
          newZone
          key={(noKillZones.length + index).toString()}
        />
      ))}
      <Box sx={{ marginTop: "20px", marginBottom: "10px", float: "right" }}>
        <IconButton
          onClick={() => {
            setNewNoKillZones((oldNoKillZones) => [
              ...oldNoKillZones,
              {
                id: "new",
                name: "New No Kill Zone",
                latitude: 0,
                longitude: 0,
                radius: 0,
              },
            ]);
          }}>
          <AddIcon />
        </IconButton>
      </Box>
    </>
  );
}

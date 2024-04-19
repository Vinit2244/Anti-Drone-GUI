import Typography from "@mui/material/Typography";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import {
  CommLink,
  SerialCommLink,
  TcpCommLink,
  UdpCommLink,
} from "../types/payloads";
import { Box, Card, CardContent, CardHeader, IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useImmer } from "use-immer";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

function CommLinkCard({
  index,
  commLink,
  updating,
  setUpdating,
  newLink = false,
}: {
  index: number;
  commLink: CommLink;
  updating: boolean;
  setUpdating: (newUpdating: boolean) => void;
  newLink?: boolean;
}) {
  const [updatedCommLink, setUpdatedCommLink] = useImmer(commLink);
  let commType: "Serial" | "Udp" | "Tcp";
  if ("Serial" in updatedCommLink.comm_link_type) commType = "Serial";
  else if ("Udp" in updatedCommLink.comm_link_type) commType = "Udp";
  else commType = "Tcp";
  const [usbPath, setUsbPath] = useState(null as null | string);
  useEffect(() => {
    if (commType == "Serial")
      (async () => {
        const vid = (updatedCommLink.comm_link_type as SerialCommLink).Serial
          .vid;
        const pid = (updatedCommLink.comm_link_type as SerialCommLink).Serial
          .pid;
        const response = (await invoke("get_usb_path", { vid, pid })) as
          | null
          | string;
        setUsbPath(response);
      })();
  }, [
    commType === "Serial"
      ? (updatedCommLink.comm_link_type as SerialCommLink).Serial.pid
      : null,
    commType === "Serial"
      ? (updatedCommLink.comm_link_type as SerialCommLink).Serial.vid
      : null,
  ]);
  const [availablePaths, setAvailablePaths] = useState(
    [] as [number, number, string][]
  );

  useEffect(() => {
    (async () => {
      const resp = (await invoke("get_usb_ports")) as [
        number,
        number,
        string
      ][];
      setAvailablePaths(resp);
    })();
  }, []);

  return (
    <Card variant="outlined" sx={{ marginTop: "10px" }}>
      <CardHeader
        title={
          <TextField
            fullWidth
            id="standard-basic"
            label="Comm Link Name"
            variant="standard"
            value={updatedCommLink.name}
            onChange={(e) => {
              setUpdatedCommLink((draft) => {
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
              if (newLink) {
                await invoke("add_comm_link", { newCommLink: updatedCommLink });
                newLink = false;
              } else
                await invoke("update_comm_link", {
                  index,
                  newCommLink: updatedCommLink,
                });
              setUpdating(false);
            }}>
            <SaveIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Typography>
          Auto Connect:
          <Switch
            checked={updatedCommLink.auto_connect}
            onChange={(e) => {
              setUpdatedCommLink((draft) => {
                draft.auto_connect = e.target.checked;
              });
            }}
          />
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
          }}>
          <Select
            onChange={(e) => {
              setUpdatedCommLink((draft) => {
                if (e.target.value === "Udp") {
                  draft.comm_link_type = { Udp: { url: "127.0.0.1:14551" } };
                } else if (e.target.value === "Tcp") {
                  draft.comm_link_type = { Tcp: { url: "127.0.0.1:5760" } };
                } else {
                  if (availablePaths.length > 0)
                    draft.comm_link_type = {
                      Serial: {
                        baud_rate: 57600,
                        vid: availablePaths[0][0],
                        pid: availablePaths[0][1],
                      },
                    };
                  else {
                    draft.comm_link_type = {
                      Serial: {
                        baud_rate: 57600,
                        vid: 0,
                        pid: 0,
                      },
                    };
                  }
                }
              });
            }}
            value={commType}>
            <MenuItem value={"Udp"}>Udp</MenuItem>
            <MenuItem value={"Tcp"}>Tcp</MenuItem>
            <MenuItem value={"Serial"}>Serial</MenuItem>
          </Select>
          {commType === "Serial" ? (
            <>
              <Select
                onChange={(e) => {
                  if (e.target.value == -1) return;
                  setUpdatedCommLink((draft) => {
                    const portIndex = e.target.value as number;
                    const port = availablePaths[portIndex];
                    (draft.comm_link_type as SerialCommLink).Serial.vid =
                      port[0];
                    (draft.comm_link_type as SerialCommLink).Serial.pid =
                      port[1];
                  });
                }}
                value={availablePaths.findIndex((path) => path[2] === usbPath)}>
                <MenuItem value={-1}>Disconnected</MenuItem>
                {availablePaths.map((path, index) => (
                  <MenuItem value={index}>{path[2]}</MenuItem>
                ))}
              </Select>
              <TextField
                type="number"
                label="Baud Rate"
                value={
                  (updatedCommLink.comm_link_type as SerialCommLink).Serial
                    .baud_rate
                }
                onChange={(e) => {
                  setUpdatedCommLink((draft) => {
                    (draft.comm_link_type as SerialCommLink).Serial.baud_rate =
                      +e.target.value;
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key.match(/^[^0-9]$/)) {
                    e.preventDefault();
                  }
                }}
              />
            </>
          ) : (
            <>
              <TextField
                label="URL"
                value={
                  commType === "Tcp"
                    ? (updatedCommLink.comm_link_type as TcpCommLink).Tcp.url
                    : (updatedCommLink.comm_link_type as UdpCommLink).Udp.url
                }
                onChange={(e) => {
                  setUpdatedCommLink((draft) => {
                    if ("Tcp" in draft.comm_link_type) {
                      (draft.comm_link_type as TcpCommLink).Tcp.url =
                        e.target.value;
                    } else {
                      (draft.comm_link_type as UdpCommLink).Udp.url =
                        e.target.value;
                    }
                  });
                }}
              />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function CommLinks({
  updating,
  setUpdating,
}: {
  updating: boolean;
  setUpdating: (newUpdating: boolean) => void;
}) {
  const [commLinks, setCommLinks] = useState([] as CommLink[]);
  const [newCommLinks, setNewCommLinks] = useState([] as CommLink[]);

  useEffect(() => {
    (async () => {
      try {
        const newCommLinks = (await invoke("get_comm_links")) as CommLink[];
        setCommLinks(newCommLinks);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <>
      {commLinks.map((commLink, index) => (
        <CommLinkCard
          index={index}
          updating={updating}
          setUpdating={setUpdating}
          commLink={commLink}
          key={index.toString()}
        />
      ))}
      {newCommLinks.map((commLink, index) => (
        <CommLinkCard
          index={index}
          commLink={commLink}
          updating={updating}
          setUpdating={setUpdating}
          newLink
          key={(commLinks.length + index).toString()}
        />
      ))}
      <Box sx={{ marginTop: "20px", marginBottom: "10px", float: "right" }}>
        <IconButton
          onClick={() => {
            setNewCommLinks((oldCommLinks) => [
              ...oldCommLinks,
              {
                name: "New Comm Link",
                auto_connect: false,
                comm_link_type: { Tcp: { url: "127.0.0.1:5760" } },
              },
            ]);
          }}>
          <AddIcon />
        </IconButton>
      </Box>
    </>
  );
}

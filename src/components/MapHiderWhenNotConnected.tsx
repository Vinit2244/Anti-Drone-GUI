import { OnlyConnected } from "./Only";
import { Backdrop } from "@mui/material";
import Typography from "@mui/material/Typography";

export function MapHiderWhenNotConnected() {
  return (
    <OnlyConnected not>
      <Backdrop
        open
        sx={{
          color: "#fff",
          zIndex: 10,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Typography
          sx={{ wordBreak: "break-all", textAlign: "center" }}
          variant="h1"
        >
          Disconnected
        </Typography>
      </Backdrop>
      {/* <div
        className="mapHideNotConnected"
        style={{
          position: "absolute",
          backgroundColor: "black",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      ></div> */}
    </OnlyConnected>
  );
}

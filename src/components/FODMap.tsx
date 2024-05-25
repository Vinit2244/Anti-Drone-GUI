import { fromLonLat } from "ol/proj";
import { RStyle, RPopup, RFeature } from "rlayers";
import { Point } from "ol/geom";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { MapControlContext } from "../contexts/MapControlContext";
import { useSelector } from "@xstate/react";
import Paper from "@mui/material/Paper";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export function FODMap({
  id,
  lonLat,
  image_path,
  selectedStyle,
  deselectedStyle,
}: {
  id: string;
  lonLat: [number, number];
  image_path: string;
  deselectedStyle: RStyle.RStyleRef;
  selectedStyle: RStyle.RStyleRef;
}) {
  const { mapControlService } = useContext(MapControlContext);

  const isSelected = useSelector(
    mapControlService,
    (state) => state.matches("FOD Selected") && state.context.selectedID == id
  );

  const popupRef = useRef<RPopup>(null);
  useEffect(() => {
    if (isSelected) popupRef.current?.show();
    else popupRef.current?.hide();
  }, [isSelected]);
  return (
    <>
      <RFeature
        // onClick={useCallback((e) => {
        //   e.stopPropagation();
        //   send({ type: "Select FOD", newSelectedFOD: id });
        // }, [])}
        geometry={useMemo(() => new Point(fromLonLat(lonLat)), [])}
        style={isSelected ? selectedStyle : deselectedStyle}
        properties={{ id }}
      >
        <RPopup autoPosition ref={popupRef} trigger="click">
          <Paper sx={{ margin: "15px", paddingX: "15px", paddingY: "5px" }}>
            {/* <Typography textAlign="center" variant={"h5"}>
                Details
              </Typography>
              <div>
                <Typography>Latitude: {lonLat[1]}</Typography>
              </div>
              <div>
                <Typography>Longitude: {lonLat[0]}</Typography>
              </div> */}
            <img
              style={{ margin: "10px" }}
              width="200px"
              src={convertFileSrc(image_path)}
              alt="fod image"
            />
          </Paper>
        </RPopup>
      </RFeature>
    </>
  );
}

import { useContext, useMemo, useState } from "react";
import { FODMap } from "./FODMap";
import { FODDataContext } from "../contexts/FODDataContext";
import { useSelector } from "@xstate/react";
import { RLayerCluster, RLayerVector, RStyle } from "rlayers";
import { useRStyle } from "rlayers/style";
import rockIcon from "../assets/rock.svg";
import selectedRockIcon from "../assets/selectedRock.svg";
import { MapControlContext } from "../contexts/MapControlContext";
export function FODMapManager() {
  const { fodDataService } = useContext(FODDataContext);
  const fodInfo = useSelector(
    fodDataService,
    (state) =>
      state.context.currentMissionData?.detected_objects.map((fod) => {
        return {
          id: fod.object_id,
          lonLat: [fod.longitude, fod.latitude] as [number, number],
          image_path: fod.image_path,
        };
      }) ?? []
  );
  const { mapControlService } = useContext(MapControlContext);
  const { send } = mapControlService;
  const deselectedStyle = useRStyle();
  const selectedStyle = useRStyle();
  return (
    <>
      {useMemo(
        () => (
          <>
            <RStyle.RStyle ref={deselectedStyle}>
              <RStyle.RIcon scale={0.6} src={rockIcon} anchor={[0.5, 0.5]} />
            </RStyle.RStyle>
            <RStyle.RStyle ref={selectedStyle}>
              <RStyle.RIcon
                scale={0.4}
                src={selectedRockIcon}
                anchor={[0.5, 0.5]}
              />
            </RStyle.RStyle>
          </>
        ),
        []
      )}

      <RLayerCluster
        /* @ts-ignore */
        updateWhileAnimating
        /* @ts-ignore */
        updateWhileInteracting
        distance={30}
        onClick={(e) => {
          e.stopPropagation();
          const features = e.target.get("features");
          if (features.length === 0) return;
          send({ type: "Select FOD", newSelectedFOD: features[0].values_.id });
        }}
        // style={isSelected ? selectedStyle : deselectedStyle}
      >
        <RStyle.RStyle>
          <RStyle.RIcon scale={0.6} src={rockIcon} anchor={[0.5, 0.5]} />
        </RStyle.RStyle>
        {/* <RStyle.RStyle
          render={(feature, resolution) => {
            console.log("a");
            if (selectedID === null) {
              return (
                <RStyle.RStyle>
                  <RStyle.RIcon
                    scale={0.6}
                    src={rockIcon}
                    anchor={[0.5, 0.5]}
                  />
                </RStyle.RStyle>
              );
            }

            console.log(feature);
            for (const f of feature.get("features")) {
              if (f.values_.id === selectedID) {
                console.log("hit");
                return (
                  <RStyle.RStyle>
                    <RStyle.RIcon
                      scale={0.4}
                      src={selectedRockIcon}
                      anchor={[0.5, 0.5]}
                    />
                  </RStyle.RStyle>
                );
              }
            }
            return (
              <RStyle.RStyle>
                <RStyle.RIcon scale={0.6} src={rockIcon} anchor={[0.5, 0.5]} />
              </RStyle.RStyle>
            );
          }}
        /> */}

        {useMemo(
          () =>
            fodInfo.map((fod) => (
              <FODMap
                key={fod.id}
                id={fod.id}
                lonLat={fod.lonLat}
                image_path={fod.image_path}
                selectedStyle={selectedStyle}
                deselectedStyle={deselectedStyle}
              />
            )),
          [fodInfo]
        )}
      </RLayerCluster>
    </>
  );
}

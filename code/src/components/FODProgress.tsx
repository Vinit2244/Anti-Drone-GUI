import {
  Paper,
  Typography,
  IconButton,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useActor, useSelector } from "@xstate/react";
import { invoke } from "@tauri-apps/api";
import { FODDataContext } from "../contexts/FODDataContext";
import CloseIcon from "@mui/icons-material/Close";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { ForeignObject } from "../types/fod";
import { FODCard, LoadingFODCard } from "./FODCard";

import { VirtuosoGrid } from "react-virtuoso";
import styled from "@emotion/styled";
import { Refresh } from "@mui/icons-material";

export function FODProgress() {
  const { fodDataService } = useContext(FODDataContext);
  const foreignObjects =
    useSelector(
      fodDataService,
      (state) => state.context.currentMissionData?.detected_objects
    ) ?? [];

  const missionName = useSelector(
    fodDataService,
    (state) => state.context.currentMissionData?.mission_name ?? undefined
  );
  const missionID = useSelector(fodDataService, (state) =>
    state.context.currentMissionData === null
      ? undefined
      : `${state.context.currentMissionData.mission_name}-${state.context.currentMissionData.mission_start_time.secs_since_epoch}`
  );

  const loaded = useSelector(fodDataService, (state) =>
    state.matches("History")
  );
  const { send } = fodDataService;

  // useEffect(() => {
  //   // let interval = setInterval(() => {
  //   //   send("Load");
  //   // }, 1000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  return (
    <Paper
      className="fodProgress"
      style={{ borderRightWidth: "5px", borderRight: "solid", color: "grey" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          flexDirection: "column",
          height: "30%",
        }}
      >
        <Typography color="primary" variant="h5">
          FOD Information
        </Typography>
        {missionName === undefined ? null : loaded ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <Typography color="primary">
              Loaded Mission Name: {missionName}
            </Typography>
            <Tooltip title="Close History">
              <IconButton
                onClick={() => {
                  send("Close History");
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography color="primary">
            Current Mission Name: {missionName}
            <IconButton
              sx={{
                marginLeft: "15px",
              }}
              onClick={() => {
                send("Load");
              }}
            >
              <Refresh />
            </IconButton>
          </Typography>
        )}
      </div>
      <VirtuosoGrid
        // style={{ height: 400 }}
        totalCount={foreignObjects.length}
        overscan={200}
        style={{ height: "70%", marginBottom: "5px" }}
        components={{
          Item: ItemContainer,
          /* @ts-ignore */
          List: ListContainer,
          ScrollSeekPlaceholder: ({ height, width, index }) => (
            <ItemContainer>
              <ItemWrapper>
                <LoadingFODCard />
              </ItemWrapper>
            </ItemContainer>
          ),
        }}
        itemContent={(index) => (
          <ItemWrapper>
            <FODCard
              key={foreignObjects[index].object_id}
              id={foreignObjects[index].object_id}
              label={foreignObjects[index].object_label}
              remove={() => {
                // setFodInfo((prevFodInfo) =>
                //   prevFodInfo.filter((prevFod) => prevFod.id !== foreignObject.id)
                // );
              }}
            />
          </ItemWrapper>
        )}
        scrollSeekConfiguration={{
          enter: (velocity) => Math.abs(velocity) > 200,
          exit: (velocity) => Math.abs(velocity) < 30,
          change: (_, range) => console.log({ range }),
        }}
      />
    </Paper>
  );
}

const ItemContainer = styled.div`
  padding: 0.5rem;
  width: 20%;
  display: flex;
  flex: none;
  align-content: stretch;
  box-sizing: border-box;

  @media (max-width: 2224px) {
    width: 33%;
  }

  @media (max-width: 1300px) {
    width: 50%;
  }

  @media (max-width: 300px) {
    width: 100%;
  }
`;

const ItemWrapper = styled.div`
  flex: 1;
  text-align: center;
  font-size: 80%;
  padding: 0.5rem 1rem;
  border: 1px solid var(gray);
  white-space: nowrap;
`;

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

import { assign, createMachine } from "xstate";
import { ForeignObject, MissionFODData } from "../types/fod";
import { event, invoke } from "@tauri-apps/api";

const fodDataMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBEwAXMTSgqAYgFF8IACAWV1llwHt8AbQAMAXUSgADn150BEkAA9EANgCcAZhIB2FQCYArABY92vUZXC1RgDQgAnog0qtR7doPCjGowA4PfgYAvkF2aFh4hKQU1LT0JACSEAA2YAwAylRsAMKp6ABOkCLiSCDSsvz4CsoIAIzCvgYktRoG7i4avsLCBnaOCAa1KiS+am3aGnp6DX5qIWEYOATE5FQ0dPhQiSlpADJ86BDFCuW4clWlNbX1aiRtKia1erVGXtd9qtcjRga+Ld71abBUIgcJLKKrWIbLaZSjQnJ5QoQBgQARgEgEABufAA1uiwZEVjF1vFYfDcmACpAEFi+Jh0OdisdSqdztVEE9-CQ9J1GmozLUDGp+R8ECYjHc3F1NOZ3GMVPNQYtCdE1nFNiR9od6Ci0Rj8Ni8SQCctVVD4lqIPQaQa6QzKkyxCcZGdKuy6sI9L5mkYhl6hRMzKKVG0RsJtLVtH89NYY3MQSaIZadajCPrDfjlabNQcrZsbdj6YyxMypC62ZdEAYNLVud1hE9ptphDW9KKptoSN1NLoDIZ-L5B4rEysABLcSh8fL2Bi5GRgNjj2CT6elsrlt2VhDCkj6NT+VvGfnWUX1YQjLo8jRWbT7ly+YdZiFLlcz2EIylIteszegGp-LRuhcBt-H3XwvVPKZuU8bo2imLxfm0R8ImzAA5Pg2DIBl0AySgCkoThuF4ARvw3eQtyGW4ow8YQVHqVpBX0UVqwlbRvA8Fiel0PRkPBFZ0Mw7CGEtRcJynexSIqci-w5W8dH8Tw6JbQYDCYhxEHMb0rA0DxOhedQzCMXiVRIdI8PyeEuB4SpdTTWkjRHUgzPw+hCOsgQCztYtREk11pKUKtwN3eoTGMPQQ10ZiXmaIVOg0MDaP5YzsxYPMoDc4j8Fs9F7MzFCIVS1yrMyzyiwdEsnRZMiLhkhBzD0EZOj7MwvDGGNfFFVphiFFw2Nqax+prEIQXwPgIDgBRHOdKSaoChAAFoVFPLQgSmB4xl8a8VAfBMnyJNVoWmvzZpqNRop8cC1AaCYLF6dSEA0ZwRjMLp1DGdjamSiFiXVLYklSI6K1qtR9BIC6Y2unwQyi4Z-GbToXGMQceN2-L9vNDUyVcikqQgQHfzmp4xhICxGmbYwDDaVSYeeiMpnAlp+uBBY0bNEkNWTTZ8f8q4Ywa14Yz0yZPEFYNpmaBsPHAkwvUmL6Vk5qBuZOpxWi7WjDCUhjqfuqYJX3Gjr0GDx3B2lm+NIF9xOV90I3Pf5OlvN7m20dtBi7GjPRUZsvVe+XSAErC8JtrcTE63xhh6QwW2mbwfm9-3TPMyyiIJn8eacL0dB0wZNvqYx1Ci2tes8H52mcJDUYtkhCs2DK0+q90jBMZ7FIjh5KYaTrQdu7pWkaP5jGGoIgA */
    predictableActionArguments: true,

    states: {
      Detecting: {
        on: {
          "End Mission": {
            target: "Ending Mission",
          },
        },

        states: {
          Idle: {
            on: {
              "Set Cleared": "Setting Cleared",
              Load: "Loading",
            },
          },

          "Setting Cleared": {
            invoke: {
              src: "setCleared",
              onDone: {
                target: "Idle",
                actions: [
                  assign({
                    currentMissionData: (_, e) => e.data as MissionFODData,
                  }),
                ],
              },
            },
          },
          Loading: {
            invoke: {
              src: "loadMission",
              onDone: {
                target: "Idle",
                actions: [
                  assign({
                    currentMissionData: (_, e) => {
                      return e.data as MissionFODData;
                    },
                  }),
                ],
              },
            },
          },
        },

        initial: "Idle",
      },

      Loading: {
        invoke: {
          src: "getHistory",
          onDone: {
            target: "History",
            actions: [
              assign((_, e) => ({
                currentMissionData: e.data as MissionFODData,
              })),
            ],
          },
        },
      },

      History: {
        on: {
          "Close History": {
            target: "No Data",
            actions: [assign({ currentMissionData: null })],
          },

          "Set Cleared": {
            target: "History",
            internal: true,
            actions: [
              assign({
                currentMissionData: (context, event) => {
                  if (context.currentMissionData === null) {
                    console.error("FATAL LOGIC ERROR: set clear after null");
                    return context.currentMissionData;
                  }

                  const index =
                    context.currentMissionData.detected_objects.findIndex(
                      (obj) => obj.object_id == event.objectId
                    );
                  if (index === -1) {
                    console.error("ERROR: Object id doesnt exist");
                    return context.currentMissionData;
                  }
                  let detected_objects = [
                    ...context.currentMissionData.detected_objects.map(
                      (obj, objIndex) => {
                        if (index === objIndex)
                          return { ...obj, cleared: true } as ForeignObject;
                        else return obj;
                      }
                    ),
                  ];

                  return {
                    ...context.currentMissionData,
                    mission_end_time: {
                      secs_since_epoch: Math.round(new Date().getTime() / 1000),
                      nanos_since_epoch: 0,
                    },
                    detected_objects,
                  };
                },
              }),
              "save",
            ],
          },
        },
      },

      "No Data": {
        on: {
          "Start Mission": "Starting Mission",
          "Load History": "Loading",
        },
      },

      "Starting Mission": {
        invoke: {
          src: "startMission",
          onDone: {
            target: "Detecting",
            actions: [
              assign({
                currentMissionData: (_, e) => {
                  return e.data as MissionFODData;
                },
              }),
            ],
          },
        },
      },

      "Ending Mission": {
        invoke: {
          src: "endMission",
          onDone: {
            target: "No Data",
            actions: [assign({ currentMissionData: null })],
          },
        },
      },
    },
    tsTypes: {} as import("./fodDataMachine.typegen").Typegen0,

    initial: "No Data",
    context: { currentMissionData: null as null | MissionFODData },
    schema: {
      events: {} as
        | { type: "Load History"; missionID: string }
        | { type: "New Detected"; newObject: ForeignObject }
        | { type: "Set Cleared"; objectId: string }
        | { type: "Start Mission" }
        | { type: "Close History" }
        | { type: "End Mission" }
        | { type: "Load" },
      services: {} as {
        startMission: {
          data: MissionFODData;
        };
        getHistory: {
          data: MissionFODData;
        };
        loadMission: {
          data: MissionFODData;
        };
        endMission: {
          data: void;
        };
        setCleared: {
          data: MissionFODData;
        };
      },
    },
  },
  {
    services: {
      startMission: async () => {
        const data = (await invoke("get_default_mission")) as MissionFODData;
        await invoke("create_mission_session", { missionFodData: data });
        return data;
      },
      getHistory: async (_, event) => {
        const newMission = await invoke("load_fod_history", {
          missionId: event.missionID,
        });
        return newMission as MissionFODData;
      },
      loadMission: async () => {
        const newData = (await invoke("load_mission_data")) as MissionFODData;
        return newData;
      },
      endMission: async () => {
        await invoke("end_mission_session");
      },
      setCleared: async (_, e) => {
        const newData = (await invoke("set_cleared", {
          objectId: e.objectId,
        })) as MissionFODData;
        return newData;
      },
    },
    actions: {
      save: (context) => {
        if (context.currentMissionData === null) {
          console.error("FATAL LOGIC ERROR: save after null");
          return;
        }
        invoke("save_fod", { missionData: { ...context.currentMissionData } });
      },
    },
  }
);

export default fodDataMachine;

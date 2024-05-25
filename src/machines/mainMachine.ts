import { invoke } from "@tauri-apps/api";
import { emit } from "@tauri-apps/api/event";
import { createMachine, assign, send, raise } from "xstate";

const mainMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgGEB7fQzAFwKgGIIqwSCA3CgazbSzyFSlamDoMEnCpnT0qAbQAMAXSXLEoAA4VYuOfg0gAHogCMAdgBMJU5dOL7ADkUBmSw4BsAGhABPROaKHiQeAKz25qFuACyWodEAnAC+ST78OATE5FQ09PhMYABOhRSFJJoANrIAZqWoJOmCWSK5ElIy+mpqhtq6+oYmCAC00SSWiQmOHg4u5mEJCaY+-gi24yTRc9MuLgmWCeYuHilpGBlCJAAiuLCYOWK0kIwASmL3dN1IIL16uFQDZmipg2ijsik2tlC4PByzMigSo0UikcjlMjkmHhcpmiJxAjUywnejwgjGutyJny0Ol+-y+g1MUOBc0UUQSmPiHkssNWsxcJHM0VmCRcLIFaNCuPxFxaDyeADFSpgwAACMl3UQfFQ9an9OmIUKOPmWOKORKcgVBRzc0xuYLG8xsuLRDxTUzHVJ4s5NQka4kvOC0UpgSnfHV-Ax61bO6xY0II0GuQJWblDSyo-lpg5I8zYlyOczmSVegnZX2QEgASXwv3QFUYAGUwPgIMqACroXgUarVEM-XWgenMmzwzaKAtujwu7mhOMkUJ2EVojxWcbu04CEsyujlqs1usAQQgLcbFVlLcuJUIsF7YdpA8BkxC5sFaNmyK5fn1RwzaPhizHmKmEWG7SkSO7VvQtb+qgFAcCqJ5nqql5wDefThgCUamiQszoq4abIhY5jckCij8vO+wJA4+zRHGwHnM0YEQJWEG4FBja0MqCHbueyHXlqXx9uhkbYtEpEJPOpjCi4oRWAsVqfggdjBC60zCq6mIuNEjh0d6pa5OWjbNgwbYdmAXbVMwrDsPgXC8A0xagWWTGGRAxntp23aSDZ0iyOGXT8VSaF3sYiB2NiITiQy2JOFi07SRsxr7DmeycvsOmboxJDucZADy3aMO5ZndsqlCoJUYCPKhNIRveim2KM0n5tRxrCgK3KmqRcxilYHhqc66WOfpTEALI3LoVCMKNsDjfgJUUGVp7ElV-Yhas4SkYKy6WLM8RQlM3KHKRLIGpJoIeNEF0uANDFOSQU0zSQABydRQQAoqgRQwPgmC+CVp7oIUy1CbVthumMy4jsKtgeBY3LjJ1FhuDJ5GmpYhYelKN1DXdY3hk9L0VMxyoAAolFAhRwLAjDE+gACusDBgFoZBTVq2mqENhhFEkkCpObrWjmGzTCiEOTuYjhxNdPrY-dePPYUGCEy5xk0-TYCWYQ1m2XwDlY2eOPTXLBMkMr+Qk3TDNeVwHR+SoQPBYMWYkJMexxgcZoJNyIqkb1QoncltEY7r0v67LVD4wrtYkKrDMkq8sC0x99us4MgTBJMF1SRpcwuF7IoZlCYqolEyJS3poe4+H8uKybTauWb8eJ+rLCa1IdmYyH3EGw91dR6bUDKo3H1Wz5nR20zgkO-qLI2CKUSCppqLCtEcPwiQzg0eavUS7Ea6eiBetd2H+C10ZZvvZ9TY-X9YAAxrbBtzrB+d8S3d4-3yoX4UX3X2Q-2FCPG2Chx7qAEreFOAQCzr0nPPSIc9lzcmmKRI44sjg0QcG6bSQdn5XBuOqVo+R75ax4E-eipA1REjaN5IB+B-KgMCtVDCi4SAEU0qEGGh0RQrwUjaBE-IF5BF5miQ4KQPT4AoBAOAhgO7ahZhhIYkR16ommDaGYew9gpiBMECwsQJbggZPCRwEpsFkPLuIfIsjGGRlTOYJRboZhqP2B+FYvVgjhBFFiN0hxNLJBMbpChTlLErUGJpYEWIpjoOfOw0I1o0ajHiFMOw20rA7BxH4jKgSwFyMjJpUiboWqoN6kpGJCkhhsmdlscYeZIhTHzGXLcr9dyQQqEE4Gq03QGn5OiSiY5DRzG2og86LDxIInFuib2WD1ymIaQZOublTLmVaVPVYewfYoPFu4CwnJvAKSiMEUE85XBBGRm4epmVspmzytUJZEDFKWE5GMXYOxIpxEONOMIIRwTnUSKyIEZzbrHxuUwlEnMCmGiKR0lMCQNju0OAWKpGzLD-JlpXE+vcWlZKsbVTaoKkrgr2JChSUDJgWCCM6HM7hjTIorobKuxsqwkzJhTaaQLIyBA5tGTayIHDhAFqRJS8JDibBnLsalR9UURxrh-GOYBWW1TZBzDp3N3Z8yIjwj5zpkRTDTsuCWxipm6RmSNCV6Lo4W0gHKtm9znamkSDsbOmIvb7A2M4NMWljSiUxHvDuZjX7H0lX3OZDc4BN0tYMLSox8l4qOASsIXsZ4LBXH0pG4I0kGoySi2lJ8P5fx-r9P+t9ChhoCOwkIklFhWGUVpXOuzXBKJNCRQ0XCrrpMGjSh6uar75v-gwYtCAHQcvBZESI4JwiewUmEWxp0rA2kxPCSWrasgBIIVAPtgprCRExGFQusZrTrTnECZksQtm9VEUkIAA */
  predictableActionArguments: true,
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgGEB7fQzAFwKgGIIqwSCA3CgazbSzyFSlamDoMEnCpnT0qAbQAMAXSXLEoAA4VYuOfg0gAHogBMAdhIBGReYCsATlsBmACwO7Vq+dcAaEACeiK6uptYezlYAHFZ2pgBsVqamzgC+qf78OATE5FQ09PhMYABOJRQlJJoANrIAZhWoJFmCuSIFElIy+mpqhtq6+oYmCM4OVta2rvF2dq7Odrbx-kEI5uZRJNNWDvGhipGhUemZGNlCJAAiuLCY+WK0kIwASmL3dH1IIAN6uFTDiEiJA83gsihmiii4yi5hWiBsbhI5ni8VsVmcUVMDhiJxALRywnejwgjGutyJny0Ol+-y+IxBJFsijsUWcilcXnWzjhCC8nhIFniyR2ikUph2aQyeLOrUJojoTwAYhVMGAAARku7y2iU77UoZ0xDmSECuJWVHGyGQ0w8mw7EhCqFRcF7eJOKy4-EXdoPJ6vWC0CpgXU-A2gEaxaLAhI7aJuJy2HnIsJzcEpVHg2bxT0ygl5bWQEgAOQoGvKhDVAGUwNVfSTq7W6GXWCH9X8DIaEKjnNYoSFMVZXMjzFYeXZ4pYfLshYoHBY56YcwI8z6FRAruX1Q266S4DWHs3CK3Bu2AQhHK5GXtXI4opi9pCec4JyQYYpvFF4myMSkl+c2kShaXJuVb7mujDbk2wEtio-RtrS4aIEKDiMlig4bKYHIwqOgSIA4l7RIkmLjrGBzmH+sr5gUQEgZBxLFqWACC4hUIwZDYOgsDBrBXyhqena7ChOyzB4Q4fnYsK4eeiJuBOdjOPYbh8hRK6Aeu0EVnRhYlmqzH6IwAAqpSoAQsjceovHwR2iEIIJ4QiXMI4bBJT5OCQjgTmyTrPlE8wqd6akbqwoGNvR7GcQwhnGaZjzHjS1nGPCQphM6boOA4CzpeiURjrYwLPhyLLOc6HpSl6AEFuptFgWFHG6EUjCMQARhUOo8VSJ4IYlCCmHE8RbHO5gYs4YyzG4Y72Fsri+aYrIKe+X7+RV1FVcFWnrkZJQmfgsiRc1rVxWG3UpAsJBjD4MJDSOvU8hyPYJB4U7TPeg5LXKK1BZpNWFtW+AQAwaqbdtZnMKw7D4FwvDNLmAWVZ9W7feuv3-UUgPRTtjySBD0i7QoKiHfxNk7CO4Tvs4pgHGK8SYk+vnAvJngTjYUJim9VF1vDIUc8jAPhVxoOEODkN8DDy0cxpCOhT9YB-bzdVgFjXDdO2vTtXqnUJRGbKWMNsSMxlGx+FJDOvtM9hzp4g5Dmzq70RLXNriQPOo-tJS0ALbBSFD5XveL1VS0jMso1AuktW7is4z0+Nq3xXUjCk6VIuT8zonEPihDyMZItN3hOHskSYWzmpEpFLCC17IvLhcxfap02PK3jqgx1ZZ4YkJGLGsavWxKKRurF4bKMu45i9VCI1U+kUr4BQEBwIYPtwRrZ4ALQWFsoopHM2EpOyPLL86r7ZR+Cy9aK2ZlaLvviEUi-xWeFPuelyI3kkMJussUnGv1DjGqESTpeydkRcbhahWrfI6IwxibDJiOUIQpvx93hAcS8yILTZSxDiC+VcxZrnAYTbqP4zrPm8JEFkn55KIK7A6T80RbCOHjGKUqpxsFX3ojpe2608Fx2CIPEaiQhqxDvDMcaxs8q+QnObZk9g5jn2Yf+VhNE1qIy4ZrI0MRJi50iDMRI5pbQ+AFDnZ00wf7oklHIyittFFfQDgxXSLEEqx1UQgTEQl3zmAyuaEiuipJglfMyNE75WS7E-DbQKHDEbkDqgwFRZ5BxQkZCNZ0CQfCmJyqIywGU9iCOKu+UJcNwk2KBjFaJlkl6dnFPEzE8wEzeHcPhW66IBRugku4Z6MY8kfQKdzIOAMikYzADEzsJDFAClGhTLR5pKGEOpqKEeCxvxDVkdKFh7NHZdMds7EOfMBmlLvkMmwdgzrYkxMaTwN4P6rEtmdM2I1xzP3wq4DpfslE2M2aHVqgybKYXWIyUUY0UjuFRHYWmYQZm2E3gssxyz5FXBASXG+uyIGICKk080Th8JugBbaJIk5kwxAZiEH+k9UhAA */
  states: {
    Connecting: {
      invoke: {
        src: "connect",
        onDone: [{ target: "Connected", actions: ["alertConnection"] }],
        onError: [{ target: "Disconnected", actions: ["alertConnection"] }],
      },
    },

    Disconnected: {
      on: {
        Reconnect: "Connecting",
      },
    },

    Connected: {
      on: {
        Disconnect: "Disconnecting",
        "Force Disconnect": {
          target: "Disconnected",
          actions: ["alertForceDisconnect"],
        },

        Restore: {
          target: "Connected",
        },
      },

      states: {
        Initial: {
          on: {
            "Send Takeoff": "Sending Takeoff",

            "Add Selected Drones": {
              target: "Initial",
              internal: true,
              actions: [
                assign({
                  selectedIDs: (context, event) => [
                    ...context.selectedIDs,
                    event.newSelectedDrone,
                  ],
                }),
              ],
            },
            "Remove Selected Drones": {
              target: "Initial",
              internal: true,
              actions: [
                assign({
                  selectedIDs: (context, event) => {
                    return context.selectedIDs.filter(
                      (id) => id !== event.removeDrone
                    );
                  },
                }),
              ],
            },
            "Set Selected Drones": {
              target: "Initial",
              internal: true,
              actions: [
                assign({
                  selectedIDs: (context, event) => event.newDrones,
                }),
              ],
            },
          },
        },

        "Sending Takeoff": {
          invoke: { src: "sendTakeoff", onDone: "Taking Off" },
        },

        "Taking Off": {
          on: {
            "Takeoff Complete": "Mission",
          },
        },

        Mission: {
          on: {
            "Mission Completed": "Initial",
          },

          states: {
            Normal: {
              states: {
                "In Progress": {
                  on: {
                    Pause: "Sending Pause",
                  },
                },

                "Sending Pause": {
                  invoke: { src: "sendPause", onDone: "Paused" },
                },

                Paused: {
                  on: {
                    Resume: "Sending Resume",
                  },
                },

                "Sending Resume": {
                  invoke: { src: "sendResume", onDone: "In Progress" },
                },
              },

              initial: "In Progress",

              on: {
                "Emergency Clear": "Sending Emergency Clear",
              },
            },

            "Sending Emergency Clear": {
              invoke: {
                src: "sendEmergencyClear",
                onDone: "Emergency Clearing",
              },
            },

            "Emergency Clearing": {},
          },

          initial: "Normal",
        },
      },

      initial: "Initial",
    },
    Disconnecting: {
      invoke: {
        src: "disconnect",
        onDone: [
          {
            target: "Disconnected",
            actions: ["alertDisconnect"],
          },
        ],
      },
    },
  },
  tsTypes: {} as import("./mainMachine.typegen").Typegen0,
  initial: "Connecting",
  context: { selectedIDs: [] as number[] },
  exit: [
    () => {
      invoke("telemetry_disconnect");
    },
  ],
  schema: {
    events: {} as
      | { type: "Reconnect" }
      | { type: "Disconnect" }
      | { type: "Force Disconnect"; reason: string }
      | { type: "Send Takeoff" }
      | { type: "Takeoff Complete" }
      | { type: "Pause" }
      | { type: "Resume" }
      | { type: "Emergency Clear" }
      | { type: "Mission Completed" }
      | { type: "Add Selected Drones"; newSelectedDrone: number }
      | { type: "Remove Selected Drones"; removeDrone: number }
      | { type: "Set Selected Drones"; newDrones: number[] }
      | { type: "Restore" },
    services: {} as {
      connect: {
        data: string;
      };
      disconnect: {
        data: void;
      };
      sendTakeoff: {
        data: void;
      };
      sendEmergencyClear: {
        data: void;
      };
      sendPause: {
        data: void;
      };
      sendResume: {
        data: void;
      };
    },
  },
});

export default mainMachine;

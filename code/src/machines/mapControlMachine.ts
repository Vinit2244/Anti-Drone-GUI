import { assign, createMachine } from "xstate";

const mapControlMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgDkB7AAgGUwAbMTAF1wvwGI7GWqAxAPIARANoAGALqJQABwqxcrdtJAAPRAGYArCS0AOMRoAsGgIwBOc6Y0AmGwBoQAT0SmdBgGymPRgOx6fDw0NXwBfUMc0LDxCUkpaBiYlTm4kqiEAJ3YwcSkkEDkFZJV1BABaCyMSDzsNPTNTXw9fLX9HFwRTUzESUyN9GzEvJpb-cMiMHAJiEkEhBJ5mSC5E3jnclULFNnwSxBsPPRJLMT0tc2CrI2b2xAqbKsOxKxPzU-6wiJAoqdjZ4QWSWWqV4mWyG3yW2K+VKNi0GhINg0YmuQxMDysHluCDsHl0Wm6BLEWg8xL0enG30mMRmc0BLGWQjgq2YENk8m2yhhdxsphIyKGWhJ5hselMenMLWxFTMiKMYmsh2C4vMfkpPxppDBhHpSwgK0W-GEbIKHOhoFKbhs1WarThYiRoqxzlcCt0HhJQr8-g0Is+E2i0y1WR1IL1BrS2pykk2Zp2e3KRiONnMYu95la-T0DhdOKaJE8tRTvlGGg86upQZIUd1jOZixNUPj3PKvnM-N8Rl5ZzcWgOYl82IOJDbrU7AzhWjEA-CX3wFAgcBUGqDsaKzYtPLFiL6Ji6jWuXWl3ZHFmRfUCIVMFcDf3iYY3pvXXM35SRCN5Rj3XU7XlMOY6e4SCMNwmnPVNbCRIwb1+WkATDSA105XYWy6HpfFsJotCzac9GlYI5UdB19FONsAhgzVqxDMBawgJDzTUO4hWA4JWj0IwrF5Z4jGxRo8TMckQNxRohlnUIgA */
    predictableActionArguments: true,

    states: {
      "No Selection": {
        on: {
          "Select FOD": {
            target: "FOD Selected",
            actions: "assignFOD",
          },
          "Select Drone": {
            target: "Drone Selected",
            actions: "assignDrone",
          },
        },
      },

      "FOD Selected": {
        on: {
          "Select FOD": {
            target: "FOD Selected",
            actions: ["assignFOD"],
          },

          "Select Drone": {
            target: "Drone Selected",
            actions: ["assignDrone"],
          },
          Deselect: { target: "No Selection", actions: ["unassign"] },
        },
      },

      "Drone Selected": {
        on: {
          "Select FOD": {
            target: "FOD Selected",
            actions: "assignFOD",
          },

          "Select Drone": {
            target: "Drone Selected",
            actions: "assignDrone",
          },

          Deselect: {
            target: "No Selection",
            actions: "unassign",
          },
        },
      },
    },
    context: { selectedID: null as null | string },
    initial: "No Selection",
    tsTypes: {} as import("./mapControlMachine.typegen").Typegen0,
    schema: {
      events: {} as
        | { type: "Deselect" }
        | { type: "Select Drone"; newSelectedDrone: string }
        | { type: "Select FOD"; newSelectedFOD: string },
    },
  },
  {
    actions: {
      assignFOD: assign({
        selectedID: (context, event) => event.newSelectedFOD,
      }),
      assignDrone: assign({
        selectedID: (context, event) => event.newSelectedDrone,
      }),
      unassign: assign({
        selectedID: null,
      }),
    },
  }
);

export default mapControlMachine;

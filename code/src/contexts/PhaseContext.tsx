import { createContext, useContext, useEffect } from "react";
import mainMachine from "../machines/mainMachine";
import { useInterpret } from "@xstate/react";
import { invoke } from "@tauri-apps/api/tauri";
import { UnlistenFn, emit } from "@tauri-apps/api/event";
import { InterpreterFrom } from "xstate";
import { AddAlertContext } from "./AlertContext";
import { listen } from "@tauri-apps/api/event";

export const PhaseContext = createContext({
  phaseService: {} as InterpreterFrom<typeof mainMachine>,
});
function AntiDroneDisconnected() {
  return new Promise(async (resolve) => {
    let unlisten: UnlistenFn = await listen("telemetry_disconnected", () => {
      unlisten();
      resolve(null);
    });
  });
}

export function PhaseProvider({ children }: React.PropsWithChildren) {
  const { addAlert } = useContext(AddAlertContext);
  const phaseService = useInterpret(mainMachine, {
    services: {
      connect: async () => {
        const [success, responseString] = (await invoke(
          "telemetry_connect"
        )) as [boolean, string];
        if (success) return responseString;
        else throw responseString;
      },
      disconnect: async () => {
        await invoke("telemetry_disconnect");
        await AntiDroneDisconnected();
      },
      sendEmergencyClear: async () => {
        emit("send_command", "emergencyClear");
      },
      sendPause: async () => {
        emit("send_command", "pause");
      },
      sendResume: async () => {
        emit("send_command", "resume");
      },
      sendTakeoff: async () => {
        emit("launch");
      },
    },
    actions: {
      alertConnection: (_, event) => {
        if (event.type.startsWith("done"))
          addAlert({
            alert: `Connected to Telemetry: ${event.data as string}`,
            severity: "success",
          });
        else
          addAlert({
            alert: `Could not Connect to Telemetry: ${event.data as string}`,
            severity: "error",
          });
      },
      alertDisconnect: () => {
        addAlert({
          alert: "Disconnected from Telemetry",
          severity: "warning",
        });
      },
      alertForceDisconnect: (_, event) => {
        addAlert({
          alert: `Got Disconnected from Telemetry: ${event.reason}`,
          severity: "error",
        });
      },
    },
  });
  return (
    <PhaseContext.Provider value={{ phaseService }}>
      {children}
    </PhaseContext.Provider>
  );
}

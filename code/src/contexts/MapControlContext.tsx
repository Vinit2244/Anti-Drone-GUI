import { PropsWithChildren, createContext } from "react";
import { InterpreterFrom } from "xstate";
import mapControlMachine from "../machines/mapControlMachine";
import { useInterpret } from "@xstate/react";

export const MapControlContext = createContext({
  mapControlService: {} as InterpreterFrom<typeof mapControlMachine>,
});

export function MapControlProvider({ children }: PropsWithChildren) {
  const mapControlService = useInterpret(mapControlMachine);
  return (
    <MapControlContext.Provider value={{ mapControlService }}>
      {children}
    </MapControlContext.Provider>
  );
}

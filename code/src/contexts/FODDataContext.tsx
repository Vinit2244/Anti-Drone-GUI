import { PropsWithChildren, createContext } from "react";
import { InterpreterFrom } from "xstate";
import fodDataMachine from "../machines/fodDataMachine";
import { useInterpret } from "@xstate/react";

export const FODDataContext = createContext({
  fodDataService: {} as InterpreterFrom<typeof fodDataMachine>,
});

export function FODDataProvider({ children }: PropsWithChildren) {
  const fodDataService = useInterpret(fodDataMachine);

  return (
    <FODDataContext.Provider value={{ fodDataService }}>
      {children}
    </FODDataContext.Provider>
  );
}

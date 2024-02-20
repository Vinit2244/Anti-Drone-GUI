// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    endMission: "done.invoke.(machine).Ending Mission:invocation[0]";
    getHistory: "done.invoke.(machine).Loading:invocation[0]";
    loadMission: "done.invoke.(machine).Detecting.Loading:invocation[0]";
    setCleared: "done.invoke.(machine).Detecting.Setting Cleared:invocation[0]";
    startMission: "done.invoke.(machine).Starting Mission:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    save: "Set Cleared";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    endMission: "End Mission";
    getHistory: "Load History";
    loadMission: "Load";
    setCleared: "Set Cleared";
    startMission: "Start Mission";
  };
  matchesStates:
    | "Detecting"
    | "Detecting.Idle"
    | "Detecting.Loading"
    | "Detecting.Setting Cleared"
    | "Ending Mission"
    | "History"
    | "Loading"
    | "No Data"
    | "Starting Mission"
    | { Detecting?: "Idle" | "Loading" | "Setting Cleared" };
  tags: never;
}


  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.(machine).Connecting:invocation[0]": { type: "done.invoke.(machine).Connecting:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.(machine).Disconnecting:invocation[0]": { type: "done.invoke.(machine).Disconnecting:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.(machine).Connecting:invocation[0]": { type: "error.platform.(machine).Connecting:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "connect": "done.invoke.(machine).Connecting:invocation[0]";
"disconnect": "done.invoke.(machine).Disconnecting:invocation[0]";
"sendEmergencyClear": "done.invoke.(machine).Connected.Mission.Sending Emergency Clear:invocation[0]";
"sendPause": "done.invoke.(machine).Connected.Mission.Normal.Sending Pause:invocation[0]";
"sendResume": "done.invoke.(machine).Connected.Mission.Normal.Sending Resume:invocation[0]";
"sendTakeoff": "done.invoke.(machine).Connected.Sending Takeoff:invocation[0]";
        };
        missingImplementations: {
          actions: "alertConnection" | "alertDisconnect" | "alertForceDisconnect";
          delays: never;
          guards: never;
          services: "connect" | "disconnect" | "sendEmergencyClear" | "sendPause" | "sendResume" | "sendTakeoff";
        };
        eventsCausingActions: {
          "alertConnection": "done.invoke.(machine).Connecting:invocation[0]" | "error.platform.(machine).Connecting:invocation[0]";
"alertDisconnect": "done.invoke.(machine).Disconnecting:invocation[0]";
"alertForceDisconnect": "Force Disconnect";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "connect": "Reconnect" | "xstate.init";
"disconnect": "Disconnect";
"sendEmergencyClear": "Emergency Clear";
"sendPause": "Pause";
"sendResume": "Resume";
"sendTakeoff": "Send Takeoff";
        };
        matchesStates: "Connected" | "Connected.Initial" | "Connected.Mission" | "Connected.Mission.Emergency Clearing" | "Connected.Mission.Normal" | "Connected.Mission.Normal.In Progress" | "Connected.Mission.Normal.Paused" | "Connected.Mission.Normal.Sending Pause" | "Connected.Mission.Normal.Sending Resume" | "Connected.Mission.Sending Emergency Clear" | "Connected.Sending Takeoff" | "Connected.Taking Off" | "Connecting" | "Disconnected" | "Disconnecting" | { "Connected"?: "Initial" | "Mission" | "Sending Takeoff" | "Taking Off" | { "Mission"?: "Emergency Clearing" | "Normal" | "Sending Emergency Clear" | { "Normal"?: "In Progress" | "Paused" | "Sending Pause" | "Sending Resume"; }; }; };
        tags: never;
      }
  
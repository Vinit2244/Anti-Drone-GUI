import { PropsWithChildren, useMemo } from "react";
import { useContext } from "react";
import { PhaseContext } from "../contexts/PhaseContext";
import { useActor, useSelector } from "@xstate/react";
export function OnlyConnected({
  children,
  not = false,
}: PropsWithChildren<{ not?: boolean }>) {
  const phaseServices = useContext(PhaseContext);
  const isConnected = useSelector(phaseServices.phaseService, (state) =>
    state.matches("Connected")
  );
  return useMemo(
    () => (isConnected != not ? <>{children}</> : null),
    [isConnected, not]
  );
}

export function ShowTakeoff({
  children,
  not = false,
}: PropsWithChildren<{ not?: boolean }>) {
  const phaseServices = useContext(PhaseContext);
  const show = useSelector(
    phaseServices.phaseService,
    (state) =>
      state.matches("Connected.Initial") ||
      state.matches("Connected.Sending Takeoff")
  );
  return useMemo(() => (show != not ? <>{children}</> : null), [show, not]);
}

export function ShowEmergencyClear({ children }: PropsWithChildren) {
  const phaseServices = useContext(PhaseContext);
  const show = useSelector(
    phaseServices.phaseService,
    (state) =>
      state.matches("Connected.Mission.Normal") ||
      state.matches("Connected.Mission.Sending Emergency Clear")
  );
  return useMemo(() => (show ? <>{children}</> : null), [show]);
}

export function ShowPause({ children }: PropsWithChildren) {
  const phaseServices = useContext(PhaseContext);
  const show = useSelector(
    phaseServices.phaseService,
    (state) =>
      state.matches("Connected.Mission.Normal.In Progress") ||
      state.matches("Connected.Mission.Normal.Sending Pause")
  );
  return useMemo(() => (show ? <>{children}</> : null), [show]);
}

export function ShowResume({ children }: PropsWithChildren) {
  const phaseServices = useContext(PhaseContext);
  const show = useSelector(
    phaseServices.phaseService,
    (state) =>
      state.matches("Connected.Mission.Normal.Paused") ||
      state.matches("Connected.Mission.Normal.Sending Resume")
  );
  return useMemo(() => (show ? <>{children}</> : null), [show]);
}

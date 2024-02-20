import { createContext, useCallback } from "react";
import { AlertColor } from "@mui/material";
import { useState } from "react";
export interface Alert {
  severity: AlertColor;
  alert: String;
}

export const AddAlertContext = createContext<{
  addAlert: (alert: Alert) => void;
}>({ addAlert: (alert: Alert) => {} });

export const AlertContext = createContext<{
  alerts: Alert[];
}>({ alerts: [] });

export function AlertProvider({ children }: React.PropsWithChildren) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const addAlert = useCallback((alert: Alert) => {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }, []);
  return (
    <AddAlertContext.Provider
      value={{
        addAlert,
      }}
    >
      <AlertContext.Provider value={{ alerts }}>
        {children}
      </AlertContext.Provider>
    </AddAlertContext.Provider>
  );
}

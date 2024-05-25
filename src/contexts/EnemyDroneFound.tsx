import React, { createContext } from 'react';

interface EnemyDroneContextType {
  isEnemyDronePresent: boolean;
  setEnemyDronePresent: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EnemyDroneContext = createContext<EnemyDroneContextType >({
  isEnemyDronePresent: false,
  setEnemyDronePresent: () => {},
});



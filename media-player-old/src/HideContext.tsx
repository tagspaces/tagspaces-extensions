import React from 'react';
import { Dispatch, hideReducer, State } from './hideReducer';

type HideProviderProps = { children: React.ReactNode };

const HideStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function HideProvider({ children }: HideProviderProps) {
  const [state, dispatch] = React.useReducer(hideReducer, { hide: false });
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = { state, dispatch };

  return (
    <HideStateContext.Provider value={value}>
      {children}
    </HideStateContext.Provider>
  );
}

function useHide() {
  const context = React.useContext(HideStateContext);
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
}

export { HideProvider, useHide };

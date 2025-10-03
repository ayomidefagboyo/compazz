import { createContext, useContext, ReactNode } from 'react';
import {
  DynamicContextProvider,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;

if (!dynamicEnvironmentId) {
  console.error('Missing VITE_DYNAMIC_ENVIRONMENT_ID in environment variables');
}

interface DynamicProviderProps {
  children: ReactNode;
}

export function DynamicProvider({ children }: DynamicProviderProps) {
  // If no environment ID is provided, render children without Dynamic context
  if (!dynamicEnvironmentId) {
    console.error('Dynamic Provider: No environment ID, rendering without wallet connection');
    return <>{children}</>;
  }

  console.log('Dynamic Provider: Initializing with environment ID');

  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicEnvironmentId,
        walletConnectors: [SolanaWalletConnectors],
        eventsCallbacks: {
          onAuthSuccess: (args) => {
            console.log('Dynamic: Auth success', args);
          },
          onAuthFailure: (args) => {
            console.error('Dynamic: Auth failure', args);
          },
          onLogout: (args) => {
            console.log('Dynamic: Logout', args);
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}

export { DynamicWidget };

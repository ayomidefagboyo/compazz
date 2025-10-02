import { createContext, useContext, ReactNode } from 'react';
import {
  DynamicContextProvider,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;

// Enhanced logging for production debugging
console.log('Dynamic Environment ID:', dynamicEnvironmentId ? 'Found' : 'Missing');
console.log('Dynamic Environment ID Value:', dynamicEnvironmentId);
console.log('Environment:', import.meta.env.MODE);
console.log('All VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

if (!dynamicEnvironmentId) {
  console.error('CRITICAL: Missing VITE_DYNAMIC_ENVIRONMENT_ID in environment variables');
  console.log('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
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

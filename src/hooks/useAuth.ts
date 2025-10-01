import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const { primaryWallet, user: dynamicUser } = useDynamicContext();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      if (!primaryWallet?.address || !dynamicUser) {
        setUserId(null);
        setLoading(false);
        return;
      }

      try {
        const walletAddress = primaryWallet.address;

        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', walletAddress)
          .maybeSingle();

        if (existingUser) {
          setUserId(existingUser.id);

          await supabase
            .from('users')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', existingUser.id);
        } else {
          const username = `user_${walletAddress.slice(0, 8)}`;

          const { data: newUser, error } = await supabase
            .from('users')
            .insert({
              id: dynamicUser.userId,
              wallet_address: walletAddress,
              username,
            })
            .select('id')
            .single();

          if (error) {
            console.error('Error creating user:', error);
          } else if (newUser) {
            setUserId(newUser.id);
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, [primaryWallet?.address, dynamicUser]);

  return {
    userId,
    walletAddress: primaryWallet?.address,
    isConnected: !!primaryWallet?.address,
    loading,
  };
}

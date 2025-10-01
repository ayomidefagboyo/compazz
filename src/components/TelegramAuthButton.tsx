import { useState } from 'react';
import { MessageCircle, Check, Loader2 } from 'lucide-react';
import { useTelegram } from '../contexts/TelegramContext';

interface TelegramAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function TelegramAuthButton({
  onSuccess,
  onError,
  className = '',
  variant = 'primary',
  size = 'md'
}: TelegramAuthButtonProps) {
  const { isAuthenticated, telegramUser, loginWithTelegram, isLoading } = useTelegram();
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    if (isAuthenticated) {
      onSuccess?.();
      return;
    }

    setLocalLoading(true);
    try {
      await loginWithTelegram();
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with Telegram';
      onError?.(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = isLoading || localLoading;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
    secondary: 'bg-transparent text-blue-400 hover:bg-blue-600/10 border-blue-400'
  };

  const baseClasses = `
    inline-flex items-center justify-center space-x-2
    rounded-lg font-medium transition-all duration-200
    border disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]} ${variantClasses[variant]} ${className}
  `;

  if (isAuthenticated && telegramUser) {
    return (
      <button
        onClick={() => onSuccess?.()}
        className={`${baseClasses} cursor-default`}
        disabled={loading}
      >
        <Check className="w-4 h-4" />
        <span>Connected as @{telegramUser.username || telegramUser.first_name}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={baseClasses}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <MessageCircle className="w-4 h-4" />
          <span>Connect Telegram</span>
        </>
      )}
    </button>
  );
}

// Mini version for status display
export function TelegramStatus() {
  const { isAuthenticated, telegramUser } = useTelegram();

  if (!isAuthenticated || !telegramUser) {
    return null;
  }

  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-400 text-sm">
      <MessageCircle className="w-3 h-3" />
      <span>@{telegramUser.username || telegramUser.first_name}</span>
    </div>
  );
}
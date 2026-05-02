import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AppFeedback, FeedbackType } from '~/components/ui/AppFeedback';

interface FeedbackOptions {
  title: string;
  message?: string;
  type?: FeedbackType;
  primaryText?: string;
  secondaryText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  loading?: boolean;
  autoClose?: boolean;
}

interface FeedbackContextType {
  showFeedback: (options: FeedbackOptions) => void;
  hideFeedback: () => void;
  showSuccess: (title: string, message?: string, options?: Partial<FeedbackOptions>) => void;
  showError: (title: string, message?: string, options?: Partial<FeedbackOptions>) => void;
  showWarning: (title: string, message?: string, options?: Partial<FeedbackOptions>) => void;
  showInfo: (title: string, message?: string, options?: Partial<FeedbackOptions>) => void;
  showNetworkError: (onRetry?: () => void, options?: Partial<FeedbackOptions>) => void;
  showSubscription: (message?: string, onSubscribe?: () => void, options?: Partial<FeedbackOptions>) => void;
  showLoading: (title: string, message?: string, options?: Partial<FeedbackOptions>) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Static holder for API layer access (non-React usage)
let globalShowFeedback: ((options: FeedbackOptions) => void) | null = null;

export const showGlobalFeedback = (options: FeedbackOptions) => {
  if (globalShowFeedback) {
    globalShowFeedback(options);
  } else {
    console.warn('[FeedbackContext] globalShowFeedback called before provider mount');
  }
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<FeedbackOptions>({ title: '' });

  const showFeedback = useCallback((options: FeedbackOptions) => {
    setConfig(options);
    setVisible(true);
  }, []);

  const hideFeedback = useCallback(() => {
    setVisible(false);
  }, []);

  // Update global holder
  React.useEffect(() => {
    globalShowFeedback = showFeedback;
    return () => { globalShowFeedback = null; };
  }, [showFeedback]);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<FeedbackOptions>) => {
    showFeedback({ 
      title, 
      message, 
      type: 'success', 
      autoClose: true, 
      primaryText: 'Great',
      ...options 
    });
  }, [showFeedback]);

  const showError = useCallback((title: string, message?: string, options?: Partial<FeedbackOptions>) => {
    showFeedback({ 
      title, 
      message, 
      type: 'error', 
      primaryText: 'Understood',
      ...options 
    });
  }, [showFeedback]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<FeedbackOptions>) => {
    showFeedback({ 
      title, 
      message, 
      type: 'warning',
      ...options 
    });
  }, [showFeedback]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<FeedbackOptions>) => {
    showFeedback({ 
      title, 
      message, 
      type: 'info',
      ...options 
    });
  }, [showFeedback]);

  const showNetworkError = useCallback((onRetry?: () => void, options?: Partial<FeedbackOptions>) => {
    showFeedback({
      title: 'Connection Issue',
      message: 'We are having trouble reaching our servers. Please check your internet.',
      type: 'network',
      primaryText: 'Try Again',
      secondaryText: 'Cancel',
      onPrimary: onRetry,
      ...options
    });
  }, [showFeedback]);

  const showSubscription = useCallback((message?: string, onSubscribe?: () => void, options?: Partial<FeedbackOptions>) => {
    showFeedback({
      title: 'Premium Feature',
      message: message || 'This feature requires an active subscription.',
      type: 'subscription',
      primaryText: 'View Plans',
      secondaryText: 'Maybe Later',
      onPrimary: onSubscribe,
      ...options
    });
  }, [showFeedback]);

  const showLoading = useCallback((title: string, message?: string, options?: Partial<FeedbackOptions>) => {
    showFeedback({
      title,
      message,
      loading: true,
      type: 'info',
      ...options
    });
  }, [showFeedback]);

  const handlePrimary = useCallback(() => {
    if (config.onPrimary) {
      config.onPrimary();
    }
    hideFeedback();
  }, [config, hideFeedback]);

  const handleSecondary = useCallback(() => {
    if (config.onSecondary) {
      config.onSecondary();
    }
    hideFeedback();
  }, [config, hideFeedback]);

  const value = useMemo(() => ({ 
    showFeedback, 
    hideFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNetworkError,
    showSubscription,
    showLoading
  }), [
    showFeedback, 
    hideFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNetworkError,
    showSubscription,
    showLoading
  ]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <AppFeedback
        visible={visible}
        title={config.title}
        message={config.message}
        type={config.type}
        primaryText={config.primaryText}
        secondaryText={config.secondaryText}
        onPrimary={handlePrimary}
        onSecondary={handleSecondary}
        onClose={hideFeedback}
        loading={config.loading}
        autoClose={config.autoClose}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within a FeedbackProvider');
  return context;
};

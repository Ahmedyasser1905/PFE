import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AppFeedback } from '~/components/ui/AppFeedback';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackOptions {
  title: string;
  message?: string;
  type?: FeedbackType;
  primaryText?: string;
  secondaryText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  loading?: boolean;
}

interface FeedbackContextType {
  showFeedback: (options: FeedbackOptions) => void;
  hideFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

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

  const handlePrimary = useCallback(() => {
    if (config.onPrimary) {
      config.onPrimary();
    } else {
      hideFeedback();
    }
  }, [config, hideFeedback]);

  const handleSecondary = useCallback(() => {
    if (config.onSecondary) {
      config.onSecondary();
    } else {
      hideFeedback();
    }
  }, [config, hideFeedback]);

  const value = useMemo(() => ({ showFeedback, hideFeedback }), [showFeedback, hideFeedback]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <AppFeedback
        visible={visible}
        title={config.title}
        message={config.message}
        type={config.type || 'info'}
        primaryText={config.primaryText || 'OK'}
        secondaryText={config.secondaryText}
        onPrimary={handlePrimary}
        onSecondary={config.onSecondary ? handleSecondary : undefined}
        loading={config.loading}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within a FeedbackProvider');
  return context;
};

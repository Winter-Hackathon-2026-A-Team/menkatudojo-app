// globalmessageの設定
import { MessageContextType, MessageState, MessageType } from '@/types/message';
import React, { createContext, useCallback, useContext, useState } from 'react';

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<MessageState | null>(null);

  const showMessage = useCallback((text: string, type: MessageType = 'info') => {
    setMessage({ text, type });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return (
    <MessageContext.Provider value={{ message, showMessage, clearMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessageはMessageProvider内で使用してください');
  return context;
};

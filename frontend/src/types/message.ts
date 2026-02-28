// globalMessageの型定義

export type MessageType = 'error' | 'info' | 'success';

export interface MessageState {
  text: string;
  type: MessageType;
}

export interface MessageContextType {
  message: MessageState | null;
  showMessage: (text: string, type?: MessageType) => void;
  clearMessage: () => void;
}

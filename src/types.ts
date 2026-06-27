export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  isSystem?: boolean;
  privilegeBadge?: string;
  replyToId?: string;
  reactions?: Record<string, string[]>;
}

export interface RoomState {
  id: string;
  lifespanMinutes: number;
  createdAt: number;
  isAdmin?: boolean;
}

export interface PeerMessage {
  type: 'chat' | 'peer_joined' | 'kick_peer' | 'promote_peer' | 'demote_peer' | 'toggle_mute_room' | 'typing_status' | 'message_reaction' | 'rotate_room';
  payload: {
    message?: ChatMessage;
    messages?: ChatMessage[];
    roomState?: RoomState;
    peerId?: string;
    peerName?: string;
    targetId?: string;
    isMuted?: boolean;
    isTyping?: boolean;
    messageId?: string;
    reaction?: string;
    newRoomId?: string;
  };
}
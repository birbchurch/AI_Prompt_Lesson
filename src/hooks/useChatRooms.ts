import { useState, useEffect } from 'react';
import { ChatRoom, Message } from '../types';

export function useChatRooms() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatRooms');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChatRooms(parsed);
        if (parsed.length > 0) {
          setActiveRoomId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse chat rooms from localStorage', e);
      }
    }
  }, []);

  const createRoom = (title: string, initialMessage?: Message) => {
    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      title,
      messages: initialMessage ? [initialMessage] : [],
      createdAt: Date.now(),
    };
    setChatRooms(prevRooms => {
      const updated = [newRoom, ...prevRooms];
      localStorage.setItem('chatRooms', JSON.stringify(updated));
      return updated;
    });
    setActiveRoomId(newRoom.id);
    return newRoom.id;
  };

  const addMessage = (roomId: string, message: Message) => {
    setChatRooms(prevRooms => {
      const updated = prevRooms.map(room => {
        if (room.id === roomId) {
          return { ...room, messages: [...room.messages, message] };
        }
        return room;
      });
      try {
        localStorage.setItem('chatRooms', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save chat rooms to localStorage (might be too large):", e);
        alert("儲存失敗：附加檔案/圖片可能過大，無法儲存於瀏覽器中。");
      }
      return updated;
    });
  };

  const updateMessage = (roomId: string, messageId: string, updates: Partial<Message>) => {
    setChatRooms(prevRooms => {
      const updated = prevRooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            messages: room.messages.map(m => (m.id === messageId ? { ...m, ...updates } : m))
          };
        }
        return room;
      });
      try {
        localStorage.setItem('chatRooms', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save chat rooms to localStorage:", e);
      }
      return updated;
    });
  };

  const deleteRoom = (roomId: string) => {
    setChatRooms(prevRooms => {
      const updated = prevRooms.filter(r => r.id !== roomId);
      localStorage.setItem('chatRooms', JSON.stringify(updated));
      if (activeRoomId === roomId) {
        setActiveRoomId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  return { 
    chatRooms, 
    activeRoomId, 
    setActiveRoomId, 
    createRoom, 
    addMessage, 
    updateMessage,
    deleteRoom 
  };
}

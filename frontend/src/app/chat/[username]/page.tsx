'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatLayout } from '@/components/chat-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/user-avatar';
import { Send } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { messages } from '@/types/messages';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const [message, setMessage] = useState<messages[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const username = usePathname().split('/').pop();
  const [inpMsg, setInpmsg] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const msgEndScroll = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  function scrollToEnd() {
    msgEndScroll.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToEnd();
  }, [getMessageForSelectedUser()]);

  useEffect(() => {
    ws.current = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEB_SOCKET || 'ws://localhost:8000/ws'}/${username}`
    );

    ws.current.onmessage = (e) => {
      const message = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (message.type === 'message') {
        setMessage((prev) => [...prev, message]);
        if (message.from !== selectedUser) {
          toast({
            title: `New Message from ${message.from}`,
          });
        }
      } else if (message.type === 'offline') {
        toast({
          title: message.message,
          description: 'Message is not delivered!',
        });
      }
    };

    function handleUnload() {
      ws.current?.close();
    }

    window.addEventListener('unload', handleUnload);

    return () => {
      ws.current?.close();
      window.removeEventListener('unload', handleUnload);
    };
  }, [username, selectedUser]);

  function getMessageForSelectedUser() {
    return message.filter(
      (msg) =>
        (msg.to === selectedUser && msg.from === username) ||
        (msg.from === selectedUser && msg.to === username)
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (inpMsg == '') return;

    // sending msg to other using websocket
    const message = {
      type: 'message',
      from: username,
      to: selectedUser,
      message: inpMsg,
    };
    ws.current?.send(JSON.stringify(message));

    // Handle sending message
    setMessage((prev) => [
      ...prev,
      {
        type: 'message',
        from: username as string,
        to: selectedUser as string,
        message: inpMsg as string,
      },
    ]);
    setInpmsg('');
  };

  return (
    <ChatLayout
      ws={ws.current}
      onSelect={(user: string) => setSelectedUser(user)}
    >
      {selectedUser === '' ? (
        <NotSelectedUser />
      ) : (
        <div className="flex-1 flex flex-col max-h-screen">
          {/* Chat Header */}
          <div className="border-b p-4 flex items-center">
            <UserAvatar
              user={{
                name: selectedUser,
              }}
              className="h-8 w-8 mr-2"
            />
            <div>
              <h2 className="font-semibold">{selectedUser}</h2>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-screen">
            {selectedUser && getMessageForSelectedUser().length > 0 ? (
              getMessageForSelectedUser().map((msg, index) => (
                <div
                  className={`flex ${msg.from === username ? 'items-end justify-end' : 'items-start justify-start'} gap-2`}
                  key={index}
                >
                  <div
                    ref={msgEndScroll}
                    className={`${msg.from === username ? 'bg-green-800 rounded-tr-none' : 'bg-gray-600 rounded-tl-none'} text-lg p-3 rounded-lg max-w-[70%] `}
                  >
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <p>start chatting Now!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inpMsg}
                onChange={(e) => setInpmsg(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </ChatLayout>
  );
}

function NotSelectedUser() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div>No user is selected!</div>
    </div>
  );
}

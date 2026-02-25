import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Send, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/community/UserAvatar';
import { format, isToday, isYesterday } from 'date-fns';
import { da } from 'date-fns/locale';

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) setUserProfile(profiles[0]);
      } catch {}
    };
    loadUser();
  }, []);

  const { data: conversation, isLoading: loadingConv } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const convs = await base44.entities.ChatConversation.filter({ id: conversationId });
      return convs[0];
    },
    enabled: !!conversationId,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => base44.entities.ChatMessage.filter(
      { conversation_id: conversationId },
      'created_date'
    ),
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll for new messages
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;
    
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries(['messages', conversationId]);
      }
    });
    
    return unsubscribe;
  }, [conversationId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.ChatMessage.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_username: userProfile?.username || user.full_name,
        sender_image: userProfile?.profile_image,
        content,
      });
      
      // Update conversation last message
      await base44.entities.ChatConversation.update(conversationId, {
        last_message: content,
        last_message_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', conversationId]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  const otherIndex = conversation?.participants?.findIndex(p => p !== user?.email) || 0;
  const otherName = conversation?.participant_usernames?.[otherIndex] || 'Chat';
  const otherImage = conversation?.participant_images?.[otherIndex];

  const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `I går ${format(date, 'HH:mm')}`;
    return format(date, 'd. MMM HH:mm', { locale: da });
  };

  if (loadingConv) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Community')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <UserAvatar src={otherImage} name={otherName} size="sm" />
          <div className="flex-1">
            <h1 className="font-semibold text-slate-900">{otherName}</h1>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Ingen beskeder endnu</p>
            <p className="text-sm text-slate-400 mt-1">Sig hej!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_email === user?.email;
            const showAvatar = !isOwn && (i === 0 || messages[i - 1]?.sender_email !== msg.sender_email);
            
            return (
              <div 
                key={msg.id}
                className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <div className="w-8">
                    {showAvatar && (
                      <UserAvatar 
                        src={msg.sender_image} 
                        name={msg.sender_username}
                        size="sm"
                      />
                    )}
                  </div>
                )}
                <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isOwn 
                      ? 'bg-slate-900 text-white rounded-br-md' 
                      : 'bg-slate-100 text-slate-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                    {formatMessageDate(msg.created_date)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 safe-area-bottom">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Skriv en besked..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 bg-slate-50 border-0 rounded-full px-4"
          />
          <Button 
            size="icon"
            className="rounded-full bg-slate-900 hover:bg-slate-800"
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
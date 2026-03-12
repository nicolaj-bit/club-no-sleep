import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Send, MoreVertical, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/community/UserAvatar';
import ReportSheet from '@/components/community/ReportSheet';
import { format, isToday, isYesterday } from 'date-fns';
import { da } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [reportTarget, setReportTarget] = useState(null); // { email, messageId? }
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
      const conv = convs[0];
      // Access control: only participants can view
      if (conv && user && !conv.participants?.includes(user.email)) return null;
      return conv;
    },
    enabled: !!conversationId && !!user,
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
    );
  }

  // Access denied
  if (!loadingConv && conversation === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Ingen adgang til denne samtale.</p>
        <Link to={createPageUrl('Community')}>
          <Button variant="outline">Tilbage</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b px-4 py-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Community')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <UserAvatar src={otherImage} name={otherName} size="sm" />
          <div className="flex-1">
            <h1 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{otherName}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-500 gap-2"
                onClick={() => setReportTarget({ email: conversation?.participants?.find(p => p !== user?.email) })}
              >
                <Flag className="w-4 h-4" />
                Indberetning
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <p style={{ color: 'var(--color-text-muted)' }}>Ingen beskeder endnu</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Sig hej!</p>
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
                  <div className="px-4 py-2.5 rounded-2xl" style={isOwn
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', borderRadius: '16px 16px 4px 16px' }
                    : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', borderRadius: '16px 16px 16px 4px' }
                  }>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-right' : ''}`} style={{ color: 'var(--color-text-muted)' }}>
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
      <div className="sticky bottom-0 border-t p-4 safe-area-bottom" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Skriv en besked..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 border-0 rounded-full px-4"
            style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)' }}
          />
          <Button 
            size="icon"
            className="rounded-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
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
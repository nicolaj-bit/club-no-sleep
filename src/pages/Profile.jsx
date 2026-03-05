import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Camera, Settings, LogOut, ChevronRight, Bookmark, 
  Calendar, HelpCircle, Shield, MapPin, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UserAvatar from '@/components/community/UserAvatar';

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin();
          return;
        }
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter(
      { client_email: user.email },
      '-date',
      5
    ),
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['myFavorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, data);
      } else {
        await base44.entities.UserProfile.create({
          ...data,
          user_email: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setEditOpen(false);
      toast.success('Profil opdateret');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateProfileMutation.mutate({ profile_image: file_url });
    } catch {
      toast.error('Kunne ikke uploade billede');
    }
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="flex flex-col items-center py-8">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-32 mt-4" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: Bookmark, label: 'Mine favoritter', count: favorites.length, page: 'Favorites' },
    { icon: Calendar, label: 'Mine bookinger', count: bookings.length, page: 'MyBookings' },
    { icon: HelpCircle, label: 'Mine spørgsmål', page: 'MyQuestions' },
    { icon: Settings, label: 'Indstillinger', page: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Profil</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Profile Card */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex flex-col items-center">
            <div className="relative">
              <UserAvatar 
                src={profile?.profile_image}
                name={profile?.display_name || user?.full_name}
                size="2xl"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            
            <h2 className="text-xl font-semibold text-slate-900 mt-4">
              {profile?.display_name || user?.full_name || 'Bruger'}
            </h2>
            <p className="text-slate-500">@{profile?.username || user?.email?.split('@')[0]}</p>
            
            {profile?.city && (
              <div className="flex items-center gap-1 text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{profile.city}</span>
              </div>
            )}

            {profile?.role === 'expert' && (
              <span className="mt-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                EKSPERT
              </span>
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full"
                  onClick={() => setEditForm({
                   username: profile?.username || '',
                   display_name: profile?.display_name || '',
                   city: profile?.city || '',
                   child_birthdate: profile?.child_birthdate || '',
                  })}
                >
                  Rediger profil
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rediger profil</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Brugernavn</Label>
                    <Input 
                      value={editForm.username || ''}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="dit_brugernavn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visningsnavn</Label>
                    <Input 
                      value={editForm.display_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      placeholder="Dit navn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>By</Label>
                    <Input 
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="København"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => updateProfileMutation.mutate(editForm)}
                    disabled={updateProfileMutation.isPending}
                  >
                    Gem ændringer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4 space-y-2">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link 
                key={i}
                to={createPageUrl(item.page)}
                className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <span className="flex-1 font-medium text-slate-900">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-sm text-slate-400">{item.count}</span>
                )}
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Link>
            );
          })}
        </div>

        {/* Privacy & Security */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 px-1">Privatliv & Sikkerhed</h3>
          <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-700">Del lokation</span>
              </div>
              <Switch 
                checked={profile?.location_enabled || false}
                onCheckedChange={(checked) => updateProfileMutation.mutate({ location_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-700">Vis mig som synlig</span>
              </div>
              <Switch 
                checked={profile?.is_visible !== false}
                onCheckedChange={(checked) => updateProfileMutation.mutate({ is_visible: checked })}
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <Button 
          variant="ghost" 
          className="w-full mt-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log ud
        </Button>
      </div>
    </div>
  );
}
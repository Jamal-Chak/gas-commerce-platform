'use client';

import { useEffect, useState } from 'react';
import { Loader2, User, Save, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createBrowserSupabaseClient } from '@/lib/supabase/browserClient';

export default function AccountProfilePage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? '');
      const { data: customer } = await supabase
        .from('customers')
        .select('id, full_name, phone')
        .eq('auth_user_id', user.id)
        .single();
      if (customer) {
        setCustomerId(String(customer.id));
        setFullName(String(customer.full_name));
        setPhone((customer.phone as string) ?? '');
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!customerId) return;
    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) { setSaving(false); return; }
    await supabase
      .from('customers')
      .update({ full_name: fullName, phone: phone || null })
      .eq('id', customerId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-5 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">My Profile</h1>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 grid size-12 place-items-center rounded-full">
              <User className="text-primary size-5" />
            </div>
            <div>
              <p className="font-medium">{fullName || 'Your name'}</p>
              <p className="text-muted-foreground text-sm">{email}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27…" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Email</label>
            <Input value={email} disabled className="bg-muted mt-1" />
            <p className="text-muted-foreground mt-1 text-xs">Email is managed by your account and cannot be changed here.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 self-start">
            {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createBrowserSupabaseClient } from '@/lib/supabase/browserClient';
import { formatCurrency } from '@/lib/utils/format';

interface Zone {
  id: string;
  name: string;
  description: string | null;
  delivery_fee: number;
  estimated_minutes: number;
  active: boolean;
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deliveryFee: 50, estimatedMinutes: 45 });
  const [saving, setSaving] = useState(false);

  const loadZones = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    const { data } = await supabase.from('delivery_zones').select('*').order('name');
    setZones((data ?? []) as Zone[]);
    setLoading(false);
  };

  useEffect(() => { loadZones(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) { setSaving(false); return; }
    // This would need a server action in production — using browser client for demo
    await supabase.from('delivery_zones').insert({
      name: form.name,
      description: form.description || null,
      delivery_fee: form.deliveryFee,
      estimated_minutes: form.estimatedMinutes,
      active: true,
    });
    setSaving(false);
    setShowCreate(false);
    setForm({ name: '', description: '', deliveryFee: 50, estimatedMinutes: 45 });
    loadZones();
  };

  const handleToggle = async (id: string, active: boolean) => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    await supabase.from('delivery_zones').update({ active: !active }).eq('id', id);
    loadZones();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-5 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading zones…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Zones</h1>
          <p className="text-muted-foreground text-sm">{zones.length} zones configured</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
          {showCreate ? 'Cancel' : 'Add Zone'}
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-medium">Zone Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sandton" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Area description" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Delivery Fee (ZAR)</label>
                <Input type="number" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Est. Minutes</label>
                <Input type="number" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} className="mt-1" />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-4">
                <Button onClick={handleCreate} disabled={saving || !form.name.trim()} className="gap-2">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Create Zone
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="text-primary size-4" />
                  <span className="font-semibold">{zone.name}</span>
                </div>
                <Badge variant="outline" className={zone.active ? 'bg-green-100 text-green-800 border-green-200 text-xs' : 'text-xs'}>
                  {zone.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {zone.description && <p className="text-muted-foreground text-sm">{zone.description}</p>}
              <div className="flex gap-4 text-sm">
                <span className="font-medium tabular-nums">{formatCurrency(zone.delivery_fee, 'ZAR')}</span>
                <span className="text-muted-foreground">~{zone.estimated_minutes} min</span>
              </div>
              <Button variant="outline" size="sm" className="mt-2 self-start text-xs" onClick={() => handleToggle(zone.id, zone.active)}>
                {zone.active ? 'Disable' : 'Enable'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

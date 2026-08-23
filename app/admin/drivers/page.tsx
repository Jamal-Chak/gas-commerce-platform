'use client';

import { useEffect, useState } from 'react';
import { Loader2, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDrivers } from '@/lib/admin/driver-service';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getDrivers();
      setDrivers(data);
      setLoading(false);
    })();
  }, []);

  const online = drivers.filter((d) => d.is_online);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Drivers</h1>
        <p className="text-muted-foreground text-sm">
          {online.length} of {drivers.length} drivers online
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 p-8">
              <Loader2 className="text-primary size-5 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading drivers…</p>
            </div>
          ) : drivers.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No drivers registered</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={String(d.id)} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{String(d.full_name)}</td>
                      <td className="px-4 py-3">
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Phone className="size-3" /> {String(d.phone ?? '—')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <div>{(d.vehicle_type as string) ?? '—'}</div>
                          {Boolean(d.vehicle_registration) && (
                            <div className="text-muted-foreground">{String(d.vehicle_registration)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={d.is_online
                            ? 'bg-green-100 text-green-800 border-green-200 text-xs'
                            : 'text-xs'}
                        >
                          {d.is_online ? 'Online' : 'Offline'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

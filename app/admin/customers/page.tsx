'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAdminCustomers } from '@/lib/admin/admin-service';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';

type Customer = Awaited<ReturnType<typeof getAdminCustomers>>[number];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { currency } = useBusinessConfig();
  const cur = currency ?? 'ZAR';

  useEffect(() => {
    (async () => {
      const data = await getAdminCustomers();
      setCustomers(data);
      setLoading(false);
    })();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground text-sm">
          {customers.length} registered customer{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Input
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 p-8">
              <Loader2 className="text-primary size-5 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading customers…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No customers found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Orders</th>
                    <th className="px-4 py-3 text-right">Total Spent</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 grid size-9 place-items-center rounded-full">
                            <Users className="text-primary size-4" />
                          </div>
                          <span className="font-medium">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {c.email && (
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                              <Mail className="size-3" /> {c.email}
                            </span>
                          )}
                          {c.phone && (
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                              <Phone className="size-3" /> {c.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{c.totalOrders}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(c.totalSpent, cur)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
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

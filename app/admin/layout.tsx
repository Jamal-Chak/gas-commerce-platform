import { ReactNode } from 'react';
import { AdminGuard } from '@/components/auth/admin-guard';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Truck, BarChart3, Users, Settings,
  Boxes, CreditCard, Star,
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/drivers', label: 'Drivers', icon: Truck },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/promos', label: 'Promos', icon: Star },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="bg-card hidden w-64 shrink-0 border-r lg:block">
          <div className="flex flex-col gap-1 p-4">
            <Link href="/admin" className="mb-4 flex items-center gap-2 px-3 py-2">
              <div className="bg-primary grid size-8 place-items-center rounded-lg">
                <LayoutDashboard className="text-primary-foreground size-4" />
              </div>
              <span className="text-lg font-bold">Admin</span>
            </Link>
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
            <div className="mt-auto border-t pt-4">
              <Link
                href="/account"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm"
              >
                ← Back to site
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}

import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Business configuration and preferences</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="bg-muted grid size-14 place-items-center rounded-full">
            <Settings className="text-muted-foreground size-6" />
          </div>
          <div className="text-center">
            <h2 className="font-semibold">Business Settings</h2>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Configure your business name, logo, contact details, delivery zones, and payment providers.
              These settings are managed through environment variables and the Supabase dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

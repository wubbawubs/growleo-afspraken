'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailSettingsService } from '@/services/api/email-settings.service';
import { EmailSettings, EmailTemplate, TimeframeSettings, EmailStats } from '@/types/email';
import { AccountList } from '@/components/email/account-list';
import { TemplateEditor } from '@/components/email/templates/template-editor';
import { TimeframeSettingsComponent } from '@/components/email/settings/timeframe-settings';
import { BasicStats } from '@/components/email/stats/basic-stats';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [emailSettings, setEmailSettings] = useState<EmailSettings[]>([]);
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [timeframes, setTimeframes] = useState<TimeframeSettings>({
    reminder: 24,
    followup: 48,
    cancellationWindow: 12
  });
  const [stats, setStats] = useState<EmailStats>({
    totalSent: 0,
    responses: {
      accepted: 0,
      declined: 0,
      pending: 0
    },
    averageResponseTime: 0,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await EmailSettingsService.listEmailAccounts();
      setEmailSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load email settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTimeframes = async (newTimeframes: TimeframeSettings) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement timeframe update
      setTimeframes(newTimeframes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update timeframes'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Email Instellingen</h1>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="timeframes">Tijdschema&apos;s</TabsTrigger>
          <TabsTrigger value="stats">Statistieken</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Email Accounts</CardTitle>
              <CardDescription>Manage your email accounts and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountList accounts={emailSettings} onUpdate={loadEmailSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage your email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateEditor templates={templates} onUpdate={(newTemplates) => setTemplates(newTemplates)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeframes">
          <Card>
            <CardHeader>
              <CardTitle>Timeframe Settings</CardTitle>
              <CardDescription>Configure email timing settings</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeframeSettingsComponent timeframes={timeframes} onUpdate={handleUpdateTimeframes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Email Statistics</CardTitle>
              <CardDescription>View your email performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <BasicStats stats={stats} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
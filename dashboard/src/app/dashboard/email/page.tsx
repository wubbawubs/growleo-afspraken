'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AccountList } from '@/components/email/account-list';
import { TemplateEditor } from '@/components/email/templates/template-editor';
import { TimeframeSettingsComponent } from '@/components/email/settings/timeframe-settings';
import { BasicStats } from '@/components/email/stats/basic-stats';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmailSettings, EmailTemplate, TimeframeSettings, EmailStats } from '@/types/email';

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [accounts, setAccounts] = useState<EmailSettings[]>([]);
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

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
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
          <Card className="p-6">
            <AccountList accounts={accounts} onUpdate={() => {}} />
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-6">
            <TemplateEditor 
              templates={templates} 
              onUpdate={(type, template) => {
                setTemplates(prev => ({ ...prev, [type]: template }));
              }} 
            />
          </Card>
        </TabsContent>

        <TabsContent value="timeframes">
          <Card className="p-6">
            <TimeframeSettingsComponent 
              timeframes={timeframes} 
              onUpdate={(newTimeframes) => setTimeframes(newTimeframes)} 
            />
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <BasicStats stats={stats} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
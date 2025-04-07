'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmailSettings } from '@/types/email';
import { EmailSettingsService } from '@/services/api/email-settings.service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Mail, Trash2 } from 'lucide-react';

interface AccountListProps {
  accounts: EmailSettings[];
  onUpdate: () => void;
}

export function AccountList({ accounts, onUpdate }: AccountListProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailService = new EmailSettingsService();

  const handleConnectGmail = async () => {
    try {
      setLoading(true);
      setError(null);
      const authUrl = await emailService.getGmailAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get Gmail auth URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.setDefaultEmailAccount(id);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default account');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.removeEmailAccount(id);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleConnectGmail}
        disabled={loading}
        className="w-full"
      >
        <Mail className="mr-2 h-4 w-4" />
        Connect Gmail Account
      </Button>

      <div className="grid gap-4">
        {accounts.map(account => (
          <Card key={account.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Mail className="h-5 w-5" />
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {account.isDefault ? (
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm">Default</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(account.id)}
                    disabled={loading}
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveAccount(account.id)}
                  disabled={loading || account.isDefault}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
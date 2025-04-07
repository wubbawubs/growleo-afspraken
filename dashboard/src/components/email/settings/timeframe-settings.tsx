'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeframeSettings as TimeframeSettingsType } from '@/types/email';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Save } from 'lucide-react';

interface TimeframeSettingsProps {
  timeframes: TimeframeSettingsType;
  onUpdate: (timeframes: TimeframeSettingsType) => void;
}

export function TimeframeSettingsComponent({ timeframes, onUpdate }: TimeframeSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedTimeframes, setEditedTimeframes] = useState(timeframes);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onUpdate(editedTimeframes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update timeframes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="reminder">Herinnering (uren voor afspraak)</Label>
            <Input
              id="reminder"
              type="number"
              min="1"
              max="72"
              value={editedTimeframes.reminder}
              onChange={(e) => setEditedTimeframes({
                ...editedTimeframes,
                reminder: parseInt(e.target.value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup">Follow-up (uren na afspraak)</Label>
            <Input
              id="followup"
              type="number"
              min="1"
              max="72"
              value={editedTimeframes.followup}
              onChange={(e) => setEditedTimeframes({
                ...editedTimeframes,
                followup: parseInt(e.target.value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellationWindow">Annuleringstermijn (uren voor afspraak)</Label>
            <Input
              id="cancellationWindow"
              type="number"
              min="1"
              max="72"
              value={editedTimeframes.cancellationWindow}
              onChange={(e) => setEditedTimeframes({
                ...editedTimeframes,
                cancellationWindow: parseInt(e.target.value)
              })}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 
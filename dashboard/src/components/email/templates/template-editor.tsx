'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmailTemplate } from '@/types/email';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Save } from 'lucide-react';

interface TemplateEditorProps {
  templates: Record<string, EmailTemplate>;
  onUpdate: (type: string, template: EmailTemplate) => void;
}

export function TemplateEditor({ templates, onUpdate }: TemplateEditorProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate | null>(null);

  const handleTemplateSelect = (type: string) => {
    setActiveTemplate(type);
    setEditedTemplate(templates[type] || {
      subject: '',
      template: '',
      variables: [],
    });
  };

  const handleSave = async () => {
    if (!activeTemplate || !editedTemplate) return;

    try {
      setLoading(true);
      setError(null);
      await onUpdate(activeTemplate, editedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
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

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Template Types</h3>
              <div className="space-y-2">
                {Object.keys(templates).map(type => (
                  <Button
                    key={type}
                    variant={activeTemplate === type ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleTemplateSelect(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          {activeTemplate && editedTemplate ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Subject</h3>
                  <Input
                    value={editedTemplate.subject}
                    onChange={e => setEditedTemplate({
                      ...editedTemplate,
                      subject: e.target.value,
                    })}
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Template</h3>
                  <Textarea
                    value={editedTemplate.template}
                    onChange={e => setEditedTemplate({
                      ...editedTemplate,
                      template: e.target.value,
                    })}
                    placeholder="Email template content"
                    className="min-h-[200px]"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Available Variables</h3>
                  <div className="flex flex-wrap gap-2">
                    {editedTemplate.variables.map(variable => (
                      <code
                        key={variable}
                        className="px-2 py-1 bg-gray-100 rounded text-sm"
                      >
                        {`{{${variable}}}`}
                      </code>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                Select a template to edit
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
import { getFunctions, httpsCallable } from 'firebase/functions';
import { EmailSettings, EmailTemplate, TimeframeSettings, EmailStats } from '@/types/email';

export class EmailSettingsService {
  private functions = getFunctions();

  async listEmailAccounts(): Promise<EmailSettings[]> {
    const listAccounts = httpsCallable(this.functions, 'listEmailAccounts');
    const result = await listAccounts();
    return result.data as EmailSettings[];
  }

  async getEmailSettings(id: string): Promise<EmailSettings> {
    const getSettings = httpsCallable(this.functions, 'getEmailSettings');
    const result = await getSettings({ id });
    return result.data as EmailSettings;
  }

  async updateEmailSettings(id: string, settings: Partial<EmailSettings>): Promise<EmailSettings> {
    const updateSettings = httpsCallable(this.functions, 'updateEmailSettings');
    const result = await updateSettings({ id, settings });
    return result.data as EmailSettings;
  }

  async setDefaultEmailAccount(id: string): Promise<void> {
    const setDefault = httpsCallable(this.functions, 'setDefaultEmailAccount');
    await setDefault({ id });
  }

  async removeEmailAccount(id: string): Promise<void> {
    const removeAccount = httpsCallable(this.functions, 'removeEmailAccount');
    await removeAccount({ id });
  }

  async getGmailAuthUrl(): Promise<string> {
    const getAuthUrl = httpsCallable(this.functions, 'getGmailAuthUrl');
    const result = await getAuthUrl();
    return result.data as string;
  }

  async connectGmailAccount(code: string): Promise<EmailSettings> {
    const connectGmail = httpsCallable(this.functions, 'connectGmailAccount');
    const result = await connectGmail({ code });
    return result.data as EmailSettings;
  }

  async getEmailTemplates(): Promise<Record<string, EmailTemplate>> {
    const getTemplates = httpsCallable(this.functions, 'getEmailTemplates');
    const result = await getTemplates();
    return result.data as Record<string, EmailTemplate>;
  }

  async updateEmailTemplate(type: string, template: EmailTemplate): Promise<void> {
    const updateTemplate = httpsCallable(this.functions, 'updateEmailTemplate');
    await updateTemplate({ type, template });
  }

  async updateTimeframes(timeframes: TimeframeSettings): Promise<void> {
    const updateTimeframes = httpsCallable(this.functions, 'updateTimeframes');
    await updateTimeframes({ timeframes });
  }

  async getEmailStats(clientId?: string): Promise<EmailStats> {
    const getStats = httpsCallable(this.functions, 'getEmailStats');
    const result = await getStats({ clientId });
    return result.data as EmailStats;
  }
} 
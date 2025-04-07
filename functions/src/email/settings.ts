import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';
import { EmailSettings, EmailTemplate, TimeframeSettings, EmailStats } from '../types/email';

export class EmailSettingsService {
  private db = getFirestore();
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  async addEmailAccount(settings: Omit<EmailSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailSettings> {
    const docRef = this.db.collection('emailSettings').doc();
    const now = new Date();
    
    const newSettings: EmailSettings = {
      ...settings,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newSettings);
    return newSettings;
  }

  async connectGmailAccount(email: string, code: string): Promise<EmailSettings> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    const settings: Omit<EmailSettings, 'id' | 'createdAt' | 'updatedAt'> = {
      provider: 'gmail',
      email: profile.data.emailAddress!,
      name: profile.data.name || profile.data.emailAddress!,
      isDefault: false,
      customTimeframes: {
        reminder: 24,
        followup: 24,
        cancellationWindow: 24,
      },
      templates: {},
      credentials: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    };

    return this.addEmailAccount(settings);
  }

  async updateEmailSettings(id: string, settings: Partial<EmailSettings>): Promise<EmailSettings> {
    const docRef = this.db.collection('emailSettings').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Email settings not found');
    }

    const updatedSettings = {
      ...doc.data(),
      ...settings,
      updatedAt: new Date(),
    };

    await docRef.update(updatedSettings);
    return updatedSettings as EmailSettings;
  }

  async getEmailSettings(id: string): Promise<EmailSettings> {
    const doc = await this.db.collection('emailSettings').doc(id).get();
    
    if (!doc.exists) {
      throw new Error('Email settings not found');
    }

    return doc.data() as EmailSettings;
  }

  async listEmailAccounts(): Promise<EmailSettings[]> {
    const snapshot = await this.db.collection('emailSettings').get();
    return snapshot.docs.map(doc => doc.data() as EmailSettings);
  }

  async setDefaultEmailAccount(id: string): Promise<void> {
    const batch = this.db.batch();
    
    // Remove default from all accounts
    const snapshot = await this.db.collection('emailSettings')
      .where('isDefault', '==', true)
      .get();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });

    // Set new default
    batch.update(this.db.collection('emailSettings').doc(id), { isDefault: true });
    
    await batch.commit();
  }

  async removeEmailAccount(id: string): Promise<void> {
    const doc = await this.db.collection('emailSettings').doc(id).get();
    
    if (!doc.exists) {
      throw new Error('Email settings not found');
    }

    const settings = doc.data() as EmailSettings;
    if (settings.isDefault) {
      throw new Error('Cannot remove default email account');
    }

    await doc.ref.delete();
  }

  getGmailAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    });
  }

  async updateEmailTemplate(type: string, template: EmailTemplate): Promise<void> {
    const defaultAccount = await this.getDefaultEmailAccount();
    if (!defaultAccount) {
      throw new Error('No default email account found');
    }

    const templates = {
      ...defaultAccount.templates,
      [type]: template,
    };

    await this.updateEmailSettings(defaultAccount.id, { templates });
  }

  async updateTimeframes(timeframes: TimeframeSettings): Promise<void> {
    const defaultAccount = await this.getDefaultEmailAccount();
    if (!defaultAccount) {
      throw new Error('No default email account found');
    }

    await this.updateEmailSettings(defaultAccount.id, { customTimeframes: timeframes });
  }

  async getEmailStats(clientId?: string): Promise<EmailStats> {
    const query = this.db.collection('emailLogs');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let snapshot;
    if (clientId) {
      snapshot = await query
        .where('sentAt', '>=', thirtyDaysAgo)
        .where('clientId', '==', clientId)
        .get();
    } else {
      snapshot = await query
        .where('sentAt', '>=', thirtyDaysAgo)
        .get();
    }

    const stats: EmailStats = {
      totalSent: 0,
      responses: {
        accepted: 0,
        declined: 0,
        pending: 0,
      },
      averageResponseTime: 0,
      lastUpdated: now,
    };

    let totalResponseTime = 0;
    let responseCount = 0;

    snapshot.docs.forEach(doc => {
      const log = doc.data();
      stats.totalSent++;

      if (log.responseStatus) {
        stats.responses[log.responseStatus]++;
        if (log.responseTime) {
          totalResponseTime += log.responseTime;
          responseCount++;
        }
      }
    });

    if (responseCount > 0) {
      stats.averageResponseTime = totalResponseTime / responseCount;
    }

    return stats;
  }

  private async getDefaultEmailAccount(): Promise<EmailSettings | null> {
    const snapshot = await this.db.collection('emailSettings')
      .where('isDefault', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as EmailSettings;
  }
} 
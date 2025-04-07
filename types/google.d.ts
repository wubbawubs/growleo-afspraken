declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: {
              credential: string;
              select_by: string;
              g_csrf_token: string;
            }) => void;
          }) => void;
        };
        oauth2: {
          initTokenClient: (params: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token: string;
              expires_in: number;
              error?: string;
            }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    gapi: {
      load: (api: string, callback: () => void) => void;
      client?: {
        init: (params: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        calendar?: {
          events: {
            insert: (params: {
              calendarId: string;
              resource: any;
              sendUpdates: 'all' | 'externalOnly' | 'none';
            }) => Promise<{
              result: {
                id: string;
                summary: string;
                description: string;
                start: { dateTime: string };
                end: { dateTime: string };
                attendees: Array<{ email: string }>;
                status: string;
              };
            }>;
            update: (params: {
              calendarId: string;
              eventId: string;
              resource: any;
              sendUpdates: 'all' | 'externalOnly' | 'none';
            }) => Promise<{
              result: {
                id: string;
                summary: string;
                description: string;
                start: { dateTime: string };
                end: { dateTime: string };
                attendees: Array<{ email: string }>;
                status: string;
              };
            }>;
            delete: (params: {
              calendarId: string;
              eventId: string;
              sendUpdates: 'all' | 'externalOnly' | 'none';
            }) => Promise<void>;
            get: (params: {
              calendarId: string;
              eventId: string;
            }) => Promise<{
              result: {
                id: string;
                summary: string;
                description: string;
                start: { dateTime: string };
                end: { dateTime: string };
                attendees: Array<{ email: string }>;
                status: string;
              };
            }>;
          };
        };
      };
    };
  }
}

export {}; 
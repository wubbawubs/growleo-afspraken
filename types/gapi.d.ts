declare namespace gapi {
  namespace client {
    namespace calendar {
      interface Event {
        summary: string;
        description?: string;
        start: {
          dateTime: string;
          timeZone: string;
        };
        end: {
          dateTime: string;
          timeZone: string;
        };
        attendees?: Array<{ email: string }>;
        location?: string;
      }

      interface EventResponse {
        id: string;
        summary: string;
        description?: string;
        start: {
          dateTime: string;
          timeZone: string;
        };
        end: {
          dateTime: string;
          timeZone: string;
        };
        attendees?: Array<{ email: string }>;
        location?: string;
      }

      interface FreeBusyResponse {
        calendars: {
          primary: {
            busy: Array<{
              start: string;
              end: string;
            }>;
          };
        };
      }

      interface Events {
        insert(params: {
          calendarId: string;
          resource: Event;
          sendUpdates?: 'all' | 'externalOnly' | 'none';
        }): Promise<{ result: EventResponse }>;
        update(params: {
          calendarId: string;
          eventId: string;
          resource: Partial<Event>;
          sendUpdates?: 'all' | 'externalOnly' | 'none';
        }): Promise<{ result: EventResponse }>;
        delete(params: {
          calendarId: string;
          eventId: string;
          sendUpdates?: 'all' | 'externalOnly' | 'none';
        }): Promise<void>;
      }

      interface FreeBusy {
        query(params: {
          timeMin: string;
          timeMax: string;
          items: Array<{ id: string }>;
        }): Promise<{ result: FreeBusyResponse }>;
      }
    }
  }

  namespace auth2 {
    interface AuthInstance {
      signIn(): Promise<GoogleUser>;
      signOut(): Promise<void>;
    }

    interface GoogleUser {
      getAuthResponse(): {
        access_token: string;
        id_token: string;
      };
    }

    interface Auth2 {
      getAuthInstance(): AuthInstance;
    }
  }

  function load(api: string, callback: () => void): void;
  function init(params: {
    apiKey: string;
    clientId: string;
    discoveryDocs: string[];
    scope: string;
  }): Promise<void>;
  const calendar: {
    events: gapi.client.calendar.Events;
    freebusy: gapi.client.calendar.FreeBusy;
  };
  const auth2: gapi.auth2.Auth2;
} 
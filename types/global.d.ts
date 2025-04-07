interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    auth2: {
      init: (params: { client_id: string; scope: string }) => void;
      getAuthInstance: () => {
        signIn: () => Promise<{
          getAuthResponse: (includeAuthorizationData: boolean) => {
            access_token: string;
            id_token: string;
            scope: string;
            expires_in: number;
            first_issued_at: number;
            expires_at: number;
          };
        }>;
      };
    };
  };
} 
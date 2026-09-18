export type AuthenticatedUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

export type AuthenticationContext = {
  sessionId: string;
  user: AuthenticatedUser;
};

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  authentication?: AuthenticationContext;
};

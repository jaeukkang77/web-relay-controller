export interface TokenPair {
  accessToken:  string;
  refreshToken: string;
}

export interface LoginResult extends TokenPair {
  user: {
    id:       string;
    role:     string;
    regionId: number | null;
  };
}

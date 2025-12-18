export type MeResponse = {
  user: { id: string; name: string; email: string };
  onboardingCompleted: boolean;
};

export type DashboardResponse = {
  sections: {
    news: Array<{
      itemId: string;
      title: string;
      url: string;
      source: string | null;
      publishedAt: string;
      myVote: 1 | -1 | null;
    }>;
    prices: Array<{
      itemId: string;
      coinId: string;
      usd: number | null;
      myVote: 1 | -1 | null;
    }>;
    insight: null | {
      itemId: string;
      text: string;
      myVote: 1 | -1 | null;
    };
    meme: null | {
      itemId: string;
      title: string;
      imageUrl: string;
      myVote: 1 | -1 | null;
    };
  };
};

export type PreferencesResponse = {
  assets: string[];        // e.g. ["bitcoin","ethereum"]
  investorType: string;    // e.g. "HODLer"
  contentTypes: string[];  // e.g. ["news","social"]
};

export type SaveOnboardingPayload = PreferencesResponse;

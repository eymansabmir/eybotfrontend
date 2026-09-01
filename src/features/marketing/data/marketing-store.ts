import { create } from "zustand";
import { MOCK_EMAIL_CAMPAIGNS } from "./email-campaigns.mock";
import { MOCK_SMS_CAMPAIGNS } from "./sms-campaigns.mock";
import { MOCK_SOCIAL_CAMPAIGNS } from "./social-campaigns.mock";
import type { EmailCampaign, SmsCampaign, SocialCampaign } from "../types";
import type { ListenQuery } from "./listen-queries.mock";
import { MOCK_LISTEN_QUERIES } from "./listen-queries.mock";

interface MarketingStore {
  sms: SmsCampaign[];
  emails: EmailCampaign[];
  social: SocialCampaign[];
  listenQueries: ListenQuery[];
  addSms: (campaign: SmsCampaign) => void;
  addEmail: (campaign: EmailCampaign) => void;
  addSocial: (campaign: SocialCampaign) => void;
  addListenQuery: (query: ListenQuery) => void;
}

export const useMarketingStore = create<MarketingStore>((set) => ({
  sms: MOCK_SMS_CAMPAIGNS,
  emails: MOCK_EMAIL_CAMPAIGNS,
  social: MOCK_SOCIAL_CAMPAIGNS,
  listenQueries: MOCK_LISTEN_QUERIES,
  addSms: (campaign) => set((state) => ({ sms: [campaign, ...state.sms] })),
  addEmail: (campaign) => set((state) => ({ emails: [campaign, ...state.emails] })),
  addSocial: (campaign) => set((state) => ({ social: [campaign, ...state.social] })),
  addListenQuery: (query) => set((state) => ({ listenQueries: [query, ...state.listenQueries] })),
}));

import { create } from "zustand";
import { MOCK_EMAIL_CAMPAIGNS } from "./email-campaigns.mock";
import { MOCK_SMS_CAMPAIGNS } from "./sms-campaigns.mock";
import { MOCK_SOCIAL_CAMPAIGNS } from "./social-campaigns.mock";
import type { CampaignStatus, EmailCampaign, SmsCampaign, SocialCampaign } from "../types";
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
  setSmsStatus: (id: string, status: CampaignStatus) => void;
  setEmailStatus: (id: string, status: CampaignStatus) => void;
  setSocialStatus: (id: string, status: CampaignStatus) => void;
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
  setSmsStatus: (id, status) =>
    set((state) => ({ sms: state.sms.map((c) => (c.id === id ? { ...c, status } : c)) })),
  setEmailStatus: (id, status) =>
    set((state) => ({ emails: state.emails.map((c) => (c.id === id ? { ...c, status } : c)) })),
  setSocialStatus: (id, status) =>
    set((state) => ({ social: state.social.map((c) => (c.id === id ? { ...c, status } : c)) })),
}));

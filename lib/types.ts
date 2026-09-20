export type ContributorType = "retired_professional" | "student";
export type ContributorStatus = "pending" | "approved" | "rejected";

export interface Contributor {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  contributor_type: ContributorType;
  background: string | null;
  status: ContributorStatus;
  rejection_reason: string | null;
  created_at: string;
  approved_at: string | null;
}

export type ReferralStatus =
  | "submitted"
  | "nda_pending"
  | "nda_signed"
  | "call_proposed"
  | "call_scheduled"
  | "completed"
  | "rejected"
  | "cancelled";

export interface Referral {
  id: string;
  contributor_id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  opportunity_description: string;
  estimated_value: string | null;
  status: ReferralStatus;
  commission_notes: string | null;
  nda_token: string;
  created_at: string;
}

export type NdaParty = "contributor" | "business_owner";

export interface NdaSignature {
  id: string;
  referral_id: string;
  party: NdaParty;
  signer_name: string;
  signer_email: string;
  agreed: boolean;
  signed_at: string;
}

export type CallProposalStatus = "proposed" | "confirmed" | "completed" | "cancelled";

export interface CallProposal {
  id: string;
  referral_id: string;
  proposed_slots: string[];
  confirmed_slot: string | null;
  status: CallProposalStatus;
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export const NDA_TEXT = `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into between the Contributor and the Business Owner named on this referral, facilitated by Rainmaker Business Outsourcing Group ("RainmakerBOG").

1. Purpose. The parties wish to explore a potential outsourcing/business relationship introduced via RainmakerBOG and may disclose confidential business, financial, and operational information to one another for that purpose.

2. Confidentiality. Each party agrees to hold the other's confidential information in strict confidence, to use it solely to evaluate the proposed opportunity, and not to disclose it to any third party without prior written consent.

3. Term. This Agreement remains in effect for two (2) years from the date of the last signature below, and confidentiality obligations survive termination of any business relationship.

4. No Circumvention. Neither party will attempt to bypass RainmakerBOG or the introducing Contributor to complete a transaction directly arising from this introduction without honoring any applicable commission arrangement.

5. Governing Law. This Agreement is governed by the laws of India.

By typing your full legal name below and checking "I agree," you are electronically signing this Agreement, which is legally binding to the same extent as a handwritten signature.`;

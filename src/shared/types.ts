/**
 * Types partagés pour l'intégration Stripe + Dataverse
 */

export interface StripeWebhookPayload {
  id: string;
  type: string;
  created: number;
  data: {
    object: any;
  };
}

export interface DataverseSubscription {
  "{DATAVERSE_PREFIX}subscriptionid": string;
  "{DATAVERSE_PREFIX}name": string;
  "{DATAVERSE_PREFIX}stripesubscriptionid": string;
  "{DATAVERSE_PREFIX}status": string;
  "{DATAVERSE_PREFIX}stripecustomerid": string;
  "{DATAVERSE_PREFIX}currentperiodend": string;
}

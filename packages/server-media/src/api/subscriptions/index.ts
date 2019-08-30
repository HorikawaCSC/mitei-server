import { SubscriptionResolvers } from '../../generated/graphql';
import { viewerSubscriptionResolvers } from './viewer';

export const subscriptionResolvers: SubscriptionResolvers = {
  ...viewerSubscriptionResolvers,
};

import Subscription from './Subscription.jsx';

/**
 * Checkout — selve IAP-betalingssiden.
 * Viser samme abonnements-UI som /Subscription, men her udfører
 * "Abonner"-knappen det faktiske RevenueCat IAP-køb (native) eller
 * Stripe checkout (web).
 */
export default function Checkout() {
  return <Subscription />;
}
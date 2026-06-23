import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Checkout — redirecter til /Subscription som håndterer både
 * native In-App Purchase (RevenueCat) og web Stripe checkout.
 */
export default function Checkout() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/Subscription', { replace: true });
  }, [navigate]);
  return null;
}
import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type CustomerToolLink = {
  label: string;
  icon: IoniconName;
  href: string;
};

/** Quick-access tools shown in the customer footer bar. */
export const CUSTOMER_FOOTER_TOOLS: CustomerToolLink[] = [
  { label: 'EMI', icon: 'calculator-outline', href: '/(customer)/emi-calculator' },
  { label: 'Eligibility', icon: 'shield-checkmark-outline', href: '/(customer)/eligibility' },
  { label: 'Compare', icon: 'git-compare-outline', href: '/(customer)/product-comparison' },
  { label: 'About', icon: 'information-circle-outline', href: '/(customer)/about' },
  { label: 'Contact', icon: 'mail-outline', href: '/(customer)/contact' },
];

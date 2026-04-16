export type CreditBundle = {
  id: string;
  credits: number;
  priceLabel: string;
  priceInCents: number;
  popular?: boolean;
};

export const creditBundles: CreditBundle[] = [
  {
    id: "create",
    credits: 3000,
    priceLabel: "$99",
    priceInCents: 9900,
    popular: false,
  },
  {
    id: "build",
    credits: 7000,
    priceLabel: "$199",
    priceInCents: 19900,
    popular: true,
  },
  {
    id: "launch",
    credits: 15000,
    priceLabel: "$399",
    priceInCents: 39900,
    popular: false,
  },
];

export function getCreditBundleByCredits(credits: number) {
  return creditBundles.find((bundle) => bundle.credits === credits) ?? null;
}

export function getStripePriceIdByCredits(credits: number) {
  switch (credits) {
    case 3000:
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3000?.trim() ?? null;
    case 7000:
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_7000?.trim() ?? null;
    case 15000:
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_15000?.trim() ?? null;
    default:
      return null;
  }
}

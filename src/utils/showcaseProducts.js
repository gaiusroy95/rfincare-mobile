import {
  MARKETPLACE_SHOWCASE_PRODUCTS,
  COMPARE_SHOWCASE_PRODUCT,
} from '../constants/marketplaceShowcaseProducts';

const DEFAULT_VISIBILITY = {
  bankMarketplace: true,
  creditCardMarketplace: true,
  insuranceMarketplace: true,
  mutualFundMarketplace: true,
  postOfficeMarketplace: true,
  governmentSchemesMarketplace: true,
  investmentMarketplace: true,
};

export function filterMarketplaceShowcase(visibility = DEFAULT_VISIBILITY) {
  const vis = { ...DEFAULT_VISIBILITY, ...visibility };
  return MARKETPLACE_SHOWCASE_PRODUCTS.filter((item) => {
    if (!item.visibilityKey) return true;
    return vis[item.visibilityKey] !== false;
  });
}

export function buildHomepageShowcaseProducts(loanProducts, visibility, { includeCompareCard = true } = {}) {
  const loans = Array.isArray(loanProducts) ? loanProducts : [];
  const marketplaces = filterMarketplaceShowcase(visibility);
  const extras = includeCompareCard ? [COMPARE_SHOWCASE_PRODUCT] : [];
  return [...loans, ...marketplaces, ...extras];
}

export function filterMarketplaceCatalog(visibility = DEFAULT_VISIBILITY) {
  return filterMarketplaceShowcase(visibility).map((p) => ({
    slug: p.slug,
    apiKey: p.apiKey,
    label: p.label,
    name: p.label,
    description: p.description,
    icon: p.icon,
    color: p.color,
    interestRange: p.interestRange,
    features: p.features,
    kind: 'marketplace',
    route: p.route,
  }));
}

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const OCCUPATION_OPTIONS = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
];

export const INCOME_RANGE_OPTIONS = [
  { value: '25_lac_plus', label: '25 Lac +' },
  { value: '15_to_24_9_lac', label: '15 Lac to 24.9 Lac' },
  { value: '10_to_14_9_lac', label: '10 Lac to 14.9 Lac' },
  { value: '8_to_9_9_lac', label: '8 Lac to 9.9 Lac' },
  { value: '5_to_7_9_lac', label: '5 Lac to 7.9 Lac' },
  { value: '3_to_4_9_lac', label: '3 Lac to 4.9 Lac' },
  { value: '2_to_2_9_lac', label: '2 Lac to 2.9 Lac' },
  { value: 'below_2_lac', label: 'Less than 2 Lac' },
];

export const EDUCATION_OPTIONS = [
  { value: 'post_graduation', label: 'Post Graduation' },
  { value: 'graduation', label: 'Graduation' },
  { value: '12th', label: '12th' },
  { value: '10th_and_below', label: '10th and Below' },
];

export const HABIT_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'occasionally', label: 'Occasionally' },
];

export const YES_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

export type MarketplaceProductItem = {
  slug: string;
  label: string;
  icon: string;
  badge?: string | null;
  badgeTone?: 'default' | 'warning';
  segment?: string;
};

export const INSURANCE_PRODUCT_GRID: MarketplaceProductItem[] = [
  { slug: 'term_insurance', label: 'Term Life Insurance', icon: 'shield-checkmark', badge: 'Upto 15% Discount', segment: 'life' },
  { slug: 'individual', label: 'Health Insurance', icon: 'heart', badge: 'Lowest Price Guarantee', segment: 'health' },
  { slug: 'ulip', label: 'Investment Plans', icon: 'trending-up', badge: 'In-Built Life Cover', segment: 'life' },
  { slug: 'car_insurance', label: 'Car Insurance', icon: 'car', badge: 'Lowest Price Guarantee', segment: 'motor' },
  { slug: 'bike_insurance', label: '2 Wheeler Insurance', icon: 'bicycle', badge: 'Upto 85% Discount', segment: 'motor' },
  { slug: 'family_floater', label: 'Family Health Insurance', icon: 'people', badge: 'Upto 25% Discount', segment: 'health' },
  { slug: 'personal_accident', label: 'Travel Insurance', icon: 'airplane', segment: 'health' },
  { slug: 'endowment', label: 'Return of Premium Plans', icon: 'cash', segment: 'life' },
  { slug: 'guaranteed_income_plans', label: 'Guaranteed Return Plans', icon: 'wallet', badge: 'Upto 7.4% Returns', segment: 'life' },
  { slug: 'child_plans', label: 'Child Savings Plans', icon: 'happy', badge: 'Premium Waiver', badgeTone: 'warning', segment: 'life' },
  { slug: 'retirement_plans', label: 'Retirement Plans', icon: 'sunny', segment: 'life' },
  { slug: 'individual', label: 'Home Insurance', icon: 'home', badge: 'Upto 25% Discount', segment: 'health' },
];

export const MUTUAL_FUND_PRODUCT_GRID: MarketplaceProductItem[] = [
  { slug: 'sip', label: 'SIP Plans', icon: 'calendar', badge: 'From ₹500/mo' },
  { slug: 'elss', label: 'ELSS Tax Saver', icon: 'receipt', badge: '₹1.5L deduction' },
  { slug: 'large_cap', label: 'Large Cap Funds', icon: 'business', badge: 'Stable growth' },
  { slug: 'mid_cap', label: 'Mid Cap Funds', icon: 'trending-up', badge: 'High growth' },
  { slug: 'small_cap', label: 'Small Cap Funds', icon: 'rocket', badge: 'Aggressive' },
  { slug: 'debt_funds', label: 'Debt Funds', icon: 'library', badge: 'Low risk' },
  { slug: 'hybrid_funds', label: 'Hybrid Funds', icon: 'git-merge', badge: 'Balanced' },
  { slug: 'index_funds', label: 'Index Funds', icon: 'stats-chart', badge: 'Low TER' },
  { slug: 'etf', label: 'ETF', icon: 'pulse', badge: 'Exchange traded' },
  { slug: 'international_funds', label: 'International', icon: 'globe', badge: 'Global exposure' },
  { slug: 'liquid_funds', label: 'Liquid Funds', icon: 'water', badge: 'Instant liquidity' },
  { slug: 'lumpsum', label: 'Lumpsum Investment', icon: 'cash', badge: 'One-time' },
];

export const FIXED_INCOME_PRODUCT_GRID: MarketplaceProductItem[] = [
  { slug: 'fixed_deposits', label: 'Fixed Deposits', icon: 'library', badge: 'Stable returns' },
  { slug: 'corporate_fd', label: 'Corporate FD', icon: 'business', badge: 'Higher yields' },
  { slug: 'nbfc_fd', label: 'NBFC FD', icon: 'briefcase', badge: 'Flexible tenures' },
  { slug: 'senior_citizen_fd', label: 'Senior Citizen FD', icon: 'heart', badge: 'Extra interest' },
  { slug: 'tax_saving_fd', label: 'Tax Saving FD', icon: 'receipt', badge: '80C benefit' },
  { slug: 'recurring_deposit', label: 'Recurring Deposit', icon: 'repeat', badge: 'Monthly saving' },
];

export const POST_OFFICE_PRODUCT_GRID: MarketplaceProductItem[] = [
  { slug: 'ppf', label: 'PPF', icon: 'wallet', badge: '80C benefit' },
  { slug: 'nsc', label: 'NSC', icon: 'document-text', badge: 'Tax saving' },
  { slug: 'kvp', label: 'KVP', icon: 'trending-up', badge: 'Doubles in tenure' },
  { slug: 'sukanya_samriddhi', label: 'Sukanya Samriddhi', icon: 'heart', badge: 'Girl child' },
  { slug: 'senior_citizen_savings', label: 'SCSS', icon: 'people', badge: 'Senior citizens' },
  { slug: 'monthly_income_scheme', label: 'MIS', icon: 'calendar', badge: 'Monthly income' },
  { slug: 'time_deposit', label: 'TD', icon: 'time', badge: 'Fixed tenure' },
  { slug: 'recurring_deposit', label: 'RD', icon: 'repeat', badge: 'Monthly saving' },
];

export const GOVERNMENT_SCHEME_PRODUCT_GRID: MarketplaceProductItem[] = [
  { slug: 'pm_mudra', label: 'PM Mudra', icon: 'briefcase', badge: 'MSME loans' },
  { slug: 'pmegp', label: 'PMEGP', icon: 'business', badge: 'Entrepreneurship' },
  { slug: 'stand_up_india', label: 'Stand-Up India', icon: 'people', badge: 'SC/ST & women' },
  { slug: 'startup_india', label: 'Startup India', icon: 'rocket', badge: 'Startups' },
  { slug: 'atal_pension_yojana', label: 'Atal Pension Yojana', icon: 'heart', badge: 'Pension' },
  { slug: 'nps', label: 'NPS', icon: 'library', badge: 'Retirement' },
  { slug: 'pmjjby', label: 'PMJJBY', icon: 'shield', badge: 'Life cover' },
  { slug: 'pmsby', label: 'PMSBY', icon: 'umbrella', badge: 'Accident cover' },
  { slug: 'ayushman_bharat', label: 'Ayushman Bharat', icon: 'medkit', badge: 'Health cover' },
  { slug: 'solar_subsidy', label: 'Solar Subsidy', icon: 'sunny', badge: 'Green energy' },
  { slug: 'msme_subsidies', label: 'MSME Subsidies', icon: 'business', badge: 'Business aid' },
  { slug: 'agriculture_subsidies', label: 'Agriculture Subsidies', icon: 'leaf', badge: 'Farmers' },
];

export const INVESTMENT_PRODUCT_GRID: MarketplaceProductItem[] = [
  { slug: 'sovereign_gold_bonds', label: 'Sovereign Gold Bonds', icon: 'diamond', badge: 'Govt backed' },
  { slug: 'digital_gold', label: 'Digital Gold', icon: 'cash', badge: 'Buy online' },
  { slug: 'gold_etf', label: 'Gold ETF', icon: 'bar-chart', badge: 'Exchange traded' },
  { slug: 'silver_etf', label: 'Silver ETF', icon: 'stats-chart', badge: 'Precious metals' },
  { slug: 'bonds', label: 'Bonds', icon: 'document-text', badge: 'Fixed income' },
  { slug: 'rbi_floating_bonds', label: 'RBI Floating Bonds', icon: 'library', badge: 'Floating rate' },
  { slug: 'government_securities', label: 'Government Securities', icon: 'business', badge: 'Sovereign' },
  { slug: 'treasury_bills', label: 'Treasury Bills', icon: 'receipt', badge: 'Short term' },
  { slug: 'corporate_bonds', label: 'Corporate Bonds', icon: 'briefcase', badge: 'Higher yield' },
  { slug: 'reit', label: 'REIT', icon: 'home', badge: 'Real estate' },
  { slug: 'invit', label: 'InvIT', icon: 'git-network', badge: 'Infrastructure' },
];

/**
 * Standard reducing-balance monthly EMI.
 * @param {number} principal - Loan amount (₹)
 * @param {number} annualRatePercent - Annual interest rate (%)
 * @param {number} tenureMonths - Loan tenure in months
 */
export function calculateEmi(principal, annualRatePercent, tenureMonths) {
  const p = Number(principal);
  const months = Number(tenureMonths);
  const annualRate = Number(annualRatePercent);

  if (!p || p <= 0 || !months || months <= 0) {
    return null;
  }

  if (!annualRate || annualRate <= 0) {
    const emi = p / months;
    return {
      emi: Math.round(emi),
      totalPayment: Math.round(emi * months),
      totalInterest: 0,
      principal: p,
      tenureMonths: months,
      annualRatePercent: 0,
    };
  }

  const r = annualRate / 12 / 100;
  const factor = Math.pow(1 + r, months);
  const emi = (p * r * factor) / (factor - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - p;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: p,
    tenureMonths: months,
    annualRatePercent: annualRate,
  };
}

/**
 * Month-by-month reducing-balance amortization schedule.
 * @returns {Array<{ month: number, emi: number, principal: number, interest: number, balance: number }>}
 */
export function buildRepaymentSchedule(principal, annualRatePercent, tenureMonths) {
  const summary = calculateEmi(principal, annualRatePercent, tenureMonths);
  if (!summary) return [];

  const p = summary.principal;
  const months = summary.tenureMonths;
  const emi = summary.emi;
  const monthlyRate = summary.annualRatePercent > 0 ? summary.annualRatePercent / 12 / 100 : 0;

  const schedule = [];
  let balance = p;

  for (let month = 1; month <= months; month += 1) {
    const interest = monthlyRate > 0 ? Math.round(balance * monthlyRate) : 0;
    let principalPart = emi - interest;
    if (month === months) {
      principalPart = Math.round(balance);
    }
    balance = Math.max(0, Math.round(balance - principalPart));
    schedule.push({
      month,
      emi: month === months ? principalPart + interest : emi,
      principal: principalPart,
      interest,
      balance,
    });
  }

  return schedule;
}

export function formatInr(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

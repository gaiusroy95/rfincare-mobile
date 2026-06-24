import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
// @ts-expect-error JS module
import { LOAN_PRODUCTS as STATIC_LOAN_PRODUCTS, setLoanProductRegistry } from '@/src/constants/loanProducts';
// @ts-expect-error JS module
import { loanProductCatalogService } from '@/src/services/loanProductCatalogService';

const LoanProductsContext = createContext({
  products: STATIC_LOAN_PRODUCTS,
  loading: true,
  refresh: async () => {},
});

export function LoanProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState(STATIC_LOAN_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await loanProductCatalogService.listPublic();
    if (!error && Array.isArray(data) && data.length) {
      setProducts(data);
      setLoanProductRegistry(data);
    } else {
      setProducts(STATIC_LOAN_PRODUCTS);
      setLoanProductRegistry(STATIC_LOAN_PRODUCTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(refresh, 50);
    return () => clearTimeout(t);
  }, [refresh]);

  return (
    <LoanProductsContext.Provider value={{ products, loading, refresh }}>
      {children}
    </LoanProductsContext.Provider>
  );
}

export function useLoanProducts() {
  return useContext(LoanProductsContext);
}

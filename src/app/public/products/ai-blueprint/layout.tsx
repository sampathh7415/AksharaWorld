/**
 * AI Blueprint product route layout
 * Injects JSON-LD structured data into <head> for Google Shopping
 */

import { ProductStructuredData, metadata as productMetadata } from './structured-data';
export { productMetadata as metadata };

export default function AIBlueprintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProductStructuredData />
      {children}
    </>
  );
}

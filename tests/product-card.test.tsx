import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/products/product-card';
import { CartProvider } from '@/components/providers/cart-provider';
import type { Product } from '@/lib/domain/types';
import { ServiceType, CylinderSize } from '@/lib/domain/types';

const mockProduct: Product = {
  id: 'test-product-1',
  name: 'Gas Cylinder 9kg',
  slug: 'gas-cylinder-9kg',
  description: 'Standard 9kg LPG gas cylinder',
  price: 349,
  salePrice: null,
  cylinderSize: CylinderSize.KG9,
  serviceType: ServiceType.REFILL,
  imageUrl: null,
  active: true,
};

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe('ProductCard', () => {
  it('renders product name', () => {
    renderWithCart(<ProductCard product={mockProduct} currency="ZAR" />);
    expect(screen.getByText('Gas Cylinder 9kg')).toBeInTheDocument();
  });

  it('renders price', () => {
    renderWithCart(<ProductCard product={mockProduct} currency="ZAR" />);
    expect(screen.getByText(/349/)).toBeInTheDocument();
  });

  it('shows sale badge when on sale', () => {
    const saleProduct = { ...mockProduct, price: 399, salePrice: 349 };
    renderWithCart(<ProductCard product={saleProduct} currency="ZAR" />);
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('shows unavailable button when product is inactive', () => {
    const inactiveProduct = { ...mockProduct, active: false };
    renderWithCart(<ProductCard product={inactiveProduct} currency="ZAR" />);
    expect(screen.getByText('Currently unavailable')).toBeDisabled();
  });

  it('links to product detail page', () => {
    renderWithCart(<ProductCard product={mockProduct} currency="ZAR" />);
    const links = screen.getAllByRole('link');
    const productLink = links.find((l) => l.getAttribute('href')?.includes('/products/gas-cylinder-9kg'));
    expect(productLink).toBeTruthy();
  });
});

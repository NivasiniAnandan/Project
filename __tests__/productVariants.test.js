import {
  getAvailablePackSizes,
  getCategoryPackSizes,
  normalizeProduct,
  productForVariant
} from '../src/lib/productVariants';

test('returns pack-size options for category ids and aliases', () => {
  expect(getCategoryPackSizes('edible-oils')).toEqual(['500 ml', '1 L', '2 L', '5 L', '10 L', '15 L']);
  expect(getCategoryPackSizes('masala-items')).toEqual(['50 g', '100 g', '150 g', '200 g', '250 g', '500 g', '1 kg']);
  expect(getCategoryPackSizes('herbal-powders')).toContain('1 kg');
  expect(getCategoryPackSizes('millet-rice', 'Groceries')).toEqual(['100 g', '250 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg']);
});

test('normalizes legacy products into one pack-size variant', () => {
  expect(normalizeProduct({ unit: '1L', price: 280, stock: 39 }).variants).toEqual([
    { packSize: '1 L', price: 280, stock: 39, wholesalePrice: null, wholesaleMinimumQuantity: 1 }
  ]);
});

test('returns matching variant pricing and includes category custom sizes', () => {
  const product = {
    categoryId: 'edible-oils',
    packSize: '1 L',
    variants: [
      { packSize: '1 L', price: 280, stock: 39, wholesalePrice: 260 },
      { packSize: 'custom 3 L', price: 790, stock: 10 }
    ]
  };

  expect(productForVariant(product, 'custom 3 L').price).toBe(790);
  expect(getAvailablePackSizes('edible-oils', '', [product])).toContain('custom 3 L');
});
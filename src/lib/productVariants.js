export const categoryPackSizes = {
  'edible-oils': ['500 ml', '1 L', '2 L', '5 L', '10 L', '15 L'],
  'masala-items': ['50 g', '100 g', '150 g', '200 g', '250 g', '500 g', '1 kg'],
  'rice-varieties': ['1 kg', '2 kg', '5 kg', '10 kg', '25 kg', '50 kg'],
  'health-mix-products': ['100 g', '200 g', '250 g', '500 g', '1 kg'],
  'herbal-products': ['50 g', '100 g', '150 g', '200 g', '250 g', '500 g', '1 kg'],
  flours: ['500 g', '1 kg', '2 kg', '5 kg', '10 kg', '25 kg'],
  millets: ['500 g', '1 kg', '2 kg', '5 kg', '10 kg', '25 kg'],
  groceries: ['100 g', '250 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg']
};

const categoryAliases = {
  oils: 'edible-oils',
  'herbal-powders': 'herbal-products',
  'seekakai-powder': 'herbal-products',
  'biriyani-powder-mixes': 'masala-items',
  'malt-powder': 'health-mix-products',
  'millet-rice': 'millets',
  'brown-sugar': 'groceries',
  groundnuts: 'groceries'
};

function categoryKey(categoryId, categoryName = '') {
  const idValue = String(categoryId || '').toLowerCase().trim().replaceAll(' ', '-');
  const nameValue = String(categoryName || '').toLowerCase().trim().replaceAll(' ', '-');
  if (idValue === 'millet-rice' && nameValue === 'groceries') return 'groceries';
  const value = idValue || nameValue;
  return categoryAliases[value] || value;
}

export function getCategoryPackSizes(categoryId, categoryName = '') {
  return categoryPackSizes[categoryKey(categoryId, categoryName)] || [];
}

export function normalizePackSize(value, categoryId, categoryName = '') {
  const packSize = String(value || '').trim();
  const match = packSize.match(/^\s*(\d+(?:\.\d+)?)\s*(ml|millilit(?:er|re)s?|l|lit(?:er|re)s?|g|gm|grams?|kg|kilograms?)(?:\b|$)/i);
  if (!match) return packSize;

  const quantity = Number(match[1]).toString();
  const unit = match[2].toLowerCase();
  const normalizedUnit = unit === 'ml' || unit.startsWith('milliliter') || unit.startsWith('millilitre')
    ? 'ml'
    : unit === 'l' || unit.startsWith('lit')
      ? 'L'
      : unit === 'kg' || unit.startsWith('kilogram')
        ? 'kg'
        : 'g';
  const normalized = `${quantity} ${normalizedUnit}`;
  return getCategoryPackSizes(categoryId, categoryName).find((option) => option.toLowerCase() === normalized.toLowerCase()) || normalized;
}

export function normalizeProduct(product) {
  const variants = Array.isArray(product.variants) && product.variants.length
    ? product.variants
        .filter((variant) => variant.packSize)
        .map((variant) => ({
          packSize: normalizePackSize(variant.packSize, product.categoryId),
          price: Number(variant.price ?? product.price ?? 0),
          stock: Number(variant.stock ?? product.stock ?? 0),
          wholesalePrice: variant.wholesalePrice === '' || variant.wholesalePrice == null
            ? null
            : Number(variant.wholesalePrice),
          wholesaleMinimumQuantity: Math.max(1, Number(variant.wholesaleMinimumQuantity) || 1)
        }))
    : [];
  const normalizedVariants = variants.length ? variants : [{
        packSize: normalizePackSize(product.packSize || product.unit, product.categoryId),
        price: Number(product.price || 0),
        stock: Number(product.stock || 0),
        wholesalePrice: product.wholesalePrice == null ? null : Number(product.wholesalePrice),
        wholesaleMinimumQuantity: Math.max(1, Number(product.wholesaleMinimumQuantity) || 1)
      }].filter((variant) => variant.packSize);

  const activeVariant = normalizedVariants.find((variant) => variant.packSize === product.packSize) || normalizedVariants[0];
  if (!activeVariant) return { ...product, variants: [] };

  return {
    ...product,
    variants: normalizedVariants,
    packSize: activeVariant.packSize,
    price: activeVariant.price,
    stock: activeVariant.stock,
    unit: activeVariant.packSize
  };
}

export function getAvailablePackSizes(categoryId, categoryName = '', products = []) {
  const sizes = [...getCategoryPackSizes(categoryId, categoryName)];
  for (const product of products) {
    if (product.categoryId !== categoryId && categoryKey(product.categoryId) !== categoryKey(categoryId, categoryName)) continue;
    for (const variant of normalizeProduct(product).variants) {
      if (variant.packSize && !sizes.includes(variant.packSize)) sizes.push(variant.packSize);
    }
  }
  return sizes;
}

export function productForVariant(product, packSize) {
  const normalizedProduct = normalizeProduct(product);
  const variant = normalizedProduct.variants.find((item) => item.packSize === packSize);
  return variant ? { ...normalizedProduct, ...variant, variants: normalizedProduct.variants } : normalizedProduct;
}
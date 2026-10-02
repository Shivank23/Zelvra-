/**
 * Luxury Jewelry Image Resolver Utility
 * Maps categories or jewelry names to stunning, high-resolution Unsplash stock photos 
 * for products that do not have active or valid image URLs.
 */

// Premium curated jewelry images from Unsplash
const JEWELRY_STOCKS = {
  rings: [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80&sig=luxury-silver-ring-1',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80&sig=simulated-diamond-ring-2',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80&sig=bridal-diamond-ring-3'
  ],
  bracelets: [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80&sig=sterling-silver-bracelet-1',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80&sig=minimalist-bangle-2',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80&sig=chain-silver-bangle-3'
  ],
  anklets: [
    'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=800&auto=format&fit=crop&q=80&sig=delicate-anklet-1',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80&sig=sparkling-bead-anklet-2',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80&sig=anklet-silver-chain-3'
  ],
  earrings: [
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80&sig=elegant-pearl-studs-1',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80&sig=gold-silver-earrings-2',
    'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80&sig=silver-hoops-earrings-3'
  ],
  necklaces: [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80&sig=aesthetic-pendant-necklace-1',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80&sig=silver-necklace-set-2',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80&sig=pearl-pendant-3'
  ],
  sets: [
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80&sig=luxury-gift-box-sets-1',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80&sig=delicate-bridal-pairing-2'
  ],
  default: [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80&sig=breathtaking-jewel-general-1',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80&sig=breathtaking-jewel-general-2'
  ]
};

/**
 * Validates whether string is a robust, live URL.
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  // If it's a dummy Unsplash link that was copied from a placeholder
  if (trimmed.includes('photo-xxxxxxxxxxxx') || trimmed.includes('unsplash.com/photo-xxxx')) {
    return false;
  }
  return true;
}

/**
 * Resolves a reliable, high-resolution aesthetic jewelry Unsplash image 
 * based on product category, product name keywords, or local fallback.
 */
export function resolveJewelryImage(
  imageStr: string | undefined | null,
  category: string | undefined | null,
  name: string | undefined | null
): string {
  // If we already have a fully valid live image URL, return it directly
  if (isValidUrl(imageStr)) {
    return imageStr!.trim();
  }

  // Normalize inputs for pattern scanning
  const termName = (name || '').toLowerCase();
  const termCat = (category || '').toLowerCase();

  // 1. Scan name keywords to determine optimal jewelry style
  if (termName.includes('necklace') || termName.includes('pendant') || termName.includes('chain')) {
    if (termName.includes('earring') || termName.includes('set')) {
      return JEWELRY_STOCKS.sets[0];
    }
    return JEWELRY_STOCKS.necklaces[0];
  }
  if (termName.includes('ring') || termName.includes('solitaire') || termName.includes('band')) {
    return JEWELRY_STOCKS.rings[0];
  }
  if (termName.includes('bangle') || termName.includes('bracelet') || termName.includes('cuff') || termName.includes('kada')) {
    if (termName.includes('interlocking') && termName.includes('triple')) {
      // Return beautiful stacked minimal bangles
      return JEWELRY_STOCKS.bracelets[1];
    }
    return JEWELRY_STOCKS.bracelets[0];
  }
  if (termName.includes('anklet') || termName.includes('payal') || termName.includes('ankle')) {
    return JEWELRY_STOCKS.anklets[0];
  }
  if (termName.includes('earring') || termName.includes('stud') || termName.includes('jhumka') || termName.includes('hoop')) {
    return JEWELRY_STOCKS.earrings[0];
  }

  // 2. Scan category directly
  if (termCat === 'rings') {
    return JEWELRY_STOCKS.rings[0];
  }
  if (termCat === 'bracelets') {
    return JEWELRY_STOCKS.bracelets[0];
  }
  if (termCat === 'anklets') {
    return JEWELRY_STOCKS.anklets[0];
  }
  if (termCat === 'earrings') {
    return JEWELRY_STOCKS.earrings[0];
  }
  if (termCat === 'necklaces') {
    return JEWELRY_STOCKS.necklaces[0];
  }
  if (termCat.includes('set') || termCat.includes('necklace-and-earring')) {
    return JEWELRY_STOCKS.sets[0];
  }

  // 3. Fallback signature stock image
  return JEWELRY_STOCKS.default[0];
}

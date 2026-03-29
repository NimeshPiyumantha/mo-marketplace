import type { Variant } from '../types';

interface Props {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: Props) {
  if (variants.length === 0) return null;

  // Collect all unique attribute keys across variants
  const attrKeys = [
    ...new Set(variants.flatMap((v) => Object.keys(v.attributes))),
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontSize: '0.9rem',
          marginBottom: 12,
          color: 'var(--color-text-muted)',
        }}
      >
        Select Variant
      </h3>

      {attrKeys.map((key) => {
        const uniqueValues = [
          ...new Set(
            variants.map((v) => v.attributes[key]).filter(Boolean),
          ),
        ];

        return (
          <div key={key} style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {key}
            </label>
            <div className="variant-options">
              {uniqueValues.map((val) => {
                const matchingVariants = variants.filter(
                  (v) => v.attributes[key] === val,
                );
                const allOutOfStock = matchingVariants.every(
                  (v) => v.stock <= 0,
                );
                const isSelected =
                  selectedVariant?.attributes[key] === val;

                return (
                  <button
                    key={val}
                    className={`variant-chip ${isSelected ? 'selected' : ''}`}
                    disabled={allOutOfStock}
                    title={
                      allOutOfStock ? 'Out of stock' : `Select ${val}`
                    }
                    onClick={() => {
                      // Find best matching variant preserving other selections
                      const match =
                        variants.find((v) => {
                          if (v.attributes[key] !== val) return false;
                          if (!selectedVariant) return true;
                          return attrKeys.every(
                            (k) =>
                              k === key ||
                              v.attributes[k] ===
                                selectedVariant.attributes[k] ||
                              !selectedVariant.attributes[k],
                          );
                        }) ||
                        matchingVariants.find((v) => v.stock > 0) ||
                        matchingVariants[0];
                      onSelect(match);
                    }}
                  >
                    {val}
                    {allOutOfStock && ' (sold out)'}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected variant details */}
      {selectedVariant && (
        <div className="card" style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {selectedVariant.combinationKey}
              </div>
              {selectedVariant.sku && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  SKU: {selectedVariant.sku}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              {selectedVariant.stock > 0 ? (
                <span className="badge badge-success">
                  {selectedVariant.stock} in stock
                </span>
              ) : (
                <span className="badge badge-danger">Out of stock</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

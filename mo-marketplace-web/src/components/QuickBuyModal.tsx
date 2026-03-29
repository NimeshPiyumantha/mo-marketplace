import { useState } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '../api/products';
import type { Product, Variant } from '../types';

interface Props {
  product: Product;
  variant: Variant;
  onClose: () => void;
  onSuccess: (updatedVariant: Variant) => void;
}

export default function QuickBuyModal({ product, variant, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await productsApi.quickBuy(product.id, variant.id, quantity);
      toast.success(res.message);
      onSuccess(res.variant);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const total = Number(variant.price) * quantity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Quick Buy</h2>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 4 }}>{product.name}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Variant: {variant.combinationKey}
          </p>
          <p style={{ color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 600 }}>
            ${Number(variant.price).toFixed(2)} each
          </p>
        </div>

        <div className="form-group">
          <label>Quantity (max {variant.stock})</label>
          <input
            type="number"
            className="form-input"
            value={quantity}
            min={1}
            max={variant.stock}
            onChange={(e) => {
              const val = Math.max(1, Math.min(variant.stock, Number(e.target.value)));
              setQuantity(val);
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0',
            borderTop: '1px solid var(--color-border)',
            marginTop: 16,
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              ${total.toFixed(2)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleBuy} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

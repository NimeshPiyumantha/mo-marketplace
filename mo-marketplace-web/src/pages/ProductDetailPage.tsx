import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productsApi } from '../api/products';
import { useAuth } from '../store/AuthContext';
import type { Product, Variant } from '../types';
import VariantSelector from '../components/VariantSelector';
import QuickBuyModal from '../components/QuickBuyModal';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  useEffect(() => {
    if (!id) return;
    productsApi
      .getById(id)
      .then((p) => {
        setProduct(p);
        const inStock = p.variants.find((v) => v.stock > 0);
        if (inStock) setSelectedVariant(inStock);
      })
      .catch(() => {
        toast.error('Product not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!product || !confirm('Delete this product?')) return;
    try {
      await productsApi.delete(product.id);
      toast.success('Product deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return null;

  return (
    <div>
      <button
        className="btn btn-sm"
        onClick={() => navigate('/')}
        style={{ marginTop: 24 }}
      >
        &larr; Back to Products
      </button>

      <div className="detail-grid">
        {/* Left: Image */}
        <div>
          <div
            className="product-card-image"
            style={{ height: 350, borderRadius: 'var(--radius)', fontSize: '5rem' }}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
              />
            ) : (
              '\u{1F4E6}'
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          <h1 style={{ marginBottom: 8 }}>{product.name}</h1>
          {product.category && (
            <span className="category" style={{ marginBottom: 16 }}>
              {product.category}
            </span>
          )}
          {product.description && (
            <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
              {product.description}
            </p>
          )}

          <div className="price" style={{ fontSize: '1.5rem', margin: '16px 0' }}>
            ${selectedVariant
              ? Number(selectedVariant.price).toFixed(2)
              : Number(product.basePrice).toFixed(2)}
          </div>

          {/* Variant selector component */}
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary"
              disabled={!selectedVariant || selectedVariant.stock <= 0 || !isAuthenticated}
              onClick={() => setShowQuickBuy(true)}
              title={
                !isAuthenticated
                  ? 'Login to purchase'
                  : !selectedVariant
                    ? 'Select a variant'
                    : selectedVariant.stock <= 0
                      ? 'Out of stock'
                      : 'Quick Buy'
              }
            >
              Quick Buy
            </button>
            {isAuthenticated && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete Product
              </button>
            )}
          </div>
          {!isAuthenticated && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
              Please login to make a purchase
            </p>
          )}
        </div>
      </div>

      {/* Quick Buy Modal */}
      {showQuickBuy && selectedVariant && product && (
        <QuickBuyModal
          product={product}
          variant={selectedVariant}
          onClose={() => setShowQuickBuy(false)}
          onSuccess={(updatedVariant) => {
            setProduct((prev) =>
              prev
                ? {
                    ...prev,
                    variants: prev.variants.map((v) =>
                      v.id === updatedVariant.id ? updatedVariant : v,
                    ),
                  }
                : prev,
            );
            setSelectedVariant(updatedVariant);
          }}
        />
      )}
    </div>
  );
}

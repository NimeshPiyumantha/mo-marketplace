import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import type { Product } from '../types';

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getAll()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading products...</div>;

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No products yet</h3>
        <p>Create your first product to get started.</p>
        <Link to="/products/new" className="btn btn-primary" style={{ marginTop: 16 }}>
          + Create Product
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
      </div>
      <div className="card-grid">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="product-card">
              <div className="product-card-image">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '\u{1F4E6}'
                )}
              </div>
              <div className="product-card-body">
                <h3>{product.name}</h3>
                <div className="price">${Number(product.basePrice).toFixed(2)}</div>
                {product.category && (
                  <span className="category">{product.category}</span>
                )}
                <div className="variant-count">
                  {product.variants.length} variant
                  {product.variants.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

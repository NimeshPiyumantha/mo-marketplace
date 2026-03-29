import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { productsApi } from '../api/products';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, 'Price must be >= 0'),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

interface VariantForm {
  attributes: { key: string; value: string }[];
  price: string;
  stock: string;
  sku: string;
}

const emptyVariant = (): VariantForm => ({
  attributes: [{ key: 'color', value: '' }, { key: 'size', value: '' }],
  price: '',
  stock: '0',
  sku: '',
});

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const updateVariantField = (
    vIndex: number,
    field: keyof Omit<VariantForm, 'attributes'>,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === vIndex ? { ...v, [field]: value } : v)),
    );
  };

  const updateAttr = (vIndex: number, aIndex: number, field: 'key' | 'value', val: string) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIndex
          ? {
              ...v,
              attributes: v.attributes.map((a, j) =>
                j === aIndex ? { ...a, [field]: val } : a,
              ),
            }
          : v,
      ),
    );
  };

  const addAttr = (vIndex: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIndex
          ? { ...v, attributes: [...v.attributes, { key: '', value: '' }] }
          : v,
      ),
    );
  };

  const removeAttr = (vIndex: number, aIndex: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIndex
          ? { ...v, attributes: v.attributes.filter((_, j) => j !== aIndex) }
          : v,
      ),
    );
  };

  const onSubmit = async (data: ProductForm) => {
    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.price || Number(v.price) < 0) {
        toast.error(`Variant ${i + 1}: Price is required and must be >= 0`);
        return;
      }
      const filledAttrs = v.attributes.filter((a) => a.key.trim() && a.value.trim());
      if (filledAttrs.length === 0) {
        toast.error(`Variant ${i + 1}: At least one attribute is required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        variants: variants.map((v) => ({
          attributes: Object.fromEntries(
            v.attributes
              .filter((a) => a.key.trim() && a.value.trim())
              .map((a) => [a.key.trim(), a.value.trim()]),
          ),
          price: Number(v.price),
          stock: Number(v.stock) || 0,
          sku: v.sku || undefined,
        })),
      };

      const product = await productsApi.create(payload);
      toast.success('Product created!');
      navigate(`/products/${product.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '32px auto' }}>
      <h1 style={{ marginBottom: 24 }}>Create Product</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Product Details</h2>

          <div className="form-group">
            <label>Name *</label>
            <input {...register('name')} className="form-input" placeholder="Classic T-Shirt" />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              {...register('description')}
              className="form-input"
              rows={3}
              placeholder="A comfortable cotton t-shirt..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Base Price *</label>
              <input
                {...register('basePrice')}
                type="number"
                step="0.01"
                className="form-input"
                placeholder="29.99"
              />
              {errors.basePrice && <p className="form-error">{errors.basePrice.message}</p>}
            </div>
            <div className="form-group">
              <label>Category</label>
              <input {...register('category')} className="form-input" placeholder="Apparel" />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              {...register('imageUrl')}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Variants */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem' }}>Variants</h2>
            <button type="button" className="btn btn-sm btn-primary" onClick={addVariant}>
              + Add Variant
            </button>
          </div>

          {variants.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              No variants added yet. Click &quot;Add Variant&quot; to define product options like
              color, size, etc.
            </p>
          )}

          {variants.map((variant, vIndex) => (
            <div key={vIndex} className="variant-row">
              <div className="variant-row-header">
                <strong style={{ fontSize: '0.9rem' }}>Variant {vIndex + 1}</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeVariant(vIndex)}
                >
                  Remove
                </button>
              </div>

              {/* Attributes */}
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Attributes
              </label>
              {variant.attributes.map((attr, aIndex) => (
                <div key={aIndex} className="variant-attrs" style={{ marginBottom: 4 }}>
                  <input
                    className="form-input"
                    placeholder="Key (e.g. color)"
                    value={attr.key}
                    onChange={(e) => updateAttr(vIndex, aIndex, 'key', e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      className="form-input"
                      placeholder="Value (e.g. red)"
                      value={attr.value}
                      onChange={(e) => updateAttr(vIndex, aIndex, 'value', e.target.value)}
                    />
                    {variant.attributes.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => removeAttr(vIndex, aIndex)}
                        style={{ padding: '6px 8px' }}
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => addAttr(vIndex)}
                style={{ marginTop: 4, marginBottom: 12 }}
              >
                + Attribute
              </button>

              {/* Price, Stock, SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="34.99"
                    value={variant.price}
                    onChange={(e) => updateVariantField(vIndex, 'price', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="50"
                    value={variant.stock}
                    onChange={(e) => updateVariantField(vIndex, 'stock', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>SKU</label>
                  <input
                    className="form-input"
                    placeholder="TSHIRT-RED-M"
                    value={variant.sku}
                    onChange={(e) => updateVariantField(vIndex, 'sku', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

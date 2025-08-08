import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addCart } from '../redux/action';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';

function ProductCard({ product }) {
  const dispatch = useDispatch();

  // Simulate stock based on product ID (deterministic)
  const simulatedStock = Math.floor((product.id * 7) % 50) + 5;
  
  const getStockStatus = () => {
    if (simulatedStock === 0) return { class: 'out-of-stock', text: 'Out of Stock' };
    if (simulatedStock <= 3) return { class: 'low-stock', text: `${simulatedStock} Left` };
    return { class: 'in-stock', text: 'In Stock' };
  };

  const stockStatus = getStockStatus();
  const isOutOfStock = simulatedStock === 0;
  const isLowStock = simulatedStock > 0 && simulatedStock < 10;

  // Variants just for clothing categories
  const hasVariants = product.category?.includes('clothing');
  const variants = hasVariants ? [
    { id: 'S', name: 'Small', stock: Math.floor(simulatedStock * 0.2) },
    { id: 'M', name: 'Medium', stock: Math.floor(simulatedStock * 0.4) },
    { id: 'L', name: 'Large', stock: Math.floor(simulatedStock * 0.3) },
    { id: 'XL', name: 'X-Large', stock: Math.floor(simulatedStock * 0.1) }
  ] : null;

  const [selectedVariant, setSelectedVariant] = useState(variants?.[0] || null);
  const currentStock = selectedVariant ? selectedVariant.stock : simulatedStock;
  const isVariantOutOfStock = hasVariants && currentStock === 0;

  const handleAddToCart = () => {
    if (!isOutOfStock && !isVariantOutOfStock) {
      const productToAdd = hasVariants ? {
        ...product,
        selectedSize: selectedVariant.name,
        variant: selectedVariant.id
      } : product;
      
      dispatch(addCart(productToAdd));
      toast.success(`Added to cart!`);
    }
  };

  const renderStars = (rate = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star${i <= Math.round(rate) ? ' text-warning' : ' text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <div className="card border-0 h-100 position-relative overflow-hidden animate__animated animate__fadeInUp" style={{ 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease'
    }}>
      <div className="position-relative w-100" style={{ 
        height: '220px', 
        overflow: 'hidden', 
        background: 'linear-gradient(to left, #6dd5ed, #2193b0)'
      }}>
        <img 
          src={product.image} 
          alt={product.title || product.name} 
          className="w-100 h-100 object-fit-contain p-3"
          style={{
            transition: 'transform 0.4s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-10px) scale(1.05)';
            e.target.parentElement.parentElement.style.transform = 'translateY(-5px)';
            e.target.parentElement.parentElement.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.parentElement.parentElement.style.transform = 'translateY(0)';
            e.target.parentElement.parentElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
          }}
        />
        
        {/* Category Badge */}
        <span className="badge bg-secondary position-absolute top-0 start-0 m-2 text-capitalize">
          {product.category}
        </span>
        
        {(isOutOfStock || isVariantOutOfStock) && (
          <span className="badge bg-danger position-absolute top-0 end-0 m-2">Out of Stock</span>
        )}
        {isLowStock && !isOutOfStock && !isVariantOutOfStock && (
          <span className="badge bg-warning position-absolute top-0 end-0 m-2">
            Only {currentStock} left!
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold mb-1">
          {(product.title || product.name)?.substring(0, 40)}
          {(product.title || product.name)?.length > 40 ? '...' : ''}
        </h5>

        <div className="mb-2">
          <span className="fs-5 fw-bold me-2" style={{ color: '#2193b0' }}>
            ${product.price}
          </span>
        </div>

        {product.rating && (
          <div className="mb-2 d-flex align-items-center justify-content-between">
            <div className="d-flex gap-1">
              {renderStars(product.rating.rate)}
            </div>
            <small className="text-muted">{product.rating.count || 0} reviews</small>
          </div>
        )}

        {/* Variants */}
        {hasVariants && variants && (
          <div className="mb-3">
            <label className="form-label small fw-semibold">Size:</label>
            <select 
              className="form-select form-select-sm"
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const variant = variants.find(v => v.id === e.target.value);
                setSelectedVariant(variant);
              }}
            >
              {variants.map(variant => (
                <option key={variant.id} value={variant.id} disabled={variant.stock === 0}>
                  {variant.name} {variant.stock === 0 ? '(Out of Stock)' : `(${variant.stock} left)`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
          <button 
            className="btn w-100 text-white d-flex justify-content-center align-items-center"
            onClick={handleAddToCart} 
            disabled={isOutOfStock || isVariantOutOfStock}
            style={{
              background: (isOutOfStock || isVariantOutOfStock)
                ? '#adb5bd'
                : 'linear-gradient(to left, #6dd5ed, #2193b0)',
              border: 'none',
              height: '40px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isOutOfStock && !isVariantOutOfStock) {
                e.target.style.background = 'linear-gradient(to left, #4db8d4, #1a7a99)';
                const icon = e.target.querySelector('i');
                if (icon) icon.style.transform = 'scale(1.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isOutOfStock && !isVariantOutOfStock) {
                e.target.style.background = 'linear-gradient(to left, #6dd5ed, #2193b0)';
                const icon = e.target.querySelector('i');
                if (icon) icon.style.transform = 'scale(1)';
              }
            }}
          >
            <i 
              className={`fas fa-${(isOutOfStock || isVariantOutOfStock) ? 'ban' : 'shopping-cart'} me-2`}
              style={{ transition: 'transform 0.3s ease' }}
            ></i>
            {(isOutOfStock || isVariantOutOfStock) ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <NavLink 
            to={`/product/${product.id}`} 
            className="btn border-0 bg-light shadow-sm d-flex align-items-center justify-content-center"
            style={{ 
              width: '40px', 
              height: '40px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              const icon = e.target.querySelector('i');
              if (icon) icon.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              const icon = e.target.querySelector('i');
              if (icon) icon.style.transform = 'scale(1)';
            }}
          >
            <i 
              className="fas fa-eye" 
              style={{ 
                color: '#2193b0',
                transition: 'transform 0.3s ease'
              }}
            ></i>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
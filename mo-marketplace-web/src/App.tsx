import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductCreatePage from './pages/ProductCreatePage';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-brand">
          MO Marketplace
        </Link>
        <div className="nav-links">
          <Link to="/" className="btn btn-sm">
            Products
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/products/new" className="btn btn-sm btn-primary">
                + New Product
              </Link>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>
                {user?.name}
              </span>
              <button className="btn btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route
            path="/products/new"
            element={
              isAuthenticated ? (
                <ProductCreatePage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </>
  );
}

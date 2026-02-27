import { Outlet, NavLink, useLocation, Navigate } from "react-router";
import { useAuth } from "./AuthContextProvider";
export default function MainLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#2196f3" : "#333",
    fontWeight: isActive ? "bold" : "normal",
    textDecoration: "none",
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "2px solid #eee",
          backgroundColor: "#fff",
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem", color: '#667eea' }}>Texas Bank Dashboard</h1>
        <nav style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <NavLink to="/" style={linkStyle} end>
            Dashboard
          </NavLink>
          <NavLink to="/deposit" style={linkStyle}>
            Deposit
          </NavLink>
          <NavLink to="/withdraw" style={linkStyle}>
            Withdraw
          </NavLink>
          <NavLink to="/transfer" style={linkStyle}>
            Transfer
          </NavLink>
          <NavLink to="/bills" style={linkStyle}>
            Pay Bills
          </NavLink>
          <NavLink to="/goals" style={linkStyle}>
            Savings Goals
          </NavLink>
          <NavLink to="/budget" style={linkStyle}>
            Budget
          </NavLink>
          <NavLink to="/cards" style={linkStyle}>
            Cards
          </NavLink>
          <NavLink to="/qr-payment" style={linkStyle}>
            QR Payment
          </NavLink>
          <NavLink to="/settings" style={linkStyle}>
            Settings
          </NavLink>
        </nav>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", backgroundColor: '#fff', borderRadius: '8px', marginTop: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {/* Child routes render here */}
        <Outlet />
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          borderTop: "1px solid #eee",
          color: "#999",
          backgroundColor: "#fff",
          marginTop: '20px',
        }}
      >
        <p>Texas Bank Dashboard - Secure Banking Solutions</p>
      </footer>
    </div>
  );
}

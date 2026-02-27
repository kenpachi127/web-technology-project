import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

const MAX_BALANCE = 100000;

// Simulated auth service (replace with real API in production)
const authService = {
  login: async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (email === "admin@test.com" && password === "password") {
      return { id: 1, name: "Admin User", email, role: "admin", balance: 5000 };
    }
    if (email === "user@test.com" && password === "password") {
      return { id: 2, name: "Regular User", email, role: "user", balance: 1000 };
    }
    throw new Error("Invalid email or password");
  },
  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // eslint-disable-line react-hooks/set-state-in-effect
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    logout,
    updateBalance,
    MAX_BALANCE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

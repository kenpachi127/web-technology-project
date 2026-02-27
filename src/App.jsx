import "./App.css";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import { Routes, Route } from "react-router";
import Home from "./pages/Home/Home";
import Withdraw from "./pages/Withdraw/Withdraw";
import Deposit from "./pages/Deposit/Deposit";
import Transfer from "./pages/Transfer/Transfer";
import BillPayment from "./pages/BillPayment/BillPayment";
import SavingsGoals from "./pages/SavingsGoals/SavingsGoals";
import AccountSettings from "./pages/AccountSettings/AccountSettings";
import Budget from "./pages/Budget/Budget";
import QRPayment from "./pages/QRPayment/QRPayment";
import Cards from "./pages/Cards/Cards";
import MainLayout from "./provider/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path = '/'element = {<MainLayout /> }>
          <Route index element = {<Home /> } />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="bills" element={<BillPayment />} />
          <Route path="goals" element={<SavingsGoals />} />
          <Route path="budget" element={<Budget />} />
          <Route path="cards" element={<Cards />} />
          <Route path="qr-payment" element={<QRPayment />} />
          <Route path="settings" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
}

export default App;

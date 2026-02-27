import React, { useState } from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';

const { Title, Text } = Typography;

function Deposit() {
  const { user, updateBalance, MAX_BALANCE } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const balance = user?.balance || 0;

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }
    if (balance + depositAmount > MAX_BALANCE) {
      message.error(`Deposit would exceed maximum balance of $${MAX_BALANCE}`);
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newBalance = balance + depositAmount;
    updateBalance(newBalance);

    // Add transaction to localStorage
    const storedTransactions = localStorage.getItem(`transactions_${user.id}`) || '[]';
    const transactions = JSON.parse(storedTransactions);
    const newTransaction = {
      id: Date.now(),
      type: 'deposit',
      amount: depositAmount,
      description: `Deposit of $${depositAmount.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      balance: newBalance
    };
    transactions.unshift(newTransaction);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));

    setAmount('');
    message.success(`Deposited $${depositAmount}`);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={2}>Deposit Money</Title>
      <Card style={{ marginBottom: 20 }}>
        <Text strong>Current Balance: ${balance.toFixed(2)}</Text>
      </Card>
      <Card>
        <Title level={4}>Enter Amount to Deposit</Title>
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Button
          type="primary"
          onClick={handleDeposit}
          loading={loading}
          block
        >
          Deposit
        </Button>
      </Card>
    </div>
  );
}

export default Deposit;
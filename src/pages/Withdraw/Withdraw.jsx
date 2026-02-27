import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Avatar, Divider } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { ArrowDownOutlined, WalletOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Withdraw() {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const balance = user?.balance || 0;

  const quickAmounts = [20, 50, 100, 200, 500];

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > balance) {
      message.error('Insufficient balance');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newBalance = balance - withdrawAmount;
    updateBalance(newBalance);

    // Add transaction to localStorage
    const storedTransactions = localStorage.getItem(`transactions_${user.id}`) || '[]';
    const transactions = JSON.parse(storedTransactions);
    const newTransaction = {
      id: Date.now(),
      type: 'withdraw',
      amount: withdrawAmount,
      description: `Withdrawal of $${withdrawAmount.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      balance: newBalance
    };
    transactions.unshift(newTransaction);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));

    setAmount('');
    message.success(`Successfully withdrew $${withdrawAmount.toLocaleString()}`);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        background: '#2c3e50',
        padding: '40px 20px',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <Avatar
          size={80}
          icon={<ArrowDownOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          Withdraw Money
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Access your funds quickly and securely
        </Text>
      </div>

      {/* Balance Card */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #ddd',
          background: '#f8f9fa'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              size={50}
              icon={<WalletOutlined />}
              style={{
                background: '#34495e',
                marginRight: '16px'
              }}
            />
            <div>
              <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a1a1a' }}>
                Available Balance
              </Title>
              <Text style={{ fontSize: '18px', fontWeight: '600', color: '#fa709a' }}>
                ${balance.toLocaleString()}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Withdraw Form */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
          Enter Withdrawal Amount
        </Title>

        {/* Amount Input */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Amount</Text>
          <Input
            type="number"
            placeholder="Enter amount to withdraw"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            size="large"
            prefix="$"
            style={{ marginBottom: '12px' }}
          />

          {/* Quick Amount Buttons */}
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              Quick Amounts:
            </Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickAmounts.map(amt => (
                <Button
                  key={amt}
                  size="small"
                  onClick={() => setAmount(amt.toString())}
                  disabled={amt > balance}
                  style={{
                    borderRadius: '6px',
                    border: amt > balance ? '1px solid #ffccc7' : '1px solid #d9d9d9',
                    color: amt > balance ? '#ff7875' : undefined
                  }}
                >
                  ${amt}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <Button
          type="primary"
          danger
          onClick={handleWithdraw}
          loading={loading}
          block
          size="large"
          style={{
            height: '48px',
            borderRadius: '8px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)'
          }}
          icon={<ArrowDownOutlined />}
        >
          Withdraw Funds
        </Button>

        {/* Fee Information */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ATM fee: $2.50 • Daily limit: $500
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default Withdraw;
import React, { useState } from 'react';
import { Card, Input, Button, Typography, Select, message, Avatar, Divider } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { ArrowRightOutlined, BankOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function Transfer() {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transferType, setTransferType] = useState('account');
  const [loading, setLoading] = useState(false);

  const balance = user?.balance || 0;

  // Mock recipient accounts for demo
  const mockRecipients = [
    { id: 1, name: 'John Smith', account: '****1234', bank: 'Texas Bank' },
    { id: 2, name: 'Sarah Johnson', account: '****5678', bank: 'First National' },
    { id: 3, name: 'Mike Davis', account: '****9012', bank: 'City Bank' },
  ];

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }
    if (transferAmount > balance) {
      message.error('Insufficient balance');
      return;
    }
    if (!recipient && transferType === 'account') {
      message.error('Please select a recipient');
      return;
    }
    if (transferType === 'account' && !recipient) {
      message.error('Please enter recipient account number');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newBalance = balance - transferAmount;
    updateBalance(newBalance);

    // Add transaction to localStorage
    const storedTransactions = localStorage.getItem(`transactions_${user.id}`) || '[]';
    const transactions = JSON.parse(storedTransactions);
    const recipientInfo = transferType === 'account' ? 
      (mockRecipients.find(r => r.id === parseInt(recipient))?.name || recipient) : 
      recipient;
    const newTransaction = {
      id: Date.now(),
      type: 'transfer',
      amount: transferAmount,
      description: `Transfer to ${recipientInfo}`,
      timestamp: new Date().toISOString(),
      balance: newBalance
    };
    transactions.unshift(newTransaction);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));

    setAmount('');
    setRecipient('');

    message.success(`Successfully transferred $${transferAmount.toLocaleString()} ${transferType === 'account' ? 'to account' : 'to phone number'}`);
    setLoading(false);
  };

  const quickAmounts = [50, 100, 250, 500, 1000];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Avatar
          size={80}
          icon={<ArrowRightOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          Transfer Money
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Send money securely to other accounts
        </Text>
      </div>

      {/* Balance Card */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              size={50}
              icon={<BankOutlined />}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                marginRight: '16px'
              }}
            />
            <div>
              <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a1a1a' }}>
                Available Balance
              </Title>
              <Text style={{ fontSize: '18px', fontWeight: '600', color: '#1890ff' }}>
                ${balance.toLocaleString()}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Transfer Form */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
          Transfer Details
        </Title>

        {/* Transfer Type */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Transfer Type</Text>
          <Select
            value={transferType}
            onChange={setTransferType}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="account">To Bank Account</Option>
            <Option value="phone">To Phone Number</Option>
          </Select>
        </div>

        {/* Recipient Selection */}
        {transferType === 'account' ? (
          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Select Recipient</Text>
            <Select
              placeholder="Choose from saved recipients"
              onChange={(value) => setRecipient(value)}
              style={{ width: '100%', marginBottom: '12px' }}
              size="large"
              allowClear
            >
              {mockRecipients.map(recipient => (
                <Option key={recipient.id} value={recipient.account}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                    <div>
                      <div>{recipient.name}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {recipient.account} • {recipient.bank}
                      </Text>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
            <Divider>Or</Divider>
            <Input
              placeholder="Enter account number"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              size="large"
            />
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Phone Number</Text>
            <Input
              placeholder="Enter phone number (e.g., +1 555-123-4567)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              size="large"
            />
          </div>
        )}

        {/* Amount Input */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Amount</Text>
          <Input
            type="number"
            placeholder="Enter amount"
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
                  style={{
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  ${amt}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Transfer Button */}
        <Button
          type="primary"
          onClick={handleTransfer}
          loading={loading}
          block
          size="large"
          style={{
            height: '48px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
          icon={<ArrowRightOutlined />}
        >
          Transfer Money
        </Button>

        {/* Fee Information */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Transfer fee: $0.00 • Processing time: Instant
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default Transfer;
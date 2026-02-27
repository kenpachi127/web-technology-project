import React, { useState } from 'react';
import { Card, Input, Button, Typography, Select, message, Avatar, Divider, List, Tag } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { CreditCardOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function BillPayment() {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);

  const balance = user?.balance || 0;

  // Mock bill data
  const bills = [
    {
      id: 1,
      name: 'Electricity Bill',
      company: 'Texas Power & Light',
      amount: 125.50,
      dueDate: '2026-02-15',
      category: 'Utilities',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Internet Bill',
      company: 'FastNet Communications',
      amount: 79.99,
      dueDate: '2026-02-20',
      category: 'Internet',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Phone Bill',
      company: 'MobilePlus',
      amount: 45.00,
      dueDate: '2026-02-18',
      category: 'Phone',
      status: 'pending'
    },
    {
      id: 4,
      name: 'Credit Card',
      company: 'Texas Bank Credit',
      amount: 250.00,
      dueDate: '2026-02-25',
      category: 'Credit Card',
      status: 'pending'
    },
    {
      id: 5,
      name: 'Insurance',
      company: 'SafeGuard Insurance',
      amount: 180.00,
      dueDate: '2026-02-28',
      category: 'Insurance',
      status: 'pending'
    }
  ];

  const handlePayBill = async () => {
    if (!selectedBill) {
      message.error('Please select a bill to pay');
      return;
    }

    const bill = bills.find(b => b.id === selectedBill);
    const paymentAmount = amount ? parseFloat(amount) : bill.amount;

    if (!paymentAmount || paymentAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }
    if (paymentAmount > balance) {
      message.error('Insufficient balance');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newBalance = balance - paymentAmount;
    updateBalance(newBalance);

    // Add transaction to localStorage
    const storedTransactions = localStorage.getItem(`transactions_${user.id}`) || '[]';
    const transactions = JSON.parse(storedTransactions);
    const timestamp = new Date().toISOString();
    const newTransaction = {
      id: timestamp,
      type: 'bill_payment',
      amount: paymentAmount,
      description: `Bill Payment: ${bill.name} (${bill.company})`,
      timestamp: timestamp,
      balance: newBalance,
      category: bill.category,
      billId: bill.id
    };
    transactions.unshift(newTransaction);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));

    setAmount('');
    setSelectedBill(null);

    message.success(`Successfully paid $${paymentAmount.toLocaleString()} for ${bill.name}`);
    setLoading(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Utilities': 'blue',
      'Internet': 'green',
      'Phone': 'orange',
      'Credit Card': 'red',
      'Insurance': 'purple'
    };
    return colors[category] || 'default';
  };

  const selectedBillData = bills.find(bill => bill.id === selectedBill);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        padding: '40px 20px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
      }}>
        <Avatar
          size={80}
          icon={<CreditCardOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          Bill Payments
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Pay your bills quickly and securely
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
              icon={<DollarOutlined />}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Bills List */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              height: 'fit-content'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Title level={4} style={{ marginBottom: '24px' }}>
              Pending Bills
            </Title>

            <List
              dataSource={bills}
              renderItem={(bill) => (
                <List.Item
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: selectedBill === bill.id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                    background: selectedBill === bill.id ? '#f6ffed' : 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedBill(bill.id)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          background: selectedBill === bill.id ? '#52c41a' : '#d9d9d9'
                        }}
                        icon={selectedBill === bill.id ? <CheckCircleOutlined /> : <CreditCardOutlined />}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{bill.name}</span>
                        <Tag color={getCategoryColor(bill.category)}>{bill.category}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>{bill.company}</div>
                        <div style={{ marginTop: '4px' }}>
                          <Text strong style={{ color: '#1890ff' }}>
                            ${bill.amount.toFixed(2)}
                          </Text>
                          <Text type="secondary" style={{ marginLeft: '8px' }}>
                            Due: {new Date(bill.dueDate).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* Payment Form */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
              Payment Details
            </Title>

            {selectedBillData ? (
              <div style={{ marginBottom: '24px' }}>
                <Card size="small" style={{ marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={5}>{selectedBillData.name}</Title>
                    <Paragraph type="secondary">{selectedBillData.company}</Paragraph>
                    <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                      ${selectedBillData.amount.toFixed(2)}
                    </Text>
                  </div>
                </Card>

                <div style={{ marginBottom: '24px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    Payment Amount
                  </Text>
                  <Input
                    type="number"
                    placeholder={`Full amount: $${selectedBillData.amount.toFixed(2)}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    size="large"
                    prefix="$"
                  />
                  <Text type="secondary" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                    Leave empty to pay full amount
                  </Text>
                </div>

                <Button
                  type="primary"
                  onClick={handlePayBill}
                  loading={loading}
                  block
                  size="large"
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border: 'none',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
                  }}
                  icon={<CheckCircleOutlined />}
                >
                  Pay Bill
                </Button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CreditCardOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={5} style={{ color: '#666', marginBottom: '8px' }}>
                  Select a bill to pay
                </Title>
                <Text style={{ color: '#999' }}>
                  Choose a bill from the list to proceed with payment
                </Text>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BillPayment;
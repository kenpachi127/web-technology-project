import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Row, Col, Button, Input, message, Avatar, Statistic, Progress, Table, Tag, Tabs, Select, DatePicker, Space, Alert, List, Badge } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { useNavigate } from 'react-router';
import {
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
  WalletOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  BellOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  QrcodeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function Home() {
  const { user, logout, updateBalance, MAX_BALANCE } = useAuth();
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  const balance = user?.balance || 0;
  const balancePercentage = (balance / MAX_BALANCE) * 100;

  const quickDepositAmounts = [20, 50, 100, 200, 500];
  const quickWithdrawAmounts = [20, 50, 100, 200, 500];

  // Generate notifications based on balance and recent activity
  useEffect(() => {
    const newNotifications = [];

    // Low balance alert
    if (balance < 100 && balance > 0) {
      newNotifications.push({
        id: 'low-balance',
        type: 'warning',
        title: 'Low Balance Alert',
        message: `Your account balance is $${balance.toFixed(2)}. Consider adding funds to avoid insufficient balance.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // High balance achievement
    if (balance >= MAX_BALANCE * 0.8) {
      newNotifications.push({
        id: 'high-balance',
        type: 'success',
        title: 'Balance Milestone',
        message: `Congratulations! You've reached ${balancePercentage.toFixed(1)}% of your maximum balance limit.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Recent large transactions
    const recentTransactions = transactions.filter(t => {
      const transactionTime = new Date(t.timestamp);
      const now = new Date();
      const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);
      return hoursDiff <= 24 && t.amount > 100;
    });

    recentTransactions.forEach(transaction => {
      let transactionTypeText = '';
      switch (transaction.type) {
        case 'deposit':
          transactionTypeText = 'Deposit';
          break;
        case 'withdraw':
          transactionTypeText = 'Withdrawal';
          break;
        case 'bill_payment':
          transactionTypeText = 'Bill Payment';
          break;
        case 'transfer':
          transactionTypeText = 'Transfer';
          break;
        case 'payment':
          transactionTypeText = 'Payment';
          break;
        default:
          transactionTypeText = transaction.type;
      }

      newNotifications.push({
        id: `large-transaction-${transaction.id}`,
        type: 'info',
        title: 'Large Transaction',
        message: `${transactionTypeText} of $${transaction.amount.toLocaleString()} was processed.`,
        timestamp: transaction.timestamp,
        read: false
      });
    });

    // Welcome message for new users
    if (transactions.length === 0) {
      newNotifications.push({
        id: 'welcome',
        type: 'info',
        title: 'Welcome to Texas Bank!',
        message: 'Start by making your first deposit or exploring our banking features.',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    setNotifications(newNotifications); // eslint-disable-line react-hooks/set-state-in-effect
  }, [balance, balancePercentage, transactions, MAX_BALANCE]);

  // Filtered transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.amount.toString().includes(searchText) ||
        transaction.type.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startDate.startOf('day') && transactionDate <= endDate.endOf('day');
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [transactions, searchText, typeFilter, dateRange]);

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Balance After'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        new Date(transaction.timestamp).toLocaleDateString(),
        transaction.type,
        transaction.amount,
        `"${transaction.description}"`,
        transaction.balance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load transactions from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (storedTransactions) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTransactions(JSON.parse(storedTransactions));
      }
    }
  }, [user?.id]);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    if (user?.id && transactions.length > 0) {
      localStorage.setItem(`transactions_${user?.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user?.id]);

  const addTransaction = (type, amount, description) => {
    const newTransaction = {
      id: Date.now(),
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
      balance: balance + (type === 'deposit' ? amount : -amount)
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      message.error('Please enter a valid deposit amount');
      return;
    }
    if (balance + amount > MAX_BALANCE) {
      message.error(`Deposit would exceed maximum balance of $${MAX_BALANCE}`);
      return;
    }

    setDepositLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newBalance = balance + amount;
    updateBalance(newBalance);
    addTransaction('deposit', amount, `Deposit of $${amount.toLocaleString()}`);
    setDepositAmount('');
    message.success(`Successfully deposited $${amount.toLocaleString()}`);
    setDepositLoading(false);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      message.error('Please enter a valid withdraw amount');
      return;
    }
    if (amount > balance) {
      message.error('Insufficient balance');
      return;
    }

    setWithdrawLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newBalance = balance - amount;
    updateBalance(newBalance);
    addTransaction('withdraw', amount, `Withdrawal of $${amount.toLocaleString()}`);
    setWithdrawAmount('');
    message.success(`Successfully withdrew $${amount.toLocaleString()}`);
    setWithdrawLoading(false);
  };

  // Transaction table columns
  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let color = 'default';
        let icon = null;
        let text = type;

        switch (type) {
          case 'deposit':
            color = 'green';
            icon = <ArrowUpOutlined />;
            text = 'Deposit';
            break;
          case 'withdraw':
            color = 'red';
            icon = <ArrowDownOutlined />;
            text = 'Withdraw';
            break;
          case 'bill_payment':
            color = 'blue';
            icon = <DollarOutlined />;
            text = 'Bill Payment';
            break;
          case 'transfer':
            color = 'orange';
            icon = <ArrowRightOutlined />;
            text = 'Transfer';
            break;
          case 'payment':
            color = 'purple';
            icon = <CreditCardOutlined />;
            text = 'Payment';
            break;
          case 'payment_request':
            color = 'geekblue';
            icon = <QrcodeOutlined />;
            text = 'Payment Request';
            break;
          default:
            color = 'default';
            text = type;
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          ${amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Balance After',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => (
        <Text>${balance.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <div>
          <Text>{new Date(timestamp).toLocaleDateString()}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(timestamp).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Welcome Header */}
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
          icon={<UserOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          Welcome back, {user?.name}!
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Manage your finances with ease
        </Text>
      </div>

      {/* Account Info Card */}
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #ddd',
              background: '#f8f9fa'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row align="middle" gutter={16}>
              <Col>
                <Avatar
                  size={60}
                  icon={<BankOutlined />}
                  style={{
                    background: '#34495e',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </Col>
              <Col flex="auto">
                <Title level={4} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
                  Account Information
                </Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <Text strong style={{ color: '#666' }}>Name: </Text>
                    <Text>{user?.name}</Text>
                  </div>
                  <div>
                    <Text strong style={{ color: '#666' }}>Email: </Text>
                    <Text>{user?.email}</Text>
                  </div>
                  <div>
                    <Text strong style={{ color: '#666' }}>Role: </Text>
                    <Text style={{
                      background: user?.role === 'admin' ? '#f6ffed' : '#f0f9ff',
                      color: user?.role === 'admin' ? '#52c41a' : '#1890ff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {user?.role}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col>
                <Button
                  type="primary"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    boxShadow: '0 2px 8px rgba(245, 34, 45, 0.3)'
                  }}
                >
                  Logout
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs
        defaultActiveKey="dashboard"
        size="large"
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <TabPane
          tab={
            <span>
              <CreditCardOutlined />
              Dashboard
            </span>
          }
          key="dashboard"
        >
          {/* Main Dashboard Cards */}
          <Row gutter={24}>
            {/* Balance Card */}
            <Col xs={24} lg={8} style={{ marginBottom: '24px' }}>
              <Card
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #ddd',
                  height: '100%',
                  background: '#34495e',
                  color: 'white'
                }}
                bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <WalletOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    Current Balance
                  </Title>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Statistic
                    value={balance}
                    prefix={<DollarOutlined />}
                    valueStyle={{
                      color: 'white',
                      fontSize: '36px',
                      fontWeight: '700',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                    suffix="USD"
                  />

                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Balance Progress</Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{balancePercentage.toFixed(1)}%</Text>
                    </div>
                    <Progress
                      percent={balancePercentage}
                      showInfo={false}
                      strokeColor="rgba(255, 255, 255, 0.8)"
                      trailColor="rgba(255, 255, 255, 0.3)"
                      strokeWidth={8}
                    />
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                      Max: ${MAX_BALANCE.toLocaleString()}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Deposit Card */}
            <Col xs={24} lg={8} style={{ marginBottom: '24px' }}>
              <Card
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #ddd',
                  height: '100%',
                  background: '#27ae60'
                }}
                bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <ArrowUpOutlined style={{ fontSize: '24px', marginRight: '12px', color: 'white' }} />
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    Deposit Money
                  </Title>
                </div>

                <div style={{ flex: 1 }}>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{
                      marginBottom: '16px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white'
                    }}
                    prefix={<DollarOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                  />

                  {/* Quick Deposit Amounts */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '8px' }}>
                      Quick Amounts:
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {quickDepositAmounts.map(amt => (
                        <Button
                          key={amt}
                          size="small"
                          onClick={() => setDepositAmount(amt.toString())}
                          disabled={balance + amt > MAX_BALANCE}
                          style={{
                            borderRadius: '6px',
                            border: balance + amt > MAX_BALANCE ? '1px solid rgba(255, 34, 45, 0.5)' : '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: balance + amt > MAX_BALANCE ? '#ff7875' : 'white'
                          }}
                        >
                          ${amt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="primary"
                    onClick={handleDeposit}
                    loading={depositLoading}
                    block
                    size="large"
                    style={{
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      height: '48px',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    icon={<ArrowUpOutlined />}
                  >
                    Deposit Funds
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Withdraw Card */}
            <Col xs={24} lg={8} style={{ marginBottom: '24px' }}>
              <Card
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #ddd',
                  height: '100%',
                  background: '#e74c3c'
                }}
                bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <ArrowDownOutlined style={{ fontSize: '24px', marginRight: '12px', color: 'white' }} />
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    Withdraw Money
                  </Title>
                </div>

                <div style={{ flex: 1 }}>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{
                      marginBottom: '16px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white'
                    }}
                    prefix={<DollarOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                  />

                  {/* Quick Withdraw Amounts */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '8px' }}>
                      Quick Amounts:
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {quickWithdrawAmounts.map(amt => (
                        <Button
                          key={amt}
                          size="small"
                          onClick={() => setWithdrawAmount(amt.toString())}
                          disabled={amt > balance}
                          style={{
                            borderRadius: '6px',
                            border: amt > balance ? '1px solid rgba(255, 34, 45, 0.5)' : '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: amt > balance ? '#ff7875' : 'white'
                          }}
                        >
                          ${amt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="primary"
                    danger
                    onClick={handleWithdraw}
                    loading={withdrawLoading}
                    block
                    size="large"
                    style={{
                      borderRadius: '8px',
                      background: 'rgba(255, 34, 94, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      height: '48px',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    icon={<ArrowDownOutlined />}
                  >
                    Withdraw Funds
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              Transaction History
            </span>
          }
          key="transactions"
        >
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HistoryOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#667eea' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                  Transaction Activity
                </Title>
              </div>
              {transactions.length > 0 && (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={exportToCSV}
                  style={{
                    borderRadius: '4px',
                    background: '#3498db',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  Export CSV
                </Button>
              )}
            </div>

            {/* Search and Filter Controls */}
            {transactions.length > 0 && (
              <Card size="small" style={{ marginBottom: '24px', background: '#f8f9fa' }}>
                <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Input
                      placeholder="Search transactions..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 200 }}
                      allowClear
                    />
                    <Select
                      placeholder="Filter by type"
                      value={typeFilter}
                      onChange={setTypeFilter}
                      style={{ width: 120 }}
                      allowClear
                    >
                      <Select.Option value="all">All Types</Select.Option>
                      <Select.Option value="deposit">Deposits</Select.Option>
                      <Select.Option value="withdraw">Withdrawals</Select.Option>
                      <Select.Option value="transfer">Transfers</Select.Option>
                      <Select.Option value="bill_payment">Bill Payments</Select.Option>
                      <Select.Option value="payment">Payments</Select.Option>
                      <Select.Option value="payment_request">Payment Requests</Select.Option>
                    </Select>
                  </Space>
                  <Space>
                    <DatePicker.RangePicker
                      onChange={(dates) => setDateRange(dates)}
                      placeholder={['Start Date', 'End Date']}
                      style={{ width: 250 }}
                    />
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => {
                        setSearchText('');
                        setTypeFilter('all');
                        setDateRange(null);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Space>
                </Space>
              </Card>
            )}

            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={5} style={{ color: '#666', marginBottom: '8px' }}>
                  No transactions yet
                </Title>
                <Text style={{ color: '#999' }}>
                  Your transaction history will appear here once you make deposits or withdrawals.
                </Text>
              </div>
            ) : (
              <Table
                columns={transactionColumns}
                dataSource={filteredTransactions}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${filteredTransactions.length} transactions`
                }}
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
                locale={{
                  emptyText: 'No transactions match your search criteria'
                }}
              />
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <Badge count={notifications.filter(n => !n.read).length} size="small">
                <BellOutlined />
                Notifications
              </Badge>
            </span>
          }
          key="notifications"
        >
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <BellOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />
              <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                Notifications & Alerts
              </Title>
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <BellOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={5} style={{ color: '#666', marginBottom: '8px' }}>
                  No notifications
                </Title>
                <Text style={{ color: '#999' }}>
                  You'll receive notifications about your account activity here.
                </Text>
              </div>
            ) : (
              <List
                dataSource={notifications}
                renderItem={(notification) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: notification.read ? '#f8f9fa' : '#fff7e6',
                      border: notification.read ? '1px solid #f0f0f0' : '1px solid #ffd591'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        notification.type === 'warning' ? (
                          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />
                        ) : notification.type === 'success' ? (
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                        ) : (
                          <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                        )
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {notification.title}
                          </span>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(notification.timestamp).toLocaleDateString()} {new Date(notification.timestamp).toLocaleTimeString()}
                          </Text>
                        </div>
                      }
                      description={notification.message}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Home;
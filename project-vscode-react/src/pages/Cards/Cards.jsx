import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, message, Modal, Form, Input, Select, Avatar, List, Divider, Row, Col, Statistic, Tabs, Switch, InputNumber, Descriptions, Tag } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { CreditCardOutlined, PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, LockOutlined, DollarOutlined, EnvironmentOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function Cards() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Card validation and utility functions
  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s+/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    return 'other';
  };

  const isValidCardNumber = (cardNumber) => {
    const number = cardNumber.replace(/\s+/g, '');
    if (!/^\d+$/.test(number)) return false;

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const isValidCVV = (cvv, cardType) => {
    if (cardType === 'amex') {
      return /^\d{4}$/.test(cvv);
    } else {
      return /^\d{3}$/.test(cvv);
    }
  };

  const maskCardNumber = (cardNumber, cardType) => {
    const number = cardNumber.replace(/\s+/g, '');
    const lastFour = number.slice(-4);

    if (cardType === 'amex') {
      // Amex: **** ****** *****
      return `**** ****** *${lastFour}`;
    } else {
      // Standard: **** **** **** ****
      return `**** **** **** ${lastFour}`;
    }
  };

  // Load cards from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedCards = localStorage.getItem(`cards_${user.id}`);
      if (storedCards) {
        setCards(JSON.parse(storedCards)); // eslint-disable-line react-hooks/set-state-in-effect
      }
    }
  }, [user?.id]);

  // Save cards to localStorage
  useEffect(() => {
    if (user?.id && cards.length >= 0) {
      localStorage.setItem(`cards_${user.id}`, JSON.stringify(cards));
    }
  }, [cards, user?.id]);

  const showModal = (card = null) => {
    setEditingCard(card);
    if (card) {
      form.setFieldsValue(card);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showDetailsModal = (card) => {
    setViewingCard(card);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setViewingCard(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCard(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    // Validate card number
    if (!isValidCardNumber(values.cardNumber)) {
      message.error('Please enter a valid card number');
      return;
    }

    // Validate CVV
    if (!isValidCVV(values.cvv, detectCardType(values.cardNumber))) {
      message.error('Please enter a valid CVV');
      return;
    }

    const cardType = detectCardType(values.cardNumber);
    const cardData = {
      ...values,
      id: editingCard ? editingCard.id : Date.now(),
      createdAt: editingCard ? editingCard.createdAt : new Date().toISOString(),
      cardType: cardType,
      lastFour: values.cardNumber.slice(-4),
      // Mask the card number for display based on card type
      maskedNumber: maskCardNumber(values.cardNumber, cardType),
      // Additional security - don't store full card number or CVV in plain form
      fullCardNumber: values.cardNumber, // In real app, this would be encrypted
      cvv: values.cvv, // In real app, this would be encrypted and not stored
      // Set default limits if not provided
      dailyLimit: values.dailyLimit || 1000,
      monthlyLimit: values.monthlyLimit || 5000,
      onlinePurchases: values.onlinePurchases !== undefined ? values.onlinePurchases : true,
      international: values.international !== undefined ? values.international : true,
      atmWithdrawals: values.atmWithdrawals !== undefined ? values.atmWithdrawals : true,
    };

    if (editingCard) {
      setCards(cards.map(card => card.id === editingCard.id ? cardData : card));
      message.success('Card updated successfully!');
    } else {
      setCards([...cards, cardData]);
      message.success('Card added successfully!');
    }

    setIsModalVisible(false);
    setEditingCard(null);
    form.resetFields();
  };

  const deleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
    message.success('Card deleted successfully!');
  };

  const getCardTypeIcon = (cardType) => {
    switch (cardType) {
      case 'visa':
        return '💳'; // Could use a Visa icon if available
      case 'mastercard':
        return '💳'; // Could use a Mastercard icon if available
      case 'amex':
        return '💳'; // Could use an Amex icon if available
      case 'discover':
        return '💳'; // Could use a Discover icon if available
      default:
        return '💳';
    }
  };

  const getCardTypeColor = (cardType) => {
    switch (cardType) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#004d91';
      default:
        return '#027aea';
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #1a1f71 0%, #006fcf 100%)',
        padding: '40px 20px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(26, 31, 113, 0.3)'
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
          Card Management
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Manage your debit and credit cards
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={24} style={{ marginBottom: '32px' }}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', borderRadius: '16px' }}>
            <Statistic
              title="Total Cards"
              value={cards.length}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', borderRadius: '16px' }}>
            <Statistic
              title="Active Cards"
              value={cards.filter(card => card.status === 'active').length}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', borderRadius: '16px' }}>
            <Statistic
              title="Card Types"
              value={new Set(cards.map(card => card.cardType)).size}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Bar */}
      <div style={{ marginBottom: '24px', textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
          style={{
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            border: 'none',
            fontWeight: '600'
          }}
        >
          Add New Card
        </Button>
      </div>

      {/* Cards List */}
      {cards.length === 0 ? (
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
            padding: '40px'
          }}
        >
          <CreditCardOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
            No cards added yet
          </Title>
          <Text style={{ color: '#999' }}>
            Add your first card to start managing your payment methods
          </Text>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {cards.map(card => (
            <Card
              key={card.id}
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                position: 'relative',
                background: `linear-gradient(135deg, ${getCardTypeColor(card.cardType)} 0%, ${getCardTypeColor(card.cardType)}dd 100%)`,
                color: 'white'
              }}
              bodyStyle={{ padding: '24px' }}
              actions={[
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => showDetailsModal(card)}
                  key="details"
                  style={{ color: 'white' }}
                >
                  Details
                </Button>,
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => showModal(card)}
                  key="edit"
                  style={{ color: 'white' }}
                >
                  Edit
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteCard(card.id)}
                  key="delete"
                  style={{ color: 'white' }}
                >
                  Delete
                </Button>
              ]}
            >
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <Title level={4} style={{ margin: 0, color: 'white' }}>
                    {card.cardName}
                  </Title>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Tag color={card.status === 'active' ? 'green' : card.status === 'frozen' ? 'orange' : 'red'} style={{ margin: 0 }}>
                      {card.status}
                    </Tag>
                    {card.contactlessEnabled && <Tag color="blue">Contactless</Tag>}
                  </div>
                </div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {card.cardholderName} • {card.cardType.toUpperCase()} •••• {card.lastFour}
                </Text>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                  Card Number
                </Text>
                <br />
                <Text style={{ color: 'white', fontSize: '16px', fontFamily: 'monospace' }}>
                  {card.maskedNumber}
                </Text>
              </div>

              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <div>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                      Expires
                    </Text>
                    <br />
                    <Text style={{ color: 'white' }}>
                      {card.expiryMonth}/{card.expiryYear}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'right' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                      Daily Limit
                    </Text>
                    <br />
                    <Text style={{ color: 'white' }}>
                      ${card.dailyLimit?.toLocaleString() || '1,000'}
                    </Text>
                  </div>
                </Col>
              </Row>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                    Card Type
                  </Text>
                  <br />
                  <Text style={{ color: 'white', fontSize: '18px' }}>
                    {getCardTypeIcon(card.cardType)}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {card.onlinePurchases && <Tag size="small" color="green">Online</Tag>}
                    {card.international && <Tag size="small" color="blue">Intl</Tag>}
                    {card.atmWithdrawals && <Tag size="small" color="orange">ATM</Tag>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Card Modal */}
      <Modal
        title={editingCard ? "Edit Card" : "Add New Card"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="basic" type="card">
            <Tabs.TabPane tab="Basic Information" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="cardName"
                    label="Card Name"
                    rules={[{ required: true, message: 'Please enter a card name' }]}
                  >
                    <Input placeholder="e.g., My Visa Card" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="cardholderName"
                    label="Cardholder Name"
                    rules={[{ required: true, message: 'Please enter cardholder name' }]}
                  >
                    <Input placeholder="John Doe" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="cardNumber"
                label="Card Number"
                rules={[
                  { required: true, message: 'Please enter card number' },
                  { validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!isValidCardNumber(value)) {
                      return Promise.reject('Please enter a valid card number');
                    }
                    return Promise.resolve();
                  }}
                ]}
              >
                <Input
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  onChange={(e) => {
                    // Auto-format card number with spaces
                    const value = e.target.value.replace(/\s+/g, '');
                    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    form.setFieldsValue({ cardNumber: formatted });
                  }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="cvv"
                    label="CVV"
                    rules={[
                      { required: true, message: 'Please enter CVV' },
                      { validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const cardType = detectCardType(form.getFieldValue('cardNumber') || '');
                        if (!isValidCVV(value, cardType)) {
                          return Promise.reject(`Please enter a valid ${cardType === 'amex' ? '4-digit' : '3-digit'} CVV`);
                        }
                        return Promise.resolve();
                      }}
                    ]}
                  >
                    <Input
                      placeholder="123"
                      maxLength={4}
                      type="password"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="expiryMonth"
                    label="Expiry Month"
                    rules={[{ required: true, message: 'Please select expiry month' }]}
                  >
                    <Select placeholder="Month">
                      {Array.from({ length: 12 }, (_, i) => (
                        <Option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="expiryYear"
                    label="Expiry Year"
                    rules={[{ required: true, message: 'Please select expiry year' }]}
                  >
                    <Select placeholder="Year">
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <Option key={year} value={String(year)}>
                            {year}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="frozen">Frozen</Option>
                  <Option value="blocked">Blocked</Option>
                </Select>
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Billing Address" key="address">
              <Form.Item
                name="billingAddress"
                label="Street Address"
                rules={[{ required: true, message: 'Please enter billing address' }]}
              >
                <Input placeholder="123 Main Street" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="billingCity"
                    label="City"
                    rules={[{ required: true, message: 'Please enter city' }]}
                  >
                    <Input placeholder="New York" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="billingState"
                    label="State/Province"
                    rules={[{ required: true, message: 'Please enter state' }]}
                  >
                    <Input placeholder="NY" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="billingZipCode"
                    label="ZIP/Postal Code"
                    rules={[{ required: true, message: 'Please enter ZIP code' }]}
                  >
                    <Input placeholder="10001" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="billingCountry"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select placeholder="Select country">
                  <Option value="US">United States</Option>
                  <Option value="CA">Canada</Option>
                  <Option value="UK">United Kingdom</Option>
                  <Option value="AU">Australia</Option>
                  <Option value="DE">Germany</Option>
                  <Option value="FR">France</Option>
                  <Option value="JP">Japan</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Limits & Security" key="limits">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="dailyLimit"
                    label="Daily Spending Limit"
                    rules={[{ required: true, message: 'Please set daily limit' }]}
                  >
                    <InputNumber
                      prefix="$"
                      min={0}
                      max={10000}
                      step={50}
                      placeholder="1000"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="monthlyLimit"
                    label="Monthly Spending Limit"
                    rules={[{ required: true, message: 'Please set monthly limit' }]}
                  >
                    <InputNumber
                      prefix="$"
                      min={0}
                      max={50000}
                      step={500}
                      placeholder="5000"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Card Controls</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="onlinePurchases"
                    label="Online Purchases"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="international"
                    label="International Transactions"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="atmWithdrawals"
                    label="ATM Withdrawals"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="contactlessEnabled"
                label="Contactless Payments"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Tabs.TabPane>
          </Tabs>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
            <Button onClick={handleCancel} style={{ marginRight: '8px' }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                border: 'none'
              }}
            >
              {editingCard ? 'Update Card' : 'Add Card'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Card Details Modal */}
      <Modal
        title="Card Details"
        open={isDetailsModalVisible}
        onCancel={handleDetailsCancel}
        footer={[
          <Button key="edit" type="primary" onClick={() => { handleDetailsCancel(); showModal(viewingCard); }}>
            Edit Card
          </Button>,
          <Button key="close" onClick={handleDetailsCancel}>
            Close
          </Button>
        ]}
        width={600}
      >
        {viewingCard && (
          <div>
            <Descriptions title="Card Information" bordered column={2}>
              <Descriptions.Item label="Card Name">{viewingCard.cardName}</Descriptions.Item>
              <Descriptions.Item label="Cardholder Name">{viewingCard.cardholderName}</Descriptions.Item>
              <Descriptions.Item label="Card Number">{viewingCard.maskedNumber}</Descriptions.Item>
              <Descriptions.Item label="Card Type">{viewingCard.cardType?.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Expiry Date">{viewingCard.expiryMonth}/{viewingCard.expiryYear}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={viewingCard.status === 'active' ? 'green' : viewingCard.status === 'frozen' ? 'orange' : 'red'}>
                  {viewingCard.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Billing Address" bordered column={1}>
              <Descriptions.Item label="Street Address">{viewingCard.billingAddress}</Descriptions.Item>
              <Descriptions.Item label="City">{viewingCard.billingCity}</Descriptions.Item>
              <Descriptions.Item label="State/Province">{viewingCard.billingState}</Descriptions.Item>
              <Descriptions.Item label="ZIP/Postal Code">{viewingCard.billingZipCode}</Descriptions.Item>
              <Descriptions.Item label="Country">{viewingCard.billingCountry}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Limits & Controls" bordered column={2}>
              <Descriptions.Item label="Daily Limit">${viewingCard.dailyLimit?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Monthly Limit">${viewingCard.monthlyLimit?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Online Purchases">
                <Tag color={viewingCard.onlinePurchases ? 'green' : 'red'}>
                  {viewingCard.onlinePurchases ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="International Transactions">
                <Tag color={viewingCard.international ? 'green' : 'red'}>
                  {viewingCard.international ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ATM Withdrawals">
                <Tag color={viewingCard.atmWithdrawals ? 'green' : 'red'}>
                  {viewingCard.atmWithdrawals ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Contactless Payments">
                <Tag color={viewingCard.contactlessEnabled ? 'green' : 'red'}>
                  {viewingCard.contactlessEnabled ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Security & History" bordered column={1}>
              <Descriptions.Item label="Date Added">{new Date(viewingCard.createdAt).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Last 4 Digits">•••• {viewingCard.lastFour}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Cards;
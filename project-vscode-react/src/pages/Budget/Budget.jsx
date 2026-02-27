import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Progress, message, Avatar, List, Modal, Select, Divider, Statistic, Row, Col, Alert, InputNumber } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { PieChartOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, AlertOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function Budget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form] = Form.useForm();

  // Load budgets from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedBudgets = localStorage.getItem(`budgets_${user.id}`);
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets)); // eslint-disable-line react-hooks/set-state-in-effect
      }
    }
  }, [user?.id]);

  // Save budgets to localStorage
  useEffect(() => {
    if (user?.id && budgets.length >= 0) {
      localStorage.setItem(`budgets_${user.id}`, JSON.stringify(budgets));
    }
  }, [budgets, user?.id]);

  const showModal = (budget = null) => {
    setEditingBudget(budget);
    if (budget) {
      form.setFieldsValue(budget);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBudget(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const budgetData = {
      ...values,
      id: editingBudget ? editingBudget.id : Date.now(),
      spent: editingBudget ? editingBudget.spent : 0,
      createdAt: editingBudget ? editingBudget.createdAt : new Date().toISOString()
    };

    if (editingBudget) {
      setBudgets(budgets.map(budget => budget.id === editingBudget.id ? budgetData : budget));
      message.success('Budget updated successfully!');
    } else {
      setBudgets([...budgets, budgetData]);
      message.success('Budget created successfully!');
    }

    setIsModalVisible(false);
    setEditingBudget(null);
    form.resetFields();
  };

  const deleteBudget = (budgetId) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
    message.success('Budget deleted successfully!');
  };

  const addSpending = (budgetId, amount) => {
    setBudgets(budgets.map(budget => {
      if (budget.id === budgetId) {
        return { ...budget, spent: budget.spent + amount };
      }
      return budget;
    }));
    message.success(`Added $${amount.toLocaleString()} to spending!`);
  };

  const getBudgetStatus = (budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: '#ff4d4f', text: 'Over Budget' };
    if (percentage >= 80) return { status: 'warning', color: '#faad14', text: 'Near Limit' };
    return { status: 'good', color: '#52c41a', text: 'On Track' };
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const quickSpendAmounts = [10, 25, 50, 100];

  const budgetCategories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #7c08a6 0%, #f335d9 100%)',
        padding: '40px 20px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(168, 237, 234, 0.3)'
      }}>
        <Avatar
          size={80}
          icon={<PieChartOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          Budget Planning
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Track your spending and stay within your budget
        </Text>
      </div>

      {/* Budget Overview */}
      <Row gutter={24} style={{ marginBottom: '32px' }}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', borderRadius: '16px' }}>
            <Statistic
              title="Total Budget"
              value={totalBudget}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', borderRadius: '16px' }}>
            <Statistic
              title="Total Spent"
              value={totalSpent}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', borderRadius: '16px' }}>
            <Statistic
              title="Remaining"
              value={totalRemaining}
              prefix={<DollarOutlined />}
              valueStyle={{ color: totalRemaining >= 0 ? '#52c41a' : '#ff4d4f' }}
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
          Create New Budget
        </Button>
      </div>

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
            padding: '40px'
          }}
        >
          <PieChartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
            No budgets created yet
          </Title>
          <Text style={{ color: '#999' }}>
            Create your first budget to start tracking your spending
          </Text>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {budgets.map(budget => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const status = getBudgetStatus(budget);
            const remaining = budget.limit - budget.spent;

            return (
              <Card
                key={budget.id}
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  position: 'relative'
                }}
                bodyStyle={{ padding: '24px' }}
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showModal(budget)}
                    key="edit"
                  >
                    Edit
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteBudget(budget.id)}
                    key="delete"
                  >
                    Delete
                  </Button>
                ]}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <Title level={4} style={{ margin: 0 }}>{budget.name}</Title>
                    <span style={{
                      background: status.color === '#52c41a' ? '#f6ffed' : status.color === '#faad14' ? '#fffbe6' : '#fff2f0',
                      color: status.color,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {status.text}
                    </span>
                  </div>
                  <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                    {budget.category}
                  </Paragraph>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>Budget Usage</Text>
                    <Text strong>{percentage.toFixed(1)}%</Text>
                  </div>
                  <Progress
                    percent={percentage}
                    showInfo={false}
                    strokeColor={status.color}
                    trailColor="#f0f0f0"
                    strokeWidth={8}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <Text type="secondary">Spent</Text>
                    <br />
                    <Text strong style={{ color: '#faad14' }}>
                      ${budget.spent.toFixed(2)}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary">Limit</Text>
                    <br />
                    <Text strong>
                      ${budget.limit.toFixed(2)}
                    </Text>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Text type="secondary">Remaining: </Text>
                  <Text strong style={{ color: remaining >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    ${remaining.toFixed(2)}
                  </Text>
                </div>

                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Quick Add Spending:</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {quickSpendAmounts.map(amount => (
                      <Button
                        key={amount}
                        size="small"
                        onClick={() => addSpending(budget.id, amount)}
                        style={{
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        +${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {percentage >= 90 && (
                  <Alert
                    message="Budget Alert"
                    description={`You've used ${percentage.toFixed(1)}% of your ${budget.category} budget.`}
                    type={percentage >= 100 ? 'error' : 'warning'}
                    showIcon
                    style={{ marginTop: '16px' }}
                  />
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Budget Modal */}
      <Modal
        title={editingBudget ? "Edit Budget" : "Create New Budget"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Budget Name"
            rules={[{ required: true, message: 'Please enter a budget name' }]}
          >
            <Input placeholder="e.g., Monthly Groceries, Entertainment" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select a spending category">
              {budgetCategories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="limit"
            label="Monthly Limit"
            rules={[{ required: true, message: 'Please enter a budget limit' }]}
          >
            <Input
              type="number"
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <Input.TextArea
              placeholder="Add notes about this budget..."
              rows={3}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
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
              {editingBudget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Budget;
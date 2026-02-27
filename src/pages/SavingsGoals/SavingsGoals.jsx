import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Progress, message, Avatar, List, Modal, Form, Select, DatePicker } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { AimOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function SavingsGoals() {
  const { user, updateBalance } = useAuth();
  const [goals, setGoals] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form] = Form.useForm();

  const balance = user?.balance || 0;

  // Load goals from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedGoals = localStorage.getItem(`savings_goals_${user.id}`);
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals)); // eslint-disable-line react-hooks/set-state-in-effect
      }
    }
  }, [user?.id]);

  // Save goals to localStorage
  useEffect(() => {
    if (user?.id && goals.length >= 0) {
      localStorage.setItem(`savings_goals_${user.id}`, JSON.stringify(goals));
    }
  }, [goals, user?.id]);

  const showModal = (goal = null) => {
    setEditingGoal(goal);
    if (goal) {
      form.setFieldsValue({
        ...goal,
        targetDate: goal.targetDate ? dayjs(goal.targetDate) : null
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingGoal(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const goalData = {
      ...values,
      id: editingGoal ? editingGoal.id : Date.now(),
      targetDate: values.targetDate ? values.targetDate.format('YYYY-MM-DD') : null,
      currentAmount: editingGoal ? editingGoal.currentAmount : 0,
      createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString()
    };

    if (editingGoal) {
      setGoals(goals.map(goal => goal.id === editingGoal.id ? goalData : goal));
      message.success('Goal updated successfully!');
    } else {
      setGoals([...goals, goalData]);
      message.success('Goal created successfully!');
    }

    setIsModalVisible(false);
    setEditingGoal(null);
    form.resetFields();
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    message.success('Goal deleted successfully!');
  };

  const contributeToGoal = (goalId, amount) => {
    if (amount > balance) {
      message.error('Insufficient balance');
      return;
    }

    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = goal.currentAmount + amount;
        return { ...goal, currentAmount: newAmount };
      }
      return goal;
    }));

    // Update balance
    updateBalance(balance - amount);
    message.success(`Contributed $${amount.toLocaleString()} to goal!`);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#52c41a';
    if (percentage >= 75) return '#1890ff';
    if (percentage >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const getGoalStatus = (goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    if (percentage >= 100) return { status: 'completed', color: 'success', text: 'Completed' };
    if (goal.targetDate && new Date(goal.targetDate) < new Date()) {
      return { status: 'overdue', color: 'error', text: 'Overdue' };
    }
    return { status: 'active', color: 'processing', text: 'Active' };
  };

  const quickAmounts = [50, 100, 250, 500];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #a504aa 0%, #eb1bc2 100%)',
        padding: '40px 20px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(168, 237, 234, 0.3)'
      }}>
        <Avatar
          size={80}
          icon={<AimOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          Savings Goals
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Set and track your financial goals
        </Text>
      </div>

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
          Create New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
            padding: '40px'
          }}
        >
          <AimOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
            No savings goals yet
          </Title>
          <Text style={{ color: '#999' }}>
            Create your first savings goal to start building wealth
          </Text>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {goals.map(goal => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const status = getGoalStatus(goal);
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <Card
                key={goal.id}
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
                    onClick={() => showModal(goal)}
                    key="edit"
                  >
                    Edit
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteGoal(goal.id)}
                    key="delete"
                  >
                    Delete
                  </Button>
                ]}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <Title level={4} style={{ margin: 0 }}>{goal.name}</Title>
                    <span style={{
                      background: status.color === 'success' ? '#f6ffed' : status.color === 'error' ? '#fff2f0' : '#e6f7ff',
                      color: status.color === 'success' ? '#52c41a' : status.color === 'error' ? '#ff4d4f' : '#1890ff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {status.text}
                    </span>
                  </div>
                  <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                    {goal.description}
                  </Paragraph>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>Progress</Text>
                    <Text strong>{percentage.toFixed(1)}%</Text>
                  </div>
                  <Progress
                    percent={percentage}
                    showInfo={false}
                    strokeColor={getProgressColor(percentage)}
                    trailColor="#f0f0f0"
                    strokeWidth={8}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <Text type="secondary">Saved</Text>
                    <br />
                    <Text strong style={{ color: '#52c41a' }}>
                      ${goal.currentAmount.toLocaleString()}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary">Target</Text>
                    <br />
                    <Text strong>
                      ${goal.targetAmount.toLocaleString()}
                    </Text>
                  </div>
                </div>

                {remaining > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary">Remaining: </Text>
                    <Text strong style={{ color: '#ff4d4f' }}>
                      ${remaining.toLocaleString()}
                    </Text>
                  </div>
                )}

                {goal.targetDate && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary">Target Date: </Text>
                    <Text>{new Date(goal.targetDate).toLocaleDateString()}</Text>
                  </div>
                )}

                {percentage < 100 && (
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>Quick Contribute:</Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {quickAmounts.map(amount => (
                        <Button
                          key={amount}
                          size="small"
                          onClick={() => contributeToGoal(goal.id, amount)}
                          disabled={amount > balance}
                          style={{
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {percentage >= 100 && (
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '8px' }} />
                    <Text strong style={{ color: '#52c41a' }}>Goal Achieved!</Text>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      <Modal
        title={editingGoal ? "Edit Savings Goal" : "Create New Savings Goal"}
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
            label="Goal Name"
            rules={[{ required: true, message: 'Please enter a goal name' }]}
          >
            <Input placeholder="e.g., Emergency Fund, Vacation, New Car" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea
              placeholder="Describe your savings goal..."
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="targetAmount"
            label="Target Amount"
            rules={[{ required: true, message: 'Please enter target amount' }]}
          >
            <Input
              type="number"
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="targetDate"
            label="Target Date (Optional)"
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select a category">
              <Option value="emergency">Emergency Fund</Option>
              <Option value="vacation">Vacation</Option>
              <Option value="car">Car Purchase</Option>
              <Option value="house">House Down Payment</Option>
              <Option value="education">Education</Option>
              <Option value="retirement">Retirement</Option>
              <Option value="investment">Investment</Option>
              <Option value="other">Other</Option>
            </Select>
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
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SavingsGoals;
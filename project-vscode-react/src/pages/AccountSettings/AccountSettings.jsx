import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Avatar, Upload, Divider, Switch, Select } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUser(values);
    message.success('Profile updated successfully!');
    setLoading(false);
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    message.success('Password changed successfully!');
    setLoading(false);
  };

  const handleNotificationSettings = () => {
    // In a real app, this would update user preferences
    message.success('Notification settings updated!');
  };

  const uploadProps = {
    name: 'avatar',
    listType: 'picture-card',
    className: 'avatar-uploader',
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
      }
      return isJpgOrPng && isLt2M;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success('Avatar uploaded successfully');
      }
    },
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 0' }}>
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
          icon={<UserOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          Account Settings
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Manage your account preferences and security
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        {/* Profile Information */}
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
            Profile Information
          </Title>

          {/* Avatar Upload */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Upload {...uploadProps}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ marginTop: '8px' }}>
                <UploadOutlined /> Change Avatar
              </div>
            </Upload>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={user}
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input prefix={<UserOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
            >
              <Input prefix={<PhoneOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
            >
              <Input.TextArea rows={3} placeholder="Enter your address" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: '600'
                }}
              >
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Security Settings */}
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
            Security Settings
          </Title>

          <Form layout="vertical" onFinish={handleChangePassword}>
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                danger
                size="large"
                style={{
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Notification Preferences */}
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
            Notification Preferences
          </Title>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Email Notifications</Text>
                <br />
                <Text type="secondary">Receive transaction alerts via email</Text>
              </div>
              <Switch defaultChecked onChange={(checked) => handleNotificationSettings({ email: checked })} />
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>SMS Notifications</Text>
                <br />
                <Text type="secondary">Receive transaction alerts via SMS</Text>
              </div>
              <Switch defaultChecked onChange={(checked) => handleNotificationSettings({ sms: checked })} />
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Low Balance Alerts</Text>
                <br />
                <Text type="secondary">Get notified when balance is low</Text>
              </div>
              <Switch defaultChecked onChange={(checked) => handleNotificationSettings({ lowBalance: checked })} />
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Marketing Emails</Text>
                <br />
                <Text type="secondary">Receive promotional offers and updates</Text>
              </div>
              <Switch onChange={(checked) => handleNotificationSettings({ marketing: checked })} />
            </div>
          </div>
        </Card>

        {/* Account Preferences */}
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
            Account Preferences
          </Title>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Default Currency</Text>
              <Select defaultValue="usd" style={{ width: '100%' }} size="large">
                <Option value="usd">USD - US Dollar</Option>
                <Option value="eur">EUR - Euro</Option>
                <Option value="gbp">GBP - British Pound</Option>
                <Option value="cad">CAD - Canadian Dollar</Option>
              </Select>
            </div>

            <Divider />

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Language</Text>
              <Select defaultValue="en" style={{ width: '100%' }} size="large">
                <Option value="en">English</Option>
                <Option value="es">Español</Option>
                <Option value="fr">Français</Option>
                <Option value="de">Deutsch</Option>
              </Select>
            </div>

            <Divider />

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Theme</Text>
              <Select defaultValue="light" style={{ width: '100%' }} size="large">
                <Option value="light">Light</Option>
                <Option value="dark">Dark</Option>
                <Option value="auto">Auto (System)</Option>
              </Select>
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Two-Factor Authentication</Text>
                <br />
                <Text type="secondary">Add an extra layer of security</Text>
              </div>
              <Switch onChange={(checked) => message.info(checked ? '2FA enabled' : '2FA disabled')} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AccountSettings;
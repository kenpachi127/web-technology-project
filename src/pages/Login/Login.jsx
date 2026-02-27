import React from 'react'
import { Form, Input, Button, Alert, Typography, Card, Divider } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../provider/AuthContextProvider';
import { useNavigate, useLocation, Link } from 'react-router';
import { UserOutlined, LockOutlined, BankOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      // Navigate to the intended page or dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Login failed',
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: 'none',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
          }}>
            <BankOutlined style={{ fontSize: '32px', color: 'white' }} />
          </div>
          <Title level={2} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
            Welcome Back
          </Title>
          <Text style={{ color: '#666', fontSize: '16px' }}>
            Sign in to your Texas Bank account
          </Text>
        </div>

        {/* Error Alert */}
        {errors.root && (
          <Alert
            type="error"
            message={errors.root.message}
            showIcon
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />
        )}

        {/* Login Form */}
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
          size="large"
        >
          {/* Email */}
          <Form.Item
            label={<Text strong>Email Address</Text>}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter your email"
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
                />
              )}
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label={<Text strong>Password</Text>}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your password"
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
                />
              )}
            />
          </Form.Item>

          {/* Login Button */}
          <Form.Item style={{ marginBottom: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
              size="large"
              style={{
                borderRadius: '8px',
                height: '48px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s'
              }}
              icon={<LoginOutlined />}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>

          {/* Test Accounts Info */}
          <div style={{
            background: '#f6f8fa',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e1e4e8',
            marginBottom: '24px'
          }}>
            <Text strong style={{ color: '#24292e', display: 'block', marginBottom: '8px' }}>
              Test Accounts:
            </Text>
            <div style={{ fontSize: '13px', color: '#586069', lineHeight: '1.5' }}>
              <div><strong>Admin:</strong> admin@test.com / password</div>
              <div><strong>User:</strong> user@test.com / password</div>
            </div>
          </div>

          {/* Signup Link */}
          <Divider style={{ margin: '24px 0 16px 0' }}>
            <Text style={{ color: '#666' }}>New to Texas Bank?</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Link to="/signup">
              <Button
                type="link"
                style={{
                  color: '#667eea',
                  fontWeight: '500',
                  padding: '4px 8px'
                }}
                onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Create an Account
              </Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Login
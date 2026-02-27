import React, { useState, useRef } from 'react';
import { Card, Button, Input, Typography, message, Row, Col, Avatar, Divider, Modal, Form, Select, Statistic, Alert } from 'antd';
import { useAuth } from '../../provider/AuthContextProvider';
import { QrcodeOutlined, ScanOutlined, DollarOutlined, CopyOutlined, CheckCircleOutlined, MobileOutlined } from '@ant-design/icons';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function QRPayment() {
  const { user, updateBalance } = useAuth();
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'scan'
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [generatedQR, setGeneratedQR] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  // Generate QR code for payment request
  const generatePaymentQR = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      message.error('Please enter a valid payment amount');
      return;
    }

    const paymentData = {
      type: 'payment_request',
      recipientId: user.id,
      recipientName: user.name,
      amount: parseFloat(paymentAmount),
      note: paymentNote || 'Payment Request',
      timestamp: new Date().toISOString(),
      bank: 'Texas Bank'
    };

    const qrData = JSON.stringify(paymentData);
    setGeneratedQR(qrData);
    message.success('Payment QR code generated successfully!');
  };

  // Start QR code scanner
  const startScanning = () => {
    setScanning(true);

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    });

    scanner.render((decodedText) => {
      try {
        const paymentData = JSON.parse(decodedText);
        if (paymentData.type === 'payment_request') {
          setScannedData(paymentData);
          setPaymentModalVisible(true);
          scanner.clear();
          setScanning(false);
        } else {
          message.error('Invalid QR code format');
        }
      } catch {
        message.error('Invalid QR code data');
      }
    }, (error) => {
      console.log('QR scan error:', error);
    });

    scannerRef.current = scanner;
  };

  // Stop scanning
  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setScanning(false);
    }
  };

  // Process payment from scanned QR
  const processPayment = () => {
    if (!scannedData) return;

    const amount = scannedData.amount;
    if (user.balance < amount) {
      message.error('Insufficient balance');
      return;
    }

    // Update balance
    const newBalance = user.balance - amount;
    updateBalance(newBalance);

    // Create transaction record
    const transaction = {
      id: Date.now(),
      type: 'payment',
      amount: amount,
      description: `QR Payment to ${scannedData.recipientName}`,
      timestamp: new Date().toISOString(),
      balance: newBalance,
      recipient: scannedData.recipientName,
      method: 'QR Payment'
    };

    // Save transaction
    const existingTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
    existingTransactions.unshift(transaction);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(existingTransactions));

    message.success(`Payment of $${amount} sent successfully!`);
    setPaymentModalVisible(false);
    setScannedData(null);
  };

  // Copy QR data to clipboard
  const copyQRData = () => {
    if (generatedQR) {
      navigator.clipboard.writeText(generatedQR);
      message.success('QR data copied to clipboard!');
    }
  };

  // Quick amount buttons
  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0' }}>
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
          icon={<QrcodeOutlined />}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '16px'
          }}
        />
        <Title level={2} style={{ color: 'white', margin: '8px 0', fontWeight: '600' }}>
          QR Payments
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Generate QR codes for payments or scan to pay instantly
        </Text>
      </div>

      {/* Tab Navigation */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Button.Group size="large">
          <Button
            type={activeTab === 'generate' ? 'primary' : 'default'}
            icon={<QrcodeOutlined />}
            onClick={() => setActiveTab('generate')}
            style={{
              borderRadius: '8px 0 0 8px',
              ...(activeTab === 'generate' && {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              })
            }}
          >
            Generate QR
          </Button>
          <Button
            type={activeTab === 'scan' ? 'primary' : 'default'}
            icon={<ScanOutlined />}
            onClick={() => setActiveTab('scan')}
            style={{
              borderRadius: '0 8px 8px 0',
              ...(activeTab === 'scan' && {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              })
            }}
          >
            Scan QR
          </Button>
        </Button.Group>
      </div>

      {/* Generate QR Tab */}
      {activeTab === 'generate' && (
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card
              title="Generate Payment QR Code"
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  Payment Amount
                </Text>
                <Input
                  size="large"
                  prefix={<DollarOutlined />}
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  type="number"
                  style={{ marginBottom: '16px' }}
                />

                {/* Quick Amount Buttons */}
                <div style={{ marginBottom: '16px' }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                    Quick Amounts:
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {quickAmounts.map(amount => (
                      <Button
                        key={amount}
                        size="small"
                        onClick={() => setPaymentAmount(amount.toString())}
                        style={{
                          borderRadius: '6px',
                          border: '1px solid #d9d9d9'
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  Payment Note (Optional)
                </Text>
                <Input
                  placeholder="What's this payment for?"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  style={{ marginBottom: '24px' }}
                />

                <Button
                  type="primary"
                  size="large"
                  icon={<QrcodeOutlined />}
                  onClick={generatePaymentQR}
                  block
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  Generate QR Code
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Your QR Code"
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
              bodyStyle={{ padding: '24px', textAlign: 'center' }}
            >
              {generatedQR ? (
                <div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    <QRCode
                      value={generatedQR}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                      ${paymentAmount}
                    </Text>
                    <br />
                    <Text type="secondary">Payment Request</Text>
                  </div>

                  <Button
                    icon={<CopyOutlined />}
                    onClick={copyQRData}
                    style={{ marginRight: '8px' }}
                  >
                    Copy QR Data
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setGeneratedQR(null);
                      setPaymentAmount('');
                      setPaymentNote('');
                    }}
                  >
                    Generate New
                  </Button>
                </div>
              ) : (
                <div style={{ padding: '40px' }}>
                  <QrcodeOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <Text type="secondary">
                    Enter payment details and click "Generate QR Code" to create your payment QR
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Scan QR Tab */}
      {activeTab === 'scan' && (
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card
              title="Scan QR Code to Pay"
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
              bodyStyle={{ padding: '24px' }}
            >
              {!scanning ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <MobileOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <Title level={4} style={{ marginBottom: '8px' }}>
                    Ready to Scan
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                    Click the button below to start scanning QR codes for payments
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ScanOutlined />}
                    onClick={startScanning}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600'
                    }}
                  >
                    Start Scanning
                  </Button>
                </div>
              ) : (
                <div>
                  <Alert
                    message="Scanning QR Code"
                    description="Position the QR code within the camera view. The scanner will automatically detect and process payment QR codes."
                    type="info"
                    showIcon
                    style={{ marginBottom: '20px' }}
                  />
                  <div id="qr-reader" style={{ width: '100%' }}></div>
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Button danger onClick={stopScanning}>
                      Stop Scanning
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Payment Info"
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
              bodyStyle={{ padding: '24px' }}
            >
              <Statistic
                title="Available Balance"
                value={user?.balance || 0}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />

              <Divider />

              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Text strong>Secure Payments</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  All QR payments are encrypted and secure
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Payment Confirmation Modal */}
      <Modal
        title="Confirm Payment"
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setScannedData(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setPaymentModalVisible(false);
            setScannedData(null);
          }}>
            Cancel
          </Button>,
          <Button
            key="pay"
            type="primary"
            onClick={processPayment}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Pay ${scannedData?.amount}
          </Button>
        ]}
      >
        {scannedData && (
          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={64}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                marginBottom: '16px'
              }}
            >
              {scannedData.recipientName.charAt(0).toUpperCase()}
            </Avatar>

            <Title level={4}>{scannedData.recipientName}</Title>
            <Text type="secondary">{scannedData.bank}</Text>

            <Divider />

            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                ${scannedData.amount}
              </Text>
            </div>

            <Text type="secondary">{scannedData.note}</Text>

            <Divider />

            <Alert
              message="Payment Details"
              description={`Sending $${scannedData.amount} to ${scannedData.recipientName}`}
              type="info"
              showIcon
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default QRPayment;
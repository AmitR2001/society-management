import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [society, setSociety] = useState(null);
  const [activeTab, setActiveTab] = useState('bills');
  const [generateForm, setGenerateForm] = useState({ month: '', dueDate: '' });
  const [paymentSettingsForm, setPaymentSettingsForm] = useState({
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    qrCodeUrl: ''
  });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const loadBills = async () => {
    const { data } = await api.get('/bills');
    setBills(data);
  };

  const loadPayments = async () => {
    const { data } = await api.get('/bills/payments');
    setPayments(data);
  };

  const loadSociety = async () => {
    try {
      const { data } = await api.get('/societies/me');
      setSociety(data);
      if (data.paymentDetails) {
        setPaymentSettingsForm({
          upiId: data.paymentDetails.upiId || '',
          bankName: data.paymentDetails.bankName || '',
          accountNumber: data.paymentDetails.accountNumber || '',
          ifscCode: data.paymentDetails.ifscCode || '',
          accountHolderName: data.paymentDetails.accountHolderName || '',
          qrCodeUrl: data.paymentDetails.qrCodeUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to load society');
    }
  };

  useEffect(() => {
    loadBills();
    loadPayments();
    loadSociety();
  }, []);

  const payNow = (bill) => {
    setSelectedBillForPayment(bill);
  };

  const generateBills = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/bills/generate', generateForm);
      setSuccess(`Generated ${data.length} bills for ${generateForm.month}`);
      setGenerateForm({ month: '', dueDate: '' });
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate bills');
    } finally {
      setLoading(false);
    }
  };

  const viewReceipt = async (paymentId) => {
    try {
      const { data } = await api.get(`/bills/receipt/${paymentId}`);
      setSelectedReceipt(data);
    } catch (err) {
      setError('Failed to load receipt');
    }
  };

  const markPaidCash = async (billId) => {
    if (!window.confirm('Mark this bill as paid by cash?')) return;
    setError('');
    try {
      await api.patch(`/bills/${billId}/mark-paid-cash`);
      setSuccess('Bill marked as paid (cash)');
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const cancelBill = async (billId) => {
    const reason = window.prompt('Enter reason for cancellation (optional):');
    if (reason === null) return;
    setError('');
    try {
      await api.patch(`/bills/${billId}/cancel`, { reason });
      setSuccess('Bill cancelled');
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel bill');
    }
  };

  const updatePaymentSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await api.patch('/societies/me', { paymentDetails: paymentSettingsForm });
      setSuccess('Payment details updated successfully');
      loadSociety();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleQrCodeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 500000) {
      setError('QR code image must be less than 500KB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentSettingsForm({...paymentSettingsForm, qrCodeUrl: reader.result});
    };
    reader.readAsDataURL(file);
  };

  const hasPaymentDetails = society?.paymentDetails && (
    society.paymentDetails.upiId || 
    society.paymentDetails.accountNumber || 
    society.paymentDetails.qrCodeUrl
  );

  const getStatusBadge = (status) => {
    const colors = { 
      Pending: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', 
      Paid: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
      PaidCash: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
      Overdue: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
      Cancelled: 'linear-gradient(135deg, #a8a8a8 0%, #6c757d 100%)' 
    };
    const label = status === 'PaidCash' ? 'Paid (Cash)' : status;
    return <span style={{...styles.badge, background: colors[status] || '#6c757d'}}>{label}</span>;
  };

  const pendingBills = bills.filter(b => !['Paid', 'PaidCash', 'Cancelled'].includes(b.status));
  const paidBills = bills.filter(b => b.status === 'Paid' || b.status === 'PaidCash');
  const totalPending = pendingBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalCollected = paidBills.reduce((sum, b) => sum + b.totalAmount, 0);

  const tabs = [
    { id: 'bills', label: '📄 Bills', badge: pendingBills.length },
    { id: 'payments', label: '💳 Payment History' },
    ...(user?.role === 'Admin' ? [{ id: 'payment-settings', label: '⚙️ Payment Settings' }] : [])
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>💰 Maintenance & Billing</h2>
        <p style={styles.subtitle}>
          {user?.role === 'Admin' ? 'Generate and manage maintenance bills' : 'View and pay your maintenance bills'}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div style={styles.alert}>
          {error}
          <button style={styles.alertClose} onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div style={{...styles.alert, ...styles.alertSuccess}}>
          {success}
          <button style={styles.alertClose} onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Admin Stats & Generate Form */}
      {user?.role === 'Admin' && (
        <div style={styles.adminSection}>
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'}}>
              <span style={styles.statIcon}>⏳</span>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{pendingBills.length}</span>
                <span style={styles.statLabel}>Pending Bills</span>
              </div>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'}}>
              <span style={styles.statIcon}>✅</span>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{paidBills.length}</span>
                <span style={styles.statLabel}>Paid Bills</span>
              </div>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #475569 0%, #334155 100%)'}}>
              <span style={styles.statIcon}>💵</span>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>₹{totalCollected.toLocaleString()}</span>
                <span style={styles.statLabel}>Collected</span>
              </div>
            </div>
          </div>

          <div style={styles.generateCard}>
            <h5 style={styles.formTitle}>📋 Generate Monthly Bills</h5>
            <form onSubmit={generateBills} style={styles.generateForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Month</label>
                <input 
                  type="month" 
                  style={styles.input}
                  value={generateForm.month} 
                  onChange={(e) => setGenerateForm({...generateForm, month: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={generateForm.dueDate} 
                  onChange={(e) => setGenerateForm({...generateForm, dueDate: e.target.value})} 
                  required 
                />
              </div>
              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {loading ? '⏳ Generating...' : '📋 Generate Bills'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge > 0 && <span style={styles.tabBadge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div style={styles.tableCard}>
          {bills.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p style={styles.emptyText}>No bills found</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Month</th>
                    <th style={styles.th}>Flat</th>
                    {user?.role === 'Admin' && <th style={styles.th}>Resident</th>}
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Penalty</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Due Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill._id} style={styles.tr}>
                      <td style={styles.td}>{bill.month}</td>
                      <td style={styles.td}><span style={styles.flatBadge}>{bill.flat?.number || '-'}</span></td>
                      {user?.role === 'Admin' && <td style={styles.td}>{bill.resident?.fullName || '-'}</td>}
                      <td style={styles.td}>₹{bill.amount}</td>
                      <td style={{...styles.td, color: bill.latePenalty > 0 ? '#ef4444' : 'inherit'}}>
                        ₹{bill.latePenalty}
                      </td>
                      <td style={{...styles.td, fontWeight: '600'}}>₹{bill.totalAmount}</td>
                      <td style={styles.td}>{new Date(bill.dueDate).toLocaleDateString()}</td>
                      <td style={styles.td}>{getStatusBadge(bill.status)}</td>
                      <td style={styles.td}>
                        {bill.status === 'Cancelled' ? (
                          <span style={styles.mutedText}>Cancelled</span>
                        ) : bill.status === 'Paid' || bill.status === 'PaidCash' ? (
                          <span style={styles.successText}>✅ Paid</span>
                        ) : (
                          <div style={styles.actionBtns}>
                            {(user?.role === 'Resident' || user?.role === 'Admin') && (
                              <button 
                                style={styles.payBtn}
                                onClick={() => payNow(bill)}
                                disabled={loading}
                              >
                                💳 Pay
                              </button>
                            )}
                            {user?.role === 'Admin' && (
                              <>
                                <button 
                                  style={styles.cashBtn}
                                  onClick={() => markPaidCash(bill._id)}
                                  disabled={loading}
                                >
                                  💵 Cash
                                </button>
                                <button 
                                  style={styles.cancelBtn}
                                  onClick={() => cancelBill(bill._id)}
                                  disabled={loading}
                                >
                                  ❌
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div style={styles.tableCard}>
          {payments.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p style={styles.emptyText}>No payments found</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Receipt No</th>
                    <th style={styles.th}>Month</th>
                    <th style={styles.th}>Flat</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Paid On</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} style={styles.tr}>
                      <td style={styles.td}>
                        <code style={styles.receiptCode}>{payment.receiptNo}</code>
                      </td>
                      <td style={styles.td}>{payment.bill?.month || '-'}</td>
                      <td style={styles.td}><span style={styles.flatBadge}>{payment.bill?.flat?.number || '-'}</span></td>
                      <td style={{...styles.td, fontWeight: '600'}}>₹{payment.amount}</td>
                      <td style={styles.td}>{new Date(payment.updatedAt).toLocaleString()}</td>
                      <td style={styles.td}>
                        <button 
                          style={styles.viewBtn}
                          onClick={() => viewReceipt(payment._id)}
                        >
                          📄 View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Settings Tab */}
      {activeTab === 'payment-settings' && user?.role === 'Admin' && (
        <div style={styles.settingsCard}>
          <h5 style={styles.formTitle}>⚙️ Payment Details Configuration</h5>
          <p style={styles.settingsDesc}>
            Configure payment details that residents will see when they click "Pay".
          </p>
          <form onSubmit={updatePaymentSettings}>
            <div style={styles.settingsGrid}>
              <div style={styles.settingsColumn}>
                <h6 style={styles.sectionLabel}>📱 UPI Details</h6>
                <div style={styles.formGroup}>
                  <label style={styles.label}>UPI ID</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder="example@upi"
                    value={paymentSettingsForm.upiId}
                    onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, upiId: e.target.value})}
                  />
                </div>
                
                <h6 style={{...styles.sectionLabel, marginTop: '24px'}}>🏦 Bank Details</h6>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Bank Name</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder="e.g., State Bank of India"
                    value={paymentSettingsForm.bankName}
                    onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, bankName: e.target.value})}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Holder Name</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder="Society Name"
                    value={paymentSettingsForm.accountHolderName}
                    onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, accountHolderName: e.target.value})}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Number</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder="Account Number"
                    value={paymentSettingsForm.accountNumber}
                    onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, accountNumber: e.target.value})}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>IFSC Code</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder="IFSC Code"
                    value={paymentSettingsForm.ifscCode}
                    onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, ifscCode: e.target.value})}
                  />
                </div>
              </div>
              
              <div style={styles.settingsColumn}>
                <h6 style={styles.sectionLabel}>📱 QR Code</h6>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Upload QR Code Image</label>
                  <input 
                    type="file" 
                    style={styles.fileInput}
                    accept="image/*"
                    onChange={handleQrCodeUpload}
                  />
                  <small style={styles.helpText}>Max 500KB. JPG, PNG supported.</small>
                </div>
                {paymentSettingsForm.qrCodeUrl && (
                  <div style={styles.qrPreview}>
                    <img 
                      src={paymentSettingsForm.qrCodeUrl} 
                      alt="QR Code" 
                      style={styles.qrImage}
                    />
                    <button 
                      type="button" 
                      style={styles.removeQrBtn}
                      onClick={() => setPaymentSettingsForm({...paymentSettingsForm, qrCodeUrl: ''})}
                    >
                      ❌ Remove QR Code
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <hr style={styles.divider} />
            <button type="submit" style={styles.primaryBtn} disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Payment Details'}
            </button>
          </form>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedBillForPayment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalLarge}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>💳 Pay Maintenance Bill</h5>
              <button style={styles.modalClose} onClick={() => setSelectedBillForPayment(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.billSummary}>
                <span style={styles.billSummaryIcon}>📄</span>
                <div style={styles.billSummaryInfo}>
                  <div><strong>Month:</strong> {selectedBillForPayment.month}</div>
                  <div><strong>Flat:</strong> {selectedBillForPayment.flat?.number}</div>
                  <div style={styles.billAmount}>
                    <strong>Amount: ₹{selectedBillForPayment.totalAmount}</strong>
                  </div>
                </div>
              </div>

              {!hasPaymentDetails ? (
                <div style={styles.warningBox}>
                  <strong>⚠️ Payment details not configured!</strong><br />
                  Please contact your society admin to set up payment details.
                </div>
              ) : (
                <div style={styles.paymentDetailsGrid}>
                  {society?.paymentDetails?.qrCodeUrl && (
                    <div style={styles.qrSection}>
                      <h6 style={styles.paymentSectionTitle}>Scan QR Code</h6>
                      <img 
                        src={society.paymentDetails.qrCodeUrl} 
                        alt="Payment QR Code" 
                        style={styles.paymentQr}
                      />
                      <p style={styles.qrHint}>Scan with any UPI app</p>
                    </div>
                  )}
                  
                  <div style={styles.detailsSection}>
                    {society?.paymentDetails?.upiId && (
                      <div style={styles.paymentDetail}>
                        <h6 style={styles.paymentSectionTitle}>📱 UPI ID</h6>
                        <div style={styles.copyField}>
                          <input 
                            type="text" 
                            style={styles.copyInput}
                            value={society.paymentDetails.upiId} 
                            readOnly 
                          />
                          <button 
                            style={styles.copyBtn}
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(society.paymentDetails.upiId);
                              setSuccess('UPI ID copied!');
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {society?.paymentDetails?.accountNumber && (
                      <div style={styles.paymentDetail}>
                        <h6 style={styles.paymentSectionTitle}>🏦 Bank Transfer</h6>
                        <div style={styles.bankDetails}>
                          <div style={styles.bankRow}>
                            <span style={styles.bankLabel}>Bank:</span>
                            <span>{society.paymentDetails.bankName || '-'}</span>
                          </div>
                          <div style={styles.bankRow}>
                            <span style={styles.bankLabel}>Name:</span>
                            <span>{society.paymentDetails.accountHolderName || '-'}</span>
                          </div>
                          <div style={styles.bankRow}>
                            <span style={styles.bankLabel}>Account:</span>
                            <span>
                              {society.paymentDetails.accountNumber}
                              <button 
                                style={styles.inlineCopyBtn}
                                onClick={() => {
                                  navigator.clipboard.writeText(society.paymentDetails.accountNumber);
                                  setSuccess('Account number copied!');
                                }}
                              >
                                📋
                              </button>
                            </span>
                          </div>
                          <div style={styles.bankRow}>
                            <span style={styles.bankLabel}>IFSC:</span>
                            <span>
                              {society.paymentDetails.ifscCode || '-'}
                              {society.paymentDetails.ifscCode && (
                                <button 
                                  style={styles.inlineCopyBtn}
                                  onClick={() => {
                                    navigator.clipboard.writeText(society.paymentDetails.ifscCode);
                                    setSuccess('IFSC copied!');
                                  }}
                                >
                                  📋
                                </button>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={styles.afterPaymentNote}>
                <strong>✅ After Payment:</strong><br />
                Once you make the payment, please inform the society admin. 
                Admin will verify and mark your bill as paid.
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.secondaryBtn} onClick={() => setSelectedBillForPayment(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>🧾 Payment Receipt</h5>
              <button style={styles.modalClose} onClick={() => setSelectedReceipt(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.receiptHeader}>
                <h4 style={styles.receiptTitle}>Society Management System</h4>
                <p style={styles.receiptSubtitle}>Payment Receipt</p>
              </div>
              <hr style={styles.divider} />
              <div style={styles.receiptDetails}>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Receipt No:</span>
                  <span style={styles.receiptValue}>{selectedReceipt.receiptNo}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Payment ID:</span>
                  <span style={styles.receiptValueSmall}>{selectedReceipt.paymentId}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Month:</span>
                  <span style={styles.receiptValue}>{selectedReceipt.bill.month}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Flat:</span>
                  <span style={styles.receiptValue}>{selectedReceipt.bill.flat?.block}-{selectedReceipt.bill.flat?.number}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Resident:</span>
                  <span style={styles.receiptValue}>{selectedReceipt.bill.resident?.fullName}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Amount:</span>
                  <span style={styles.receiptValue}>₹{selectedReceipt.bill.amount}</span>
                </div>
                {selectedReceipt.bill.latePenalty > 0 && (
                  <div style={styles.receiptRow}>
                    <span style={styles.receiptLabel}>Late Penalty:</span>
                    <span style={{...styles.receiptValue, color: '#ef4444'}}>₹{selectedReceipt.bill.latePenalty}</span>
                  </div>
                )}
                <div style={{...styles.receiptRow, ...styles.receiptTotal}}>
                  <span style={styles.receiptLabel}>Total Paid:</span>
                  <span style={styles.receiptTotalValue}>₹{selectedReceipt.amount}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Paid On:</span>
                  <span style={styles.receiptValue}>{new Date(selectedReceipt.paidAt).toLocaleString()}</span>
                </div>
              </div>
              <hr style={styles.divider} />
              <p style={styles.receiptThank}>Thank you for your payment! 🙏</p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.secondaryBtn} onClick={() => setSelectedReceipt(null)}>Close</button>
              <button style={styles.primaryBtn} onClick={() => window.print()}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '24px' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '1rem' },
  alert: {
    padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  alertSuccess: { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
  alertClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
  adminSection: { marginBottom: '24px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px', marginBottom: '24px',
  },
  statCard: {
    borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center',
    gap: '16px', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  statIcon: { fontSize: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '1.8rem', fontWeight: '700' },
  statLabel: { fontSize: '0.9rem', opacity: 0.9 },
  generateCard: {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '20px' },
  generateForm: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' },
  formGroup: { flex: '1', minWidth: '200px' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#64748b', marginBottom: '8px' },
  input: {
    width: '100%', padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
  },
  primaryBtn: {
    padding: '14px 28px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '14px 28px', borderRadius: '10px', border: '2px solid #e2e8f0',
    background: 'white', color: '#64748b', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
  },
  tabsContainer: {
    display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap',
    borderBottom: '2px solid #e2e8f0', paddingBottom: '0',
  },
  tab: {
    padding: '14px 24px', borderRadius: '12px 12px 0 0', border: 'none',
    background: 'rgba(255,255,255,0.7)', color: '#64748b', fontWeight: '500',
    fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white',
  },
  tabBadge: {
    marginLeft: '8px', padding: '2px 8px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.3)', fontSize: '0.8rem',
  },
  tableCard: {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '16px 20px', background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white', fontWeight: '600', textAlign: 'left', fontSize: '0.9rem',
  },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '16px 20px', color: '#475569' },
  badge: {
    display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
    color: 'white', fontSize: '0.85rem', fontWeight: '500',
  },
  flatBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: '8px',
    background: '#f1f5f9', color: '#475569', fontWeight: '500', fontSize: '0.9rem',
  },
  receiptCode: {
    background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px',
    fontFamily: 'monospace', fontSize: '0.9rem',
  },
  actionBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  payBtn: {
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem',
  },
  cashBtn: {
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem',
  },
  cancelBtn: {
    padding: '8px 12px', borderRadius: '8px', border: '2px solid #ef4444',
    background: 'white', color: '#ef4444', fontWeight: '500', cursor: 'pointer',
  },
  viewBtn: {
    padding: '8px 16px', borderRadius: '8px', border: '2px solid #475569',
    background: 'white', color: '#475569', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem',
  },
  mutedText: { color: '#94a3b8' },
  successText: { color: '#22c55e', fontWeight: '600' },
  emptyState: { textAlign: 'center', padding: '60px 40px' },
  emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '16px' },
  emptyText: { color: '#64748b', fontSize: '1.1rem' },
  settingsCard: {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  settingsDesc: { color: '#64748b', marginBottom: '24px' },
  settingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' },
  settingsColumn: {},
  sectionLabel: { fontSize: '1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '16px' },
  fileInput: {
    width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '1rem', boxSizing: 'border-box',
  },
  helpText: { color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' },
  qrPreview: { textAlign: 'center', marginTop: '20px' },
  qrImage: { maxWidth: '200px', maxHeight: '200px', border: '2px solid #e2e8f0', padding: '10px', borderRadius: '12px' },
  removeQrBtn: {
    marginTop: '12px', padding: '8px 16px', borderRadius: '8px',
    border: '2px solid #ef4444', background: 'white', color: '#ef4444',
    cursor: 'pointer', fontSize: '0.9rem',
  },
  divider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px',
    maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalLarge: {
    background: 'white', borderRadius: '20px', width: '100%', maxWidth: '700px',
    maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', borderRadius: '20px 20px 0 0',
  },
  modalTitle: { margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: '600' },
  modalClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
  modalBody: { padding: '24px' },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px',
    padding: '16px 24px', borderTop: '1px solid #e2e8f0',
  },
  billSummary: {
    display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
    background: 'linear-gradient(135deg, #47556915 0%, #33415515 100%)',
    borderRadius: '12px', marginBottom: '24px',
  },
  billSummaryIcon: { fontSize: '2.5rem' },
  billSummaryInfo: { flex: 1 },
  billAmount: { marginTop: '8px', fontSize: '1.2rem', color: '#1e3a5f' },
  warningBox: {
    padding: '16px', background: '#fef3c7', borderRadius: '12px',
    color: '#92400e', marginBottom: '20px',
  },
  paymentDetailsGrid: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  qrSection: {
    flex: '0 0 200px', textAlign: 'center', paddingRight: '24px',
    borderRight: '1px solid #e2e8f0',
  },
  detailsSection: { flex: 1, minWidth: '250px' },
  paymentSectionTitle: { fontSize: '0.95rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '12px' },
  paymentQr: { maxWidth: '180px', maxHeight: '180px' },
  qrHint: { color: '#64748b', fontSize: '0.85rem', marginTop: '8px' },
  paymentDetail: { marginBottom: '24px' },
  copyField: { display: 'flex', gap: '8px' },
  copyInput: {
    flex: 1, padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0',
    fontSize: '1rem', background: '#f8fafc',
  },
  copyBtn: {
    padding: '12px 16px', borderRadius: '8px', border: '2px solid #475569',
    background: 'white', color: '#475569', fontWeight: '500', cursor: 'pointer',
  },
  bankDetails: { background: '#f8fafc', borderRadius: '12px', padding: '16px' },
  bankRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' },
  bankLabel: { fontWeight: '500', color: '#64748b' },
  inlineCopyBtn: {
    background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
    marginLeft: '8px', fontSize: '0.9rem',
  },
  afterPaymentNote: {
    marginTop: '24px', padding: '16px', background: '#f1f5f9',
    borderRadius: '12px', color: '#475569', fontSize: '0.95rem',
  },
  receiptHeader: { textAlign: 'center', marginBottom: '20px' },
  receiptTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '4px' },
  receiptSubtitle: { color: '#64748b' },
  receiptDetails: {},
  receiptRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  receiptLabel: { color: '#64748b', fontWeight: '500' },
  receiptValue: { color: '#1e3a5f', fontWeight: '500' },
  receiptValueSmall: { color: '#1e3a5f', fontSize: '0.85rem' },
  receiptTotal: { marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e2e8f0' },
  receiptTotalValue: { fontSize: '1.3rem', fontWeight: '700', color: '#22c55e' },
  receiptThank: { textAlign: 'center', color: '#64748b', marginTop: '16px' },
};

export default BillsPage;

import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';

const StaffDashboardPage = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [todayMarked, setTodayMarked] = useState(false);
  const [visitorForm, setVisitorForm] = useState({ flat: '', name: '', phone: '', purpose: '', vehicleNo: '' });

  const loadAttendance = async () => {
    try {
      const { data } = await api.get('/staff/me/attendance');
      setAttendance(data.attendance || []);
      
      // Check if today is already marked
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isMarked = (data.attendance || []).some(a => {
        const attendanceDate = new Date(a.date);
        attendanceDate.setHours(0, 0, 0, 0);
        return attendanceDate.getTime() === today.getTime();
      });
      setTodayMarked(isMarked);
    } catch (err) {
      console.error('Failed to load attendance');
    }
  };

  const loadNotices = async () => {
    try {
      const { data } = await api.get('/staff/me/notices');
      setNotices(data);
    } catch (err) {
      console.error('Failed to load notices');
    }
  };

  const loadVisitors = async () => {
    try {
      const { data } = await api.get('/visitors/staff');
      setVisitors(data);
    } catch (err) {
      console.error('Failed to load visitors');
    }
  };

  const loadFlats = async () => {
    try {
      const { data } = await api.get('/flats/staff');
      setFlats(data);
    } catch (err) {
      console.error('Failed to load flats');
    }
  };

  useEffect(() => {
    loadAttendance();
    loadNotices();
    loadVisitors();
    loadFlats();
  }, []);

  const markAttendance = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/staff/me/attendance');
      setSuccess('Attendance marked successfully!');
      setTodayMarked(true);
      loadAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly stats
  const getMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyAttendance = attendance.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const present = monthlyAttendance.filter(a => a.status === 'Present').length;
    const absent = monthlyAttendance.filter(a => a.status === 'Absent').length;

    return { present, absent, total: present + absent };
  };

  const stats = getMonthlyStats();

  return (
    <div>
      <h3>Welcome, {user?.name || 'Staff'}</h3>
      <p className="text-muted">Role: {user?.role}</p>

      {error && <div className="alert alert-danger alert-dismissible">{error}<button type="button" className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible">{success}<button type="button" className="btn-close" onClick={() => setSuccess('')}></button></div>}

      {/* Stats */}
      <div className="row mb-4">
        <StatCard title="Present (Month)" value={stats.present} color="success" />
        <StatCard title="Absent (Month)" value={stats.absent} color="danger" />
        <StatCard title="Days Recorded" value={stats.total} color="primary" />
      </div>

      {/* Quick Attendance Mark */}
      <div className="card mb-4">
        <div className="card-body text-center">
          <h5>Today's Attendance - {new Date().toLocaleDateString()}</h5>
          {todayMarked ? (
            <div className="alert alert-success mb-0">
              <strong>✓ Attendance Already Marked for Today</strong>
            </div>
          ) : (
            <button 
              className="btn btn-lg btn-success" 
              onClick={markAttendance} 
              disabled={loading}
            >
              {loading ? 'Marking...' : '✓ Mark Present for Today'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`} 
            onClick={() => setActiveTab('attendance')}
          >
            My Attendance
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'visitors' ? 'active' : ''}`} 
            onClick={() => setActiveTab('visitors')}
          >
            Visitors {visitors.filter(v => !v.exitTime).length > 0 && <span className="badge bg-warning">{visitors.filter(v => !v.exitTime).length}</span>}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'notices' ? 'active' : ''}`} 
            onClick={() => setActiveTab('notices')}
          >
            Society Notices {notices.length > 0 && <span className="badge bg-info">{notices.length}</span>}
          </button>
        </li>
      </ul>

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="card">
          <div className="card-header">Attendance History</div>
          <div className="card-body">
            {attendance.length === 0 ? (
              <p className="text-muted">No attendance records yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...attendance].reverse().slice(0, 30).map((a, idx) => (
                      <tr key={idx}>
                        <td>{new Date(a.date).toLocaleDateString()}</td>
                        <td>{new Date(a.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                        <td>
                          <span className={`badge bg-${a.status === 'Present' ? 'success' : 'danger'}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visitors Tab */}
      {activeTab === 'visitors' && (
        <div className="card">
          <div className="card-header">Visitor Management</div>
          <div className="card-body">
            {/* Add Visitor Form */}
            <form className="card card-body mb-3 bg-light" onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              if (!visitorForm.flat) {
                setError('Please select a flat');
                return;
              }
              try {
                await api.post('/visitors/staff', visitorForm);
                setVisitorForm({ flat: '', name: '', phone: '', purpose: '', vehicleNo: '' });
                setSuccess('Visitor logged successfully!');
                loadVisitors();
              } catch (err) {
                setError(err.response?.data?.message || 'Failed to log visitor');
              }
            }}>
              <div className="row g-2">
                <div className="col-md-2">
                  <select className="form-select" value={visitorForm.flat} onChange={(e) => setVisitorForm({ ...visitorForm, flat: e.target.value })} required>
                    <option value="">Select Flat</option>
                    {flats.map((f) => (
                      <option key={f._id} value={f._id}>{f.block}-{f.number}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2"><input className="form-control" placeholder="Visitor Name" value={visitorForm.name} onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })} required /></div>
                <div className="col-md-2"><input className="form-control" placeholder="Phone" value={visitorForm.phone} onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })} required /></div>
                <div className="col-md-2"><input className="form-control" placeholder="Purpose" value={visitorForm.purpose} onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })} required /></div>
                <div className="col-md-2"><input className="form-control" placeholder="Vehicle No" value={visitorForm.vehicleNo} onChange={(e) => setVisitorForm({ ...visitorForm, vehicleNo: e.target.value })} /></div>
                <div className="col-md-2"><button className="btn btn-primary w-100" type="submit">Log Entry</button></div>
              </div>
            </form>

            {/* Visitors Table */}
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr><th>Name</th><th>Flat</th><th>Phone</th><th>Purpose</th><th>Entry</th><th>Exit</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted">No visitors recorded yet.</td></tr>
                  ) : (
                    visitors.map((v) => (
                      <tr key={v._id}>
                        <td>{v.name}</td>
                        <td>{v.flat?.block}-{v.flat?.number || '-'}</td>
                        <td>{v.phone}</td>
                        <td>{v.purpose}</td>
                        <td>{new Date(v.entryTime).toLocaleString()}</td>
                        <td>{v.exitTime ? new Date(v.exitTime).toLocaleString() : '-'}</td>
                        <td>
                          {!v.exitTime ? (
                            <button className="btn btn-sm btn-success" onClick={async () => {
                              try {
                                await api.patch(`/visitors/staff/${v._id}/exit`);
                                loadVisitors();
                              } catch (err) {
                                setError('Failed to mark exit');
                              }
                            }}>Mark Exit</button>
                          ) : (
                            <span className="badge bg-secondary">Exited</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="card">
          <div className="card-header">Society Notices</div>
          <div className="card-body">
            {notices.length === 0 ? (
              <p className="text-muted">No notices available.</p>
            ) : (
              <div>
                {notices.map((notice) => (
                  <div key={notice._id} className="card mb-3">
                    <div className="card-header d-flex justify-content-between">
                      <strong>{notice.title}</strong>
                      <small className="text-muted">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="card-body">
                      <p className="mb-1">{notice.content}</p>
                      {notice.postedBy && (
                        <small className="text-muted">Posted by: {notice.postedBy.fullName}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboardPage;

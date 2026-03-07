<<<<<<< HEAD
import { useEffect, useState } from 'react';
=======
﻿import { useEffect, useState } from 'react';
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const SecurityDashboard = () => {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    const run = async () => {
      const { data } = await api.get('/visitors');
      setVisitors(data);
    };
    run();
  }, []);

  const inSociety = visitors.filter((v) => !v.exitTime).length;

  return (
    <div>
      <h2 className="mb-3">Security Dashboard</h2>
      <div className="row">
        <StatCard title="Total Visitors" value={visitors.length} color="primary" />
        <StatCard title="Inside Now" value={inSociety} color="danger" />
        <StatCard title="Exited" value={visitors.length - inSociety} color="success" />
      </div>
    </div>
  );
};

export default SecurityDashboard;

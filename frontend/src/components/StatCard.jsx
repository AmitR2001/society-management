<<<<<<< HEAD
const StatCard = ({ title, value, color = 'primary' }) => (
=======
﻿const StatCard = ({ title, value, color = 'primary' }) => (
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
  <div className="col-md-4">
    <div className={`card border-${color} mb-3` }>
      <div className="card-body">
        <h6 className="text-muted">{title}</h6>
        <h3>{value}</h3>
      </div>
    </div>
  </div>
);

export default StatCard;

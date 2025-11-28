import React, { useMemo } from 'react';

const styles = {
  container: {
    margin: '0 30px 30px',
    padding: '25px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    border: '1px solid #F1F3F5',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  alertList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  alertItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #F1F3F5',
  },
  alertIcon: {
    fontSize: '20px',
    marginRight: '15px',
  },
};

const getAlerts = (eletrocalhas) => {
  const alerts = [];
  eletrocalhas.forEach(calha => {
    const occupancy = calha.capacidade_maxima > 0 ? calha.ocupacao_total / calha.capacidade_maxima : 0;
    if (occupancy > 0.95) {
      alerts.push({
        level: '🔴',
        message: `Eletrocalha "${calha.nome}" está com ${Math.round(occupancy * 100)}% de ocupação (capacidade crítica!).`,
        calhaId: calha.id,
      });
    } else if (occupancy > 0.8) {
      alerts.push({
        level: '🟡',
        message: `Eletrocalha "${calha.nome}" está com ${Math.round(occupancy * 100)}% de ocupação. Considere planejar nova rota.`,
        calhaId: calha.id,
      });
    }
  });

  const criticalCount = alerts.filter(a => a.level === '🔴').length;
  if (criticalCount > 1) {
    alerts.unshift({
      level: 'ℹ️',
      message: `${criticalCount} eletrocalhas estão em estado crítico.`,
    });
  }

  return alerts;
};

export default function AlertsDashboard({ eletrocalhas }) {
  const alerts = useMemo(() => getAlerts(eletrocalhas), [eletrocalhas]);

  if (alerts.length === 0) {
    return null; // Don't render anything if there are no alerts
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🚨 Alertas e Monitoramento</h3>
      <ul style={styles.alertList}>
        {alerts.map((alert, index) => (
          <li key={index} style={styles.alertItem}>
            <span style={styles.alertIcon}>{alert.level}</span>
            <span>{alert.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import React from 'react';

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#F8F9FA',
    border: '1px solid #F1F3F5',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6C757D',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  statDetail: {
    fontSize: '12px',
    color: '#6C757D',
  }
};

const getEletrocalhaStatusCounts = (eletrocalhas) => {
  const counts = { Livre: 0, Atenção: 0, Crítico: 0 };
  eletrocalhas.forEach(calha => {
    const occupancy = calha.capacidade_maxima > 0 ? calha.ocupacao_total / calha.capacidade_maxima : 0;
    if (occupancy > 0.8) counts['Crítico']++;
    else if (occupancy > 0.5) counts['Atenção']++;
    else counts['Livre']++;
  });
  return counts;
};

export default function ProjectStatistics({ racks = [], eletrocalhas = [], routes = [] }) {
  const rackCounts = {
    total: racks.length,
    standard: racks.filter(r => !r.is_cross_connect).length,
    cc: racks.filter(r => r.is_cross_connect).length,
  };

  const eletrocalhaStatus = getEletrocalhaStatusCounts(eletrocalhas);

  const routeStats = {
    total: routes.length,
    totalDistance: routes.reduce((sum, route) => sum + route.distancia_metros, 0),
  };

  const mostOccupiedEletrocalha = eletrocalhas.length > 0
    ? eletrocalhas.reduce((max, calha) => (calha.ocupacao_total > max.ocupacao_total ? calha : max))
    : null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Resumo do Projeto</h3>
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total de Racks</div>
          <div style={styles.statValue}>{rackCounts.total}</div>
          <div style={styles.statDetail}>
            {rackCounts.standard} Padrão / {rackCounts.cc} CC
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Eletrocalhas</div>
          <div style={styles.statValue}>{eletrocalhas.length}</div>
          <div style={styles.statDetail}>
            <span style={{color: '#22c55e'}}>● {eletrocalhaStatus.Livre}</span> / {' '}
            <span style={{color: '#eab308'}}>● {eletrocalhaStatus.Atenção}</span> / {' '}
            <span style={{color: '#ef4444'}}>● {eletrocalhaStatus.Crítico}</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total de Rotas</div>
          <div style={styles.statValue}>{routeStats.total}</div>
          <div style={styles.statDetail}>
            {routeStats.totalDistance.toFixed(0)} metros
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Eletrocalha mais Ocupada</div>
          {mostOccupiedEletrocalha ? (
            <>
              <div style={{...styles.statValue, fontSize: '18px'}}>{mostOccupiedEletrocalha.nome}</div>
              <div style={styles.statDetail}>
                {mostOccupiedEletrocalha.ocupacao_total} / {mostOccupiedEletrocalha.capacidade_maxima} 
                ({(mostOccupiedEletrocalha.ocupacao_total / mostOccupiedEletrocalha.capacidade_maxima * 100).toFixed(0)}%)
              </div>
            </>
          ) : (
            <div style={styles.statValue}>-</div>
          )}
        </div>
      </div>
    </div>
  );
}

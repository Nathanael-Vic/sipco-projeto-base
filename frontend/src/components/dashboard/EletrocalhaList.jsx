import React, { useState, useMemo } from 'react';

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
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  filterButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #DEE2E6',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  activeFilter: {
    background: '#000',
    color: '#fff',
    border: '1px solid #000',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #F1F3F5',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6C757D',
    textTransform: 'uppercase',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #F1F3F5',
    fontSize: '14px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
  }
};

const getStatus = (calha) => {
  const occupancy = calha.capacidade_maxima > 0 ? calha.ocupacao_total / calha.capacidade_maxima : 0;
  if (occupancy > 0.8) return 'Crítico';
  if (occupancy > 0.5) return 'Atenção';
  return 'Livre';
};

const getType = (calha) => {
  return calha.ponto_a_x === calha.ponto_b_x ? 'Vertical' : 'Horizontal';
};

export default function EletrocalhaList({ eletrocalhas, onSelectEletrocalha }) {
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');

  const filteredEletrocalhas = useMemo(() => {
    return eletrocalhas.filter(calha => {
      const status = getStatus(calha);
      const type = getType(calha);
      const statusMatch = statusFilter === 'Todas' || status === statusFilter;
      const typeMatch = typeFilter === 'Todos' || type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [eletrocalhas, statusFilter, typeFilter]);

  const renderStatus = (status) => {
    const color = {
      'Livre': '#22c55e',
      'Atenção': '#eab308',
      'Crítico': '#ef4444',
    }[status];
    return <span style={{ color }}>● {status}</span>;
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Lista de Eletrocalhas</h3>
      <div style={styles.filters}>
        <button 
          style={statusFilter === 'Todas' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
          onClick={() => setStatusFilter('Todas')}
        >Todas</button>
        <button
          style={statusFilter === 'Livre' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
          onClick={() => setStatusFilter('Livre')}
        >Livre</button>
        <button
          style={statusFilter === 'Atenção' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
          onClick={() => setStatusFilter('Atenção')}
        >Atenção</button>
        <button
          style={statusFilter === 'Crítico' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
          onClick={() => setStatusFilter('Crítico')}
        >Crítico</button>
      </div>
      <div style={styles.filters}>
        <button
          style={typeFilter === 'Todos' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
          onClick={() => setTypeFilter('Todos')}
        >Todos os Tipos</button>
        <button
          style={typeFilter === 'Horizontal' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
          onClick={() => setTypeFilter('Horizontal')}
        >Horizontal</button>
        <button
          style={typeFilter === 'Vertical' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
          onClick={() => setTypeFilter('Vertical')}
        >Vertical</button>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nome</th>
            <th style={styles.th}>Tipo</th>
            <th style={styles.th}>Ocupação</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredEletrocalhas.map(calha => (
            <tr key={calha.id}>
              <td style={styles.td}>{calha.nome}</td>
              <td style={styles.td}>{getType(calha)}</td>
              <td style={styles.td}>{calha.ocupacao_total || 0} / {calha.capacidade_maxima}</td>
              <td style={styles.td}>{renderStatus(getStatus(calha))}</td>
              <td style={styles.td}>
                <button style={styles.actionButton} onClick={() => { console.log("Eletrocalha clicada na lista:", calha); onSelectEletrocalha(calha); }}>✏️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React, { useState } from 'react';
import { toast } from 'react-toastify';

const styles = {
  sidebar: {
    height: 'calc(100vh - 145px)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease-in-out, margin 0.3s ease-in-out, border 0.3s ease-in-out',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    border: '1px solid #F1F3F5',
  },
  header: { padding: '20px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '330px' },
  title: { fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#333' },
  closeButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' },
  content: { padding: '25px', flex: 1, overflowY: 'auto', minWidth: '330px' },
  detailItem: { marginBottom: '20px' },
  detailLabel: { fontSize: '12px', fontWeight: 'bold', color: '#6C757D', textTransform: 'uppercase', marginBottom: '5px' },
  detailValue: { fontSize: '24px', fontWeight: 'bold', color: '#007bff' },
  button: { width: '100%', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', transition: 'background-color 0.2s', fontSize: '16px', marginTop: '20px' },
  confirmButton: { backgroundColor: '#28a745', color: 'white' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '14px' }
};

export default function RouteDetailSidebar({ route, distance, originRack, destinationRack, onClose, onConfirm }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      toast.success("Rota confirmada e salva com sucesso!");
    } catch (error) {
      toast.error(error.message || "Erro ao confirmar a rota.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const dynamicSidebarStyles = {
    width: route ? '380px' : '0px',
    borderLeft: route ? '1px solid #eee' : 'none',
    margin: route ? '0 0 30px 0' : '0',
  };

  return (
    <div style={{ ...styles.sidebar, ...dynamicSidebarStyles }}>
      {route && (
        <>
          <div style={styles.header}>
            <h3 style={styles.title}>Detalhes da Rota</h3>
            <button onClick={onClose} style={styles.closeButton} disabled={isProcessing}>&times;</button>
          </div>
          <div style={styles.content}>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Trajeto</div>
              <div style={{ fontSize: '16px' }}>
                <strong>De:</strong> {originRack?.nome || 'N/A'}<br/>
                <strong>Para:</strong> {destinationRack?.nome || 'N/A'}
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Distância Total</div>
              <div style={styles.detailValue}>{distance}m</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Eletrocalhas no Trajeto ({route.length})</div>
              <ul style={styles.list}>
                {route.map(eletrocalha => (
                  <li key={eletrocalha.id} style={styles.listItem}>
                    {eletrocalha.nome || `Eletrocalha #${eletrocalha.id}`}
                  </li>
                ))}
              </ul>
            </div>
            <button
              style={{ ...styles.button, ...styles.confirmButton }}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Confirmando...' : 'Confirmar Rota'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

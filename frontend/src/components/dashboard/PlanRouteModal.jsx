import React, { useState } from 'react';

const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalBox: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { cursor: 'pointer', fontSize: '20px', background: 'none', border: 'none' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' },
  select: { width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #CED4DA', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', appearance: 'none', background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e") no-repeat right .75rem center/16px 12px` },
  btnPrimary: { padding: '12px 24px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', width: '100%' },
  btnCancel: { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #ddd', color: '#333', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
};

export default function PlanRouteModal({ 
  racks = [], 
  onClose, 
  onPlanRoute,
  originRackId,
  setOriginRackId,
  destinationRackId,
  setDestinationRackId
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!originRackId || !destinationRackId) {
      alert("Por favor, selecione os racks de origem e destino.");
      return;
    }
    if (originRackId === destinationRackId) {
      alert("O rack de origem e destino não podem ser os mesmos.");
      return;
    }
    
    setIsProcessing(true);
    // A lógica de pathfinding será chamada aqui no futuro.
    onPlanRoute(originRackId, destinationRackId);
    // Simulando uma operação assíncrona
    setTimeout(() => {
        setIsProcessing(false);
        onClose(); // Fecha o modal após o "planejamento"
    }, 1000);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Planejar Rota de Cabeamento</h3>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <p style={{color: '#666', fontSize: '14px', marginBottom: '30px'}}>
          Selecione os racks de origem e destino para encontrar a melhor rota de cabeamento.
        </p>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="origin-rack" style={styles.label}>Rack de Origem</label>
          <select 
            id="origin-rack"
            style={styles.select} 
            value={originRackId} 
            onChange={e => setOriginRackId(e.target.value)}
            required
          >
            <option value="" disabled>Selecione um rack</option>
            {racks.map(rack => (
              <option key={`origin-${rack.id}`} value={rack.id}>
                {rack.nome} (Pos: {rack.coordenada_y},{rack.coordenada_x})
              </option>
            ))}
          </select>
          
          <label htmlFor="destination-rack" style={styles.label}>Rack de Destino</label>
          <select 
            id="destination-rack"
            style={styles.select}
            value={destinationRackId} 
            onChange={e => setDestinationRackId(e.target.value)}
            required
          >
            <option value="" disabled>Selecione um rack</option>
            {racks.map(rack => (
              <option key={`dest-${rack.id}`} value={rack.id}>
                {rack.nome} (Pos: {rack.coordenada_y},{rack.coordenada_x})
              </option>
            ))}
          </select>

          <div style={{marginTop: 20, display:'flex', flexDirection: 'column', gap:10}}>
            <button type="submit" style={styles.btnPrimary} disabled={isProcessing}>
              {isProcessing ? 'Planejando...' : 'Encontrar Rota'}
            </button>
            <button type="button" style={{...styles.btnCancel, width: '100%', padding: '12px'}} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
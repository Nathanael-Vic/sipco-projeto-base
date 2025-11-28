import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { toast } from 'react-toastify';
import { toGridCoordinates } from '../../utils/coordinateConverter';
import { racksService } from '../../api/racksService';

// Estilos para o componente
const styles = {
  sidebar: {
    height: 'calc(100vh - 145px)', // Ajusta a altura para caber na tela
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease-in-out, margin 0.3s ease-in-out, border 0.3s ease-in-out',
    overflow: 'hidden', // Esconde o conteúdo quando a largura for 0
    alignSelf: 'flex-start', // Alinha ao topo do container flex
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
  detailValue: { fontSize: '16px', color: '#343A40' },
  progressBarContainer: { width: '100%', backgroundColor: '#e9ecef', borderRadius: '4px', height: '20px', overflow: 'hidden' },
  progressBar: { height: '100%', transition: 'width 0.5s ease-in-out' },
  buttonContainer: { display: 'flex', gap: '10px', marginTop: '30px' },
  button: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', transition: 'background-color 0.2s' },
  editButton: { backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#343a40' },
  deleteButton: { backgroundColor: '#dc3545', color: 'white' },
  saveButton: { backgroundColor: '#007bff', color: 'white' },
  cancelButton: { backgroundColor: '#6c757d', color: 'white' },
  input: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ced4da', borderRadius: '6px' },
};

export default function RackDetailSidebar({ rack, onClose, onDataUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ capacidade_u: 0, ocupado_u: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (rack) {
      console.log("Rack recebido no RackDetailSidebar:", rack);
      setEditForm({ capacidade_u: rack.capacidade_u, ocupado_u: rack.ocupado_u });
      setIsEditing(false);
      fetchRoutes();
    }
  }, [rack]);

  const fetchRoutes = async () => {
    if (!rack) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");
      
      const fetchedRoutes = await racksService.getRackRoutes(rack.id, session.access_token);
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Erro ao buscar rotas do rack:", error);
      toast.error("Não foi possível carregar as rotas do rack.");
    }
  };

  const getAuthHeaders = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error('Usuário não autenticado.');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` };
  };

  const handleSaveChanges = async () => {
    setIsProcessing(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/racks/${rack.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...rack, ...editForm })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao atualizar rack.");
      }
      toast.success("Rack atualizado com sucesso!");
      await onDataUpdate();
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o rack "${rack.nome}"? Esta ação não pode ser desfeita.`)) {
      setIsProcessing(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/racks/${rack.id}`, { method: "DELETE", headers });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Erro ao excluir rack.");
        }
        toast.success("Rack excluído com sucesso!");
        onClose();
        await onDataUpdate();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const getRackPositionName = (rackToProcess) => {
    if (!rackToProcess || typeof rackToProcess.coordenada_x !== 'number' || typeof rackToProcess.coordenada_y !== 'number') {
      return { rowName: '??', colName: '??' };
    }
    return toGridCoordinates(rackToProcess.coordenada_x * 600, rackToProcess.coordenada_y * 600, 600);
  };

  // Calcula valores apenas se o rack existir
  const occupancy = rack ? (rack.capacidade_u > 0 ? (rack.ocupado_u / rack.capacidade_u) : 0) : 0;
  const occupancyPercentage = (occupancy * 100).toFixed(0);
  
  let progressBarColor;
  if (occupancy === 1) progressBarColor = '#DC3545';
  else if (occupancy > 0) progressBarColor = '#FFC107';
  else progressBarColor = '#28A745';

  const { rowName, colName } = getRackPositionName(rack);

  // Estilo dinâmico para controlar a largura e visibilidade da sidebar
  const dynamicSidebarStyles = {
    width: rack ? '380px' : '0px',
    borderLeft: rack ? '1px solid #eee' : 'none',
    margin: rack ? '0 0 30px 0' : '0',
  };

  return (
    <div style={{ ...styles.sidebar, ...dynamicSidebarStyles }}>
      {rack && ( // Só renderiza o conteúdo se houver um rack para uma animação de saída limpa
        <>
          <div style={styles.header}>
            <h3 style={styles.title}>{isEditing ? 'Editar Rack' : 'Detalhes do Rack'}</h3>
            <button onClick={onClose} style={styles.closeButton} disabled={isProcessing}>&times;</button>
          </div>
          <div style={styles.content}>
            {isEditing ? (
              <>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Capacidade (U)</label>
                  <input type="number" style={styles.input} value={editForm.capacidade_u} onChange={e => setEditForm({ ...editForm, capacidade_u: parseInt(e.target.value) || 0 })} />
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Ocupado (U)</label>
                  <input type="number" style={styles.input} value={editForm.ocupado_u} onChange={e => setEditForm({ ...editForm, ocupado_u: parseInt(e.target.value) || 0 })} />
                </div>
                <div style={styles.buttonContainer}>
                  <button style={{ ...styles.button, ...styles.cancelButton }} onClick={() => setIsEditing(false)} disabled={isProcessing}>Cancelar</button>
                  <button style={{ ...styles.button, ...styles.saveButton }} onClick={handleSaveChanges} disabled={isProcessing}>{isProcessing ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Nome</div>
                  <div style={styles.detailValue}>{rack.nome}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Posição</div>
                  <div style={styles.detailValue}>{`${rowName}${colName} (X:${rack.coordenada_x}, Y:${rack.coordenada_y})`}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Ocupação: {rack.ocupado_u}/{rack.capacidade_u} U ({occupancyPercentage}%)</div>
                  <div style={styles.progressBarContainer}>
                    <div style={{ ...styles.progressBar, width: `${occupancyPercentage}%`, backgroundColor: progressBarColor }}></div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Rotas Conectadas ({routes.length})</div>
                  {routes.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
                      {routes.map(route => (
                        <li key={route.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                          <span style={{ fontWeight: 'bold' }}>{route.nome}</span><br/>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {rack.id === route.rack_origem_id ? `Destino: Rack #${route.rack_destino_id}` : `Origem: Rack #${route.rack_origem_id}`}
                            {' '}({route.distancia_metros}m)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ fontSize: '14px', color: '#666' }}>Nenhuma rota conectada a este rack.</div>
                  )}
                </div>
                <div style={styles.buttonContainer}>
                  <button style={{ ...styles.button, ...styles.editButton }} onClick={() => setIsEditing(true)}>Editar Rack</button>
                  <button style={{ ...styles.button, ...styles.deleteButton }} onClick={handleDelete}>Excluir Rack</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
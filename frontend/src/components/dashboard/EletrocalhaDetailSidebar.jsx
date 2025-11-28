import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { eletrocalhasService } from '../../api/eletrocalhasService';
import { toGridCoordinates } from '../../utils/coordinateConverter';
import { supabase } from '../../api/supabase';

// Estilos unificados
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

export default function EletrocalhaDetailSidebar({ eletrocalha, onClose, onDataUpdate, gridCellSize }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '', capacidade_maxima: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (eletrocalha) {
      console.log("Eletrocalha recebida no EletrocalhaDetailSidebar:", eletrocalha);
      setEditForm({ 
        nome: eletrocalha.nome || '', 
        capacidade_maxima: eletrocalha.capacidade_maxima || 0 
      });
      setIsEditing(false); // Reseta para o modo de visualização ao selecionar nova eletrocalha
    }
  }, [eletrocalha]);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Token de acesso não encontrado.");
    return session.access_token;
  };

  const handleSaveChanges = async () => {
    if (!eletrocalha) return;
    setIsProcessing(true);
    try {
      const accessToken = await getAccessToken();
      await eletrocalhasService.updateEletrocalha(eletrocalha.id, editForm, accessToken);
      toast.success("Eletrocalha atualizada com sucesso!");
      await onDataUpdate(); // Atualiza os dados na página principal
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar a eletrocalha.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir a eletrocalha "${eletrocalha.nome}"?`)) {
      setIsProcessing(true);
      try {
        const accessToken = await getAccessToken();
        await eletrocalhasService.deleteEletrocalha(eletrocalha.id, accessToken);
        toast.success("Eletrocalha excluída com sucesso!");
        onClose(); // Fecha a sidebar
        await onDataUpdate(); // Atualiza os dados na página principal
      } catch (err) {
        toast.error(err.message || "Erro ao excluir a eletrocalha.");
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  // Converte coordenadas do grid para nomes (ex: AA01)
  const getGridPosName = (x, y) => {
    if (typeof x !== 'number' || typeof y !== 'number' || !gridCellSize) return 'N/A';
    // Multiplica pelo tamanho da célula para obter a posição em pixels
    const { rowName, colName } = toGridCoordinates(x * gridCellSize, y * gridCellSize, gridCellSize);
    return `${rowName}${colName}`;
  };

  const occupancy = eletrocalha ? (eletrocalha.capacidade_maxima > 0 ? (eletrocalha.ocupacao_total / eletrocalha.capacidade_maxima) : 0) : 0;
  const occupancyPercentage = (occupancy * 100).toFixed(0);

  let progressBarColor;
  if (occupancy > 0.8) progressBarColor = '#ef4444'; // Vermelho
  else if (occupancy > 0.5) progressBarColor = '#eab308'; // Amarelo
  else progressBarColor = '#22c55e'; // Verde

  const dynamicSidebarStyles = {
    width: eletrocalha ? '380px' : '0px',
    borderLeft: eletrocalha ? '1px solid #eee' : 'none',
    margin: eletrocalha ? '0 0 30px 0' : '0',
  };

  return (
    <div style={{ ...styles.sidebar, ...dynamicSidebarStyles }}>
      {eletrocalha && (
        <>
          <div style={styles.header}>
            <h3 style={styles.title}>{isEditing ? 'Editar Eletrocalha' : 'Detalhes da Eletrocalha'}</h3>
            <button onClick={onClose} style={styles.closeButton} disabled={isProcessing}>&times;</button>
          </div>
          <div style={styles.content}>
            {isEditing ? (
              <>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Nome</label>
                  <input type="text" style={styles.input} value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Capacidade Máxima de Cabos</label>
                  <input type="number" style={styles.input} value={editForm.capacidade_maxima} onChange={e => setEditForm({ ...editForm, capacidade_maxima: parseInt(e.target.value) || 0 })} />
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
                  <div style={styles.detailValue}>{eletrocalha.nome}</div>
                </div>
                 <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Trajeto</div>
                  <div style={styles.detailValue}>
                    De {getGridPosName(eletrocalha.ponto_a_x, eletrocalha.ponto_a_y)} para {getGridPosName(eletrocalha.ponto_b_x, eletrocalha.ponto_b_y)}
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Ocupação: {eletrocalha.ocupacao_total || 0}/{eletrocalha.capacidade_maxima} Cabos ({occupancyPercentage}%)</div>
                  <div style={styles.progressBarContainer}>
                    <div style={{ ...styles.progressBar, width: `${occupancyPercentage}%`, backgroundColor: progressBarColor }}></div>
                  </div>
                </div>
                <div style={styles.buttonContainer}>
                  <button style={{ ...styles.button, ...styles.editButton }} onClick={() => setIsEditing(true)}>Editar</button>
                  <button style={{ ...styles.button, ...styles.deleteButton }} onClick={handleDelete}>Excluir</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

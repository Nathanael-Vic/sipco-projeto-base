import React, { useState } from 'react';
import { supabase } from '../../api/supabase'; // Import supabase client

const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalBox: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalHeader: { display:'flex', justifyContent:'space-between', marginBottom: 20 },
  modalTitle: { margin:0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { cursor:'pointer', fontSize: '20px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #CED4DA', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '10px' },
  checkboxGroup: { display: 'flex', alignItems: 'center', marginBottom: '15px' },
  checkboxLabel: { marginLeft: '8px', fontSize: '14px', fontWeight: '500', color: '#333' },
  btnPrimary: { padding: '10px 20px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' },
  btnCancel: { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #ddd', color: '#333', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
};

export default function AddRackModal({ project, onClose, onSuccess }) {
  const [rackForm, setRackForm] = useState({
    nome: '', coluna: 1, linha: 1, capacidade: 42, ocupado: 0, is_cross_connect: false
  });
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Usuário não autenticado.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  };

  const handleSaveRack = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/racks`, { // Added trailing slash for consistency
        method: "POST",
        headers,
        body: JSON.stringify({
          project_id: project.id,
          nome: rackForm.nome,
          coordenada_x: parseInt(rackForm.coluna),
          coordenada_y: parseInt(rackForm.linha),
          capacidade_u: parseInt(rackForm.capacidade),
          ocupado_u: parseInt(rackForm.ocupado),
          is_cross_connect: rackForm.is_cross_connect
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao salvar");
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Adicionar Rack</h3>
          <span style={styles.closeBtn} onClick={onClose}>✕</span>
        </div>
        <p style={{color: '#666', fontSize: '14px', marginBottom: '20px'}}>
          Preencha os dados do novo rack. Certifique-se de que a posição está disponível.
        </p>
        
        <form onSubmit={handleSaveRack}>
          <label style={styles.label}>Nome do Rack</label>
          <input style={styles.input} required placeholder="Ex: Rack C-03" value={rackForm.nome} onChange={e => setRackForm({...rackForm, nome: e.target.value})} />
          
          <div style={styles.row}>
            <div style={{flex:1}}><label style={styles.label}>Linha (Row)</label><input type="number" style={styles.input} required min="1" value={rackForm.linha} onChange={e => setRackForm({...rackForm, linha: e.target.value})} /></div>
            <div style={{flex:1}}><label style={styles.label}>Coluna (Col)</label><input type="number" style={styles.input} required min="1" value={rackForm.coluna} onChange={e => setRackForm({...rackForm, coluna: e.target.value})} /></div>
          </div>

          <div style={styles.row}>
            <div style={{flex:1}}><label style={styles.label}>Capacidade (U)</label><input type="number" style={styles.input} required value={rackForm.capacidade} onChange={e => setRackForm({...rackForm, capacidade: e.target.value})} /></div>
            <div style={{flex:1}}><label style={styles.label}>Ocupado (U)</label><input type="number" style={styles.input} required value={rackForm.ocupado} onChange={e => setRackForm({...rackForm, ocupado: e.target.value})} /></div>
          </div>

          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="isCrossConnect" 
              checked={rackForm.is_cross_connect} 
              onChange={e => setRackForm({...rackForm, is_cross_connect: e.target.checked})} 
            />
            <label htmlFor="isCrossConnect" style={styles.checkboxLabel}>Rack Cross Connect (CC)</label>
          </div>

          <div style={{marginTop:20, display:'flex', gap:10, justifyContent: 'flex-end'}}>
            <button type="button" style={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" style={styles.btnPrimary} disabled={saving}>{saving ? '...' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
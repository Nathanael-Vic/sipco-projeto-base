import React, { useState } from 'react';

const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalBox: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' },
  label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #CED4DA', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '10px' },
  btnPrimary: { padding: '10px 20px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' },
  btnCancel: { padding: '10px 20px', backgroundColor: '#ccc', color: '#333', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }
};

export default function CreateProjectModal({ onClose, onSuccess }) {
  const [newProject, setNewProject] = useState({ name: '', cols: 30, rows: 20 });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const widthMM = newProject.cols * 40; 
    const heightMM = newProject.rows * 40;
    
    await fetch(import.meta.env.VITE_API_BASE_URL + "/projects", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ nome: newProject.name, largura: widthMM, altura: heightMM }) 
    });
    
    setLoading(false);
    onSuccess(); 
    onClose();   
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <h3 style={styles.modalTitle}>Nova Planta</h3>
        <form onSubmit={handleCreate}>
          <label style={styles.label}>Nome do Projeto</label>
          <input style={styles.input} required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
          
          <div style={styles.row}>
            <div style={{flex:1}}>
              <label style={styles.label}>Largura (blocos)</label>
              <input type="number" style={styles.input} required min="5" max="100" value={newProject.cols} onChange={e => setNewProject({...newProject, cols: Number(e.target.value)})} />
            </div>
            <div style={{flex:1}}>
              <label style={styles.label}>Altura (blocos)</label>
              <input type="number" style={styles.input} required min="5" max="100" value={newProject.rows} onChange={e => setNewProject({...newProject, rows: Number(e.target.value)})} />
            </div>
          </div>
          
          <div style={{marginTop:'20px', display:'flex', gap:'10px', justifyContent: 'flex-end'}}>
            <button type="button" style={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>{loading ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
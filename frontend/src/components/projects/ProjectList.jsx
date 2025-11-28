import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header'; // Corrected import path
import CreateProjectModal from './CreateProjectModal';
import { supabase } from '../../api/supabase'; // Import supabase client

const styles = {
  wrapper: { minHeight: '100vh', backgroundColor: '#F8F9FA', display: 'flex', flexDirection: 'column' },
  projectContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  projectsWrapperCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #E9ECEF', width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', maxHeight: '80vh' },
  projectsGridScroll: { overflowY: 'auto', padding: '10px' },
  projectGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', width: '100%' },
  projectCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  btnAddProject: { backgroundColor: '#111', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  btnDeleteProject: { position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: '#fff', color: '#DC3545', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 5 },
  
  // Modal Delete
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  deleteModalBox: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center' },
  warningText: { color: '#666', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' },
  confirmInput: { width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #CED4DA', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  btnDanger: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' },
  btnCancel: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#F8F9FA', color: '#333', fontWeight: 'bold', cursor: 'pointer' },
};

export default function ProjectList({ session, onSelectProject, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + "/projects", { headers });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Erro ao buscar projetos.");
      }
      setProjects(data || []); // API now returns list directly
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      // alert(`Erro ao carregar projetos: ${error.message}`);
    }
  };

  const openDeleteModal = (e, project) => { e.stopPropagation(); setProjectToDelete(project); setDeleteInput(''); };
  
  const handleDelete = async () => {
    if (deleteInput !== projectToDelete.nome) return;
    setIsDeleting(true);
    try { 
      const headers = await getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${projectToDelete.id}`, { 
        method: "DELETE",
        headers,
      }); 
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao deletar projeto.");
      }

      setTimeout(() => { 
        setIsDeleting(false); 
        setProjectToDelete(null); 
        fetchProjects(); 
      }, 500); 
    } catch (err) { 
      alert("Erro ao deletar: " + err.message); 
      setIsDeleting(false); 
    }
  };

  const isDeleteEnabled = projectToDelete && deleteInput === projectToDelete.nome;

  return (
    <div style={styles.wrapper}>
      <Header session={session} onLogout={onLogout} />
      
      <div style={styles.projectContainer}>
        <div style={styles.projectsWrapperCard}>
          <div style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
            <h2 style={{margin:0}}>Meus Projetos</h2>
            <p style={{margin:0, color: '#888', fontSize: '14px'}}>Gerencie suas plantas de data center</p>
          </div>

          <div style={styles.projectsGridScroll}>
            <div style={styles.projectGrid}>
              <button style={styles.btnAddProject} onClick={() => setShowCreateModal(true)}>
                <span style={{fontSize: '40px', marginBottom: '10px'}}>＋</span>
                <span style={{fontWeight: 'bold'}}>Criar Nova Planta</span>
              </button>

              {projects.map(p => (
                <div key={p.id} style={styles.projectCard} onClick={() => onSelectProject(p)}>
                  <button style={styles.btnDeleteProject} onClick={(e) => openDeleteModal(e, p)} title="Excluir projeto">✕</button>
                  <h3 style={{margin: '0 0 10px', color: '#343A40'}}>{p.nome}</h3>
                  <p style={{margin: 0, color: '#666', fontSize: '14px'}}>Dimensões: {p.largura_mm / 600}x{p.altura_mm / 600} blocos</p>
                  <p style={{margin: '5px 0 0', color: '#ADB5BD', fontSize: '12px'}}>ID: #{p.id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={(createdProject) => {
            setShowCreateModal(false);
            onSelectProject(createdProject, true); // Pass new project and flag for suggestion
          }} 
        />
      )}

      {projectToDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.deleteModalBox}>
            <h3 style={{margin: '0 0 15px', color: '#DC3545'}}>Excluir Projeto?</h3>
            <p style={styles.warningText}>Esta ação <b>não pode ser desfeita</b>. Isso excluirá o projeto <b>{projectToDelete.nome}</b>.</p>
            <p style={{fontSize: '14px', marginBottom: '5px', textAlign: 'left'}}>Digite <b>{projectToDelete.nome}</b> para confirmar:</p>
            <input style={styles.confirmInput} value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder={projectToDelete.nome} />
            <div style={{display: 'flex', gap: '10px'}}>
              <button style={styles.btnCancel} onClick={() => setProjectToDelete(null)}>Cancelar</button>
              <button 
                style={{...styles.btnDanger, backgroundColor: isDeleteEnabled ? '#DC3545' : '#F8D7DA', color: isDeleteEnabled ? '#fff' : '#721C24', cursor: isDeleteEnabled ? 'pointer' : 'not-allowed'}} 
                disabled={!isDeleteEnabled || isDeleting} 
                onClick={handleDelete}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
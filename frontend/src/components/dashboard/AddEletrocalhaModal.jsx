import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { eletrocalhasService } from '../../api/eletrocalhasService';
import { toRowName, toColumnName } from '../../utils/coordinateConverter'; // Import these for naming suggestions

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' },
  header: { fontSize: '24px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '15px', fontWeight: '600', color: '#555' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', color: '#333' },
  select: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', color: '#333' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '20px', borderTop: '1px solid #eee', marginTop: '20px' },
  button: { padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.3s ease' },
  buttonPrimary: { backgroundColor: '#007bff', color: '#fff', border: 'none', '&:hover': { backgroundColor: '#0056b3' } },
  buttonSecondary: { backgroundColor: '#6c757d', color: '#fff', border: 'none', '&:hover': { backgroundColor: '#5a6268' } },
  buttonSuggest: { backgroundColor: '#28a745', color: '#fff', border: 'none', '&:hover': { backgroundColor: '#218838' } },
  buttonClose: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#aaa' },
  choiceButton: { width: '100%', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', transition: 'all 0.3s ease', marginBottom: '10px' },
  choicePrimary: { backgroundColor: '#007bff', color: '#fff', border: 'none' },
  choiceSecondary: { backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ddd' },
};

export default function AddEletrocalhaModal({ project, onClose, onSuccess, initialPoints = null, suggestedEletrocalhas = [], onSuggestPreview }) {
  const [viewMode, setViewMode] = useState('choose'); // 'choose', 'manual', 'suggest'
  const [nome, setNome] = useState('');
  const [pontoAX, setPontoAX] = useState('');
  const [pontoAY, setPontoAY] = useState('');
  const [pontoBX, setPontoBX] = useState('');
  const [pontoBY, setPontoBY] = useState('');
  const [loading, setLoading] = useState(false);
  const [capacidadeMaxima, setCapacidadeMaxima] = useState(100);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const getAccessToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Usuário não autenticado.');
    }
    return session.access_token;
  };

  useEffect(() => {
    if (initialPoints && initialPoints.length === 2) {
      setPontoAX(initialPoints[0].x.toString());
      setPontoAY(initialPoints[0].y.toString());
      setPontoBX(initialPoints[1].x.toString());
      setPontoBY(initialPoints[1].y.toString());
      setViewMode('manual');
    } else if (suggestedEletrocalhas.length > 0) {
      setViewMode('suggest'); // Se já há sugestões, vai direto para a tela de sugestão
    } else {
      setViewMode('choose'); // Caso contrário, mostra as opções
    }
  }, [initialPoints, suggestedEletrocalhas]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessToken = await getAccessToken();
      const newEletrocalha = {
        project_id: project.id,
        nome: nome,
        ponto_a_x: parseInt(pontoAX),
        ponto_a_y: parseInt(pontoAY),
        ponto_b_x: parseInt(pontoBX),
        ponto_b_y: parseInt(pontoBY),
        capacidade_maxima: capacidadeMaxima,
        ocupacao_total: 0,
      };

      await eletrocalhasService.createEletrocalha(newEletrocalha, accessToken);

      toast.success('Eletrocalha criada com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar eletrocalha:', error);
      toast.error(error.message || 'Erro ao criar eletrocalha.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestGrid = async (confirm = false) => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      const realWorldGridUnit = 600; // 1 bloco = 600mm
      const cols = Math.floor(project.largura_mm / realWorldGridUnit);
      const rows = Math.floor(project.altura_mm / realWorldGridUnit);

      const suggestionData = {
        project_id: project.id,
        cols: cols,
        rows: rows,
        capacidade_maxima_default: capacidadeMaxima
      };

      const suggestResponse = await fetch(`${apiBaseUrl}/api/v1/sugestoes/layout-grid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(suggestionData),
      });

      if (!suggestResponse.ok) {
        const errorData = await suggestResponse.json();
        throw new Error(errorData.detail || 'Falha ao sugerir layout.');
      }

      const suggested = await suggestResponse.json();

      if (confirm) {
        if (suggested.length === 0) {
          toast.info('Nenhuma eletrocalha sugerida para criação.');
          setLoading(false);
          onClose();
          return;
        }

        const creationPromises = suggested.map(async (eletrocalha) => {
          // Determine type based on points
          const type = eletrocalha.ponto_a_x === eletrocalha.ponto_b_x ? 'V' : 'H';
          const name = `EL-${type}${type === 'V' ? toColumnName(eletrocalha.ponto_a_x - 1) : toRowName(eletrocalha.ponto_a_y - 1)}`;

          const eletrocalhaToCreate = {
            project_id: project.id,
            nome: name,
            ponto_a_x: eletrocalha.ponto_a_x,
            ponto_a_y: eletrocalha.ponto_a_y,
            ponto_b_x: eletrocalha.ponto_b_x,
            ponto_b_y: eletrocalha.ponto_b_y,
            capacidade_maxima: eletrocalha.capacidade_maxima || capacidadeMaxima,
            ocupacao_total: 0,
          };
          return eletrocalhasService.createEletrocalha(eletrocalhaToCreate, accessToken);
        });

        await Promise.all(creationPromises);
        toast.success(`${suggested.length} eletrocalhas sugeridas e criadas com sucesso!`);
        onSuccess();
        onClose();
      } else {
        // Envia as sugestões para preview no mapa
        onSuggestPreview(suggested);
        setViewMode('suggest'); // Muda para o modo de exibição de sugestão
        toast.info("Sugestão de layout em grade gerada. Confirme para criar.");
      }
      
    } catch (error) {
      console.error('Erro ao sugerir/criar eletrocalhas:', error);
      toast.error(error.message || 'Erro no processo de sugestão.');
    } finally {
      setLoading(false);
    }
  };


  const renderManualForm = () => (
    <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <p style={{marginBottom: '10px', color: '#333', fontSize: '14px'}}>
        {initialPoints && initialPoints.length === 2 ?
            `Pontos selecionados no mapa: A: (${initialPoints[0].x}, ${initialPoints[0].y}) - B: (${initialPoints[1].x}, ${initialPoints[1].y})`
            : "Preencha as coordenadas da eletrocalha."
        }
      </p>
      <div style={modalStyles.formGroup}>
        <label htmlFor="nome" style={modalStyles.label}>Nome</label>
        <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} style={modalStyles.input} placeholder="Ex: EL-H1" required />
      </div>
      <div style={modalStyles.formGroup}>
        <label htmlFor="capacidadeMaxima" style={modalStyles.label}>Capacidade Máxima (Cabos)</label>
        <input id="capacidadeMaxima" type="number" value={capacidadeMaxima} onChange={(e) => setCapacidadeMaxima(parseInt(e.target.value) || 0)} style={modalStyles.input} required min="1" />
      </div>
      {/* Coordinate inputs, read-only if points are from map */}
      <div style={modalStyles.formGroup}>
        <label htmlFor="pontoAX" style={modalStyles.label}>Ponto A (X)</label>
        <input id="pontoAX" type="number" value={pontoAX} onChange={(e) => setPontoAX(e.target.value)} style={modalStyles.input} required readOnly={initialPoints && initialPoints.length > 0} />
      </div>
      <div style={modalStyles.formGroup}>
        <label htmlFor="pontoAY" style={modalStyles.label}>Ponto A (Y)</label>
        <input id="pontoAY" type="number" value={pontoAY} onChange={(e) => setPontoAY(e.target.value)} style={modalStyles.input} required readOnly={initialPoints && initialPoints.length > 0} />
      </div>
      <div style={modalStyles.formGroup}>
        <label htmlFor="pontoBX" style={modalStyles.label}>Ponto B (X)</label>
        <input id="pontoBX" type="number" value={pontoBX} onChange={(e) => setPontoBX(e.target.value)} style={modalStyles.input} required readOnly={initialPoints && initialPoints.length > 0} />
      </div>
      <div style={modalStyles.formGroup}>
        <label htmlFor="pontoBY" style={modalStyles.label}>Ponto B (Y)</label>
        <input id="pontoBY" type="number" value={pontoBY} onChange={(e) => setPontoBY(e.target.value)} style={modalStyles.input} required readOnly={initialPoints && initialPoints.length > 0} />
      </div>

      <div style={modalStyles.buttonGroup}>
        <button type="button" onClick={onClose} style={{ ...modalStyles.button, ...modalStyles.buttonSecondary }} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" style={{ ...modalStyles.button, ...modalStyles.buttonPrimary }} disabled={loading}>
          {loading ? 'Adicionando...' : 'Adicionar Manualmente'}
        </button>
      </div>
    </form>
  );

  const renderSuggestForm = () => (
    <>
      <p style={{marginBottom: '15px', color: '#333', fontSize: '14px'}}>
        Um layout em grade foi sugerido. Confirme a criação dessas {suggestedEletrocalhas.length} eletrocalhas.
      </p>
      <div style={modalStyles.formGroup}>
        <label htmlFor="capacidadePadrao" style={modalStyles.label}>Capacidade Padrão (Cabos)</label>
        <input id="capacidadePadrao" type="number" value={capacidadeMaxima} onChange={(e) => setCapacidadeMaxima(parseInt(e.target.value) || 0)} style={modalStyles.input} required min="1" />
      </div>
      <div style={modalStyles.buttonGroup}>
        <button type="button" onClick={onClose} style={{ ...modalStyles.button, ...modalStyles.buttonSecondary }} disabled={loading}>
          Cancelar
        </button>
        <button type="button" onClick={() => handleSuggestGrid(true)} style={{ ...modalStyles.button, ...modalStyles.buttonSuggest }} disabled={loading}>
          {loading ? 'Criando Sugestões...' : `Confirmar ${suggestedEletrocalhas.length} Eletrocalhas`}
        </button>
      </div>
    </>
  );

  const renderChooseMode = () => (
    <>
      <p style={{marginBottom: '20px', color: '#333', fontSize: '14px'}}>
        Como você gostaria de adicionar as eletrocalhas?
      </p>
      <button 
        style={{ ...modalStyles.choiceButton, ...modalStyles.choicePrimary }} 
        onClick={() => setViewMode('manual')}
        disabled={loading}
      >
        Adicionar Manualmente (com coordenadas)
      </button>
      <button 
        style={{ ...modalStyles.choiceButton, ...modalStyles.choiceSecondary }} 
        onClick={() => handleSuggestGrid()}
        disabled={loading}
      >
        Sugerir Layout em Grid
      </button>
      <div style={{ ...modalStyles.buttonGroup, borderTop: 'none', paddingTop: '0' }}>
        <button type="button" onClick={onClose} style={{ ...modalStyles.button, ...modalStyles.buttonSecondary }} disabled={loading}>
            Cancelar
        </button>
      </div>
    </>
  );

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <button style={modalStyles.buttonClose} onClick={onClose}>&times;</button>
        <h2 style={modalStyles.header}>Adicionar Eletrocalha</h2>

        {viewMode === 'choose' && renderChooseMode()}
        {viewMode === 'manual' && renderManualForm()}
        {viewMode === 'suggest' && renderSuggestForm()}
      </div>
    </div>
  );
}


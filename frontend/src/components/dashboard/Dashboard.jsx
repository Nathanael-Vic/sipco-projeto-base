import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Header from '../common/Header';
import DataHallMap from './DataHallMap';
import AddRackModal from './AddRackModal';

const styles = {
  wrapper: { minHeight: '100vh', backgroundColor: '#F8F9FA', display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI, sans-serif' },
  toolbar: { padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  actionButtons: { display: 'flex', gap: '10px' },
  btnAction: { backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer' },
  btnSecondary: { backgroundColor: '#fff', color: '#343A40', border: '1px solid #DEE2E6', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  legend: { display: 'flex', gap: '15px', alignItems: 'center', fontSize: '14px', color: '#6C757D' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  dot: { width: '10px', height: '10px', borderRadius: '2px' },
  mapCard: { flex: 1, margin: '0 30px 30px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #F1F3F5', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '600px' },
  mapHeader: { padding: '20px 25px', borderBottom: '1px solid #F1F3F5' },
  mapTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  appSubtitle: { fontSize: '13px', color: '#6C757D', margin: 0 },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' },
};

export default function Dashboard({ session, project, onBack, onLogout }) {
  const [racks, setRacks] = useState([]);
  const [eletrocalhas, setEletrocalhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRackModal, setShowRackModal] = useState(false);
  
  const wrapperRef = useRef(null);
  const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const { clientWidth, clientHeight } = wrapperRef.current;
      const fitScale = Math.min(clientWidth / project.largura_mm, clientHeight / project.altura_mm) * 0.9;
      const centerX = (clientWidth - project.largura_mm * fitScale) / 2;
      const centerY = (clientHeight - project.altura_mm * fitScale) / 2;
      setStageState({ scale: fitScale, x: centerX, y: centerY });
    }
  }, [project]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = { x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale, y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale };
    const newScale = Math.max(0.1, Math.min(e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy, 5));
    setStageState({ scale: newScale, x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale, y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale });
  };

  const handleDragEnd = (e) => { setStageState(prev => ({ ...prev, x: e.target.x(), y: e.target.y() })); };

  const fetchMapData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/racks?project_id=${project.id}`),
      fetch(`${import.meta.env.VITE_API_BASE_URL}/eletrocalhas?project_id=${project.id}`)
    ])
    .then(async ([r, e]) => {
      const dR = await r.json();
      const dE = await e.json();
      setRacks(dR.racks || []);
      setEletrocalhas(dE.eletrocalhas || []);
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMapData(); }, [project]);

  return (
    <div style={styles.wrapper}>
      <Header session={session} onLogout={onLogout} />
      <div style={styles.toolbar}>
        <div style={styles.actionButtons}>
          <button onClick={onBack} style={{...styles.btnSecondary, backgroundColor: '#eee'}}>◀ Voltar</button>
          <button onClick={() => setShowRackModal(true)} style={styles.btnAction}>＋ Rack</button>
          <button style={styles.btnSecondary}>📦 Eletrocalha</button>
          <button style={styles.btnSecondary}>⚡ Rota</button>
        </div>
        <div style={styles.legend}>
          <div style={styles.legendItem}><div style={{...styles.dot, backgroundColor: '#28A745'}}></div> Disponível</div>
          <div style={styles.legendItem}><div style={{...styles.dot, backgroundColor: '#FFC107'}}></div> Parcial</div>
          <div style={styles.legendItem}><div style={{...styles.dot, backgroundColor: '#DC3545'}}></div> Cheio</div>
        </div>
      </div>

      <div style={styles.mapCard}>
        <div style={styles.mapHeader}> <h3 style={styles.mapTitle}>Planta: {project.nome}</h3> <p style={styles.appSubtitle}>Dimensão: {project.largura_mm / 40} x {project.altura_mm / 40} blocos</p> </div>
        <div ref={wrapperRef} style={styles.mapArea}>
          {loading ? <div style={{padding: '40px'}}>Carregando mapa...</div> : (
            <DataHallMap 
              racks={racks} 
              eletrocalhas={eletrocalhas} 
              width={wrapperRef.current?.clientWidth || 800} 
              height={wrapperRef.current?.clientHeight || 600}
              stageState={stageState}
              onWheel={handleWheel}
              onDragEnd={handleDragEnd}
              projectWidth={project.largura_mm}
              projectHeight={project.altura_mm}
            />
          )}
        </div>
      </div>

      {showRackModal && (
        <AddRackModal 
          project={project} 
          onClose={() => setShowRackModal(false)} 
          onSuccess={fetchMapData} 
        />
      )}
    </div>
  );
}
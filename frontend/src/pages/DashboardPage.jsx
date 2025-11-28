import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import Header from '../components/common/Header';
import DataHallMap from '../components/canvas/DataHallMap';
import AddRackModal from '../components/dashboard/AddRackModal';
import AddEletrocalhaModal from '../components/dashboard/AddEletrocalhaModal';
import RackDetailSidebar from '../components/dashboard/RackDetailSidebar';
import EletrocalhaDetailSidebar from '../components/dashboard/EletrocalhaDetailSidebar'; // Importa o novo componente
import PlanRouteModal from '../components/dashboard/PlanRouteModal';
import RouteDetailSidebar from '../components/dashboard/RouteDetailSidebar';
import EletrocalhaList from '../components/dashboard/EletrocalhaList';
import ProjectStatistics from '../components/dashboard/ProjectStatistics';
import AlertsDashboard from '../components/dashboard/AlertsDashboard';
import { supabase } from '../api/supabase';
import { eletrocalhasService } from '../api/eletrocalhasService';
import { routesService } from '../api/routesService';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export default function Dashboard({ session, project, onBack, onLogout, triggerEletrocalhaSuggestion, setTriggerEletrocalhaSuggestion }) {
  const [racks, setRacks] = useState([]);
  const [eletrocalhas, setEletrocalhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRackModal, setShowRackModal] = useState(false);
  // State for Eletrocalha drawing mode (REMOVED)
  // const [isDrawingEletrocalha, setIsDrawingEletrocalha] = useState(false);
  // const [eletrocalhaPoints, setEletrocalhaPoints] = useState([]); // Stores {x, y} coordinates for point A and B (REMOVED)
  const [showEletrocalhaModal, setShowEletrocalhaModal] = useState(false);
  const [previewEletrocalhas, setPreviewEletrocalhas] = useState([]);
  const [showPlanRouteModal, setShowPlanRouteModal] = useState(false);
  const [originRackId, setOriginRackId] = useState('');
  const [destinationRackId, setDestinationRackId] = useState('');
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [plannedRouteDistance, setPlannedRouteDistance] = useState(0);
  const [allProjectRoutes, setAllProjectRoutes] = useState([]);
  const [showRoutes, setShowRoutes] = useState(true); // Novo estado para controlar a visibilidade das rotas
  const [rackSearchTerm, setRackSearchTerm] = useState(''); // Estado para o termo de busca de racks

  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedEletrocalha, setSelectedEletrocalha] = useState(null); // State para a eletrocalha selecionada
  const [activeSidebar, setActiveSidebar] = useState(null); // 'rack', 'eletrocalha', 'route'
  
  const wrapperRef = useRef(null);
  const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });

  const filteredRacks = useMemo(() => {
    if (!rackSearchTerm) {
      return racks;
    }
    return racks.filter(rack =>
      rack.nome.toLowerCase().includes(rackSearchTerm.toLowerCase())
    );
  }, [racks, rackSearchTerm]);

  const fetchAllProjectRoutes = async () => {
    try {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Usuário não autenticado.");
      const routes = await routesService.getProjectRoutes(project.id, accessToken);
      setAllProjectRoutes(routes);
    } catch (error) {
      console.error("Erro ao buscar todas as rotas do projeto:", error);
      toast.error("Não foi possível carregar as rotas do projeto.");
    }
  };

  const handleExportReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Racks
    csvContent += "--- Racks ---\n";
    csvContent += "ID,Nome,Coord_X,Coord_Y,Altura_U,Capacidade_U,Ocupado_U,Cross_Connect\n";
    racks.forEach(rack => {
      csvContent += `${rack.id},${rack.nome},${rack.coordenada_x},${rack.coordenada_y},${rack.altura_u},${rack.capacidade_u},${rack.ocupado_u},${rack.is_cross_connect ? 'Sim' : 'Não'}\n`;
    });
    csvContent += "\n";

    // Eletrocalhas
    csvContent += "--- Eletrocalhas ---\n";
    csvContent += "ID,Nome,Ponto_A_X,Ponto_A_Y,Ponto_B_X,Ponto_B_Y,Capacidade_Maxima,Ocupacao_Total\n";
    eletrocalhas.forEach(calha => {
      csvContent += `${calha.id},${calha.nome},${calha.ponto_a_x},${calha.ponto_a_y},${calha.ponto_b_x},${calha.ponto_b_y},${calha.capacidade_maxima},${calha.ocupacao_total}\n`;
    });
    csvContent += "\n";

    // Rotas
    csvContent += "--- Rotas ---\n";
    csvContent += "ID,Nome,Origem_Rack_ID,Destino_Rack_ID,Distancia_Metros,Eletrocalhas_IDs\n";
    allProjectRoutes.forEach(route => {
      csvContent += `${route.id},${route.nome || 'N/A'},${route.rack_origem_id},${route.rack_destino_id},${route.distancia_metros},"${route.eletrocalhas_ids ? route.eletrocalhas_ids.join('|') : ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_projeto_${project.nome.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório CSV exportado com sucesso!");
  };

  const handlePlanRoute = async (origin, destination) => {
    try {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Usuário não autenticado.");
      
      toast.info("Calculando a melhor rota...");
      const result = await routesService.findRoute(project.id, origin, destination, accessToken);
      
      setPlannedRoute(result.rota);
      setPlannedRouteDistance(result.distancia_total_m);
      setActiveSidebar('route'); // Ativa a sidebar de rota
      setSelectedRack(null); // Garante que racks não estejam selecionados
      setSelectedEletrocalha(null); // Garante que eletrocalhas não estejam selecionadas
      toast.success(`Rota encontrada com ${result.distancia_total_m}m.`);
      
    } catch (error) {
      console.error("Erro ao planejar rota:", error);
      toast.error(error.message || "Não foi possível encontrar uma rota.");
      setPlannedRoute(null); // Limpa a rota em caso de erro
    }
  };


  const handleConfirmRoute = async () => {
    if (!plannedRoute) {
      toast.error("Nenhuma rota para confirmar.");
      return;
    }
    
    try {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Usuário não autenticado.");

      const routeData = {
        project_id: project.id,
        rack_origem_id: parseInt(originRackId),
        rack_destino_id: parseInt(destinationRackId),
        distancia_metros: plannedRouteDistance,
        eletrocalhas_ids: plannedRoute.map(e => e.id),
        caminho_json: plannedRoute,
      };

      await routesService.confirmRoute(routeData, accessToken);
      
      toast.success("Rota confirmada e salva com sucesso!");
      
      // Limpa e atualiza
      setPlannedRoute(null);
      setPlannedRouteDistance(0);
      setOriginRackId('');
      setDestinationRackId('');
      refreshMapData();

    } catch (error) {
      console.error("Erro ao confirmar rota:", error);
      toast.error(error.message || "Não foi possível confirmar a rota.");
    }
  };

  useLayoutEffect(() => {
    if (wrapperRef.current && project) {
      const { clientWidth, clientHeight } = wrapperRef.current;
      const fitScale = Math.min(clientWidth / (project.largura_mm / 600 * 40 + 160), clientHeight / (project.altura_mm / 600 * 40 + 160)) * 0.9;
      const centerX = (clientWidth - (project.largura_mm / 600 * 40 + 160) * fitScale) / 2;
      const centerY = (clientHeight - (project.altura_mm / 600 * 40 + 160) * fitScale) / 2;
      setStageState({ scale: fitScale, x: centerX, y: centerY });
    }
  }, [project?.id, project?.largura_mm, project?.altura_mm]);

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

  const getAuthHeaders = () => {
    if (!session || !session.access_token) {
      throw new Error('Usuário não autenticado.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  };

  const fetchRacks = async () => {
    // setLoading(true); // Removido para ser definido em refreshMapData
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/racks?project_id=${project.id}`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao carregar racks.');
      }

      setRacks(data || []);
    } catch (error) {
      console.error('Erro ao carregar racks:', error);
      toast.error('Erro ao carregar racks.');
    } finally {
      // setLoading(false); // Removido para ser definido em refreshMapData
    }
  };

  const fetchEletrocalhas = async () => {
    // setLoading(true); // Pode ser ajustado para um estado de loading mais granular se necessário
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/eletrocalhas?project_id=${project.id}`, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao carregar eletrocalhas.');
      }

      setEletrocalhas(data || []);
    } catch (error) {
      console.error('Erro ao carregar eletrocalhas:', error);
      toast.error('Erro ao carregar eletrocalhas.');
    } finally {
      // setLoading(false); // Pode ser ajustado
    }
  };

  const refreshMapData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRacks(),
      fetchEletrocalhas(),
      fetchAllProjectRoutes()
    ]);
    setLoading(false);
  };

  useEffect(() => { 
    if (project?.id && session?.access_token) {
      refreshMapData();
    }
  }, [project?.id, session?.access_token]);

  // Effect to automatically open eletrocalha modal for new projects
  useEffect(() => {
    if (triggerEletrocalhaSuggestion) {
      setShowEletrocalhaModal(true); // Open modal for suggestion
      setTriggerEletrocalhaSuggestion(false); // Reset the flag
    }
  }, [triggerEletrocalhaSuggestion]);

    // Handlers para abrir e fechar sidebars
    const handleRackClick = (rack) => {
        console.log("handleRackClick recebido:", rack);
        setSelectedRack(rack);
        setSelectedEletrocalha(null);
        setPlannedRoute(null);
        setActiveSidebar('rack');
        console.log("selectedRack setado:", rack);
        console.log("activeSidebar setado:", 'rack');
    };

    const handleEletrocalhaClick = (eletrocalha) => {
        console.log("handleEletrocalhaClick recebido:", eletrocalha);
        setSelectedEletrocalha(eletrocalha);
        setSelectedRack(null); // Garante que a outra sidebar feche
    };

    const handleCloseSidebars = () => {
        setSelectedRack(null);
        setSelectedEletrocalha(null);
    };

  const handleEletrocalhaModalClose = () => {
    setShowEletrocalhaModal(false);
    setPreviewEletrocalhas([]); // Clear preview when modal closes
    refreshMapData(); // Refresh data in map
  };

  const handleSuggestPreview = (suggested) => {
    setPreviewEletrocalhas(suggested);
    setShowEletrocalhaModal(true); // Ensure modal is open to show confirm button
  };

  return (
    <div style={styles.wrapper}>
      <Header session={session} onLogout={onLogout} />
      <div style={styles.toolbar}>
        <div style={styles.actionButtons}>
          <button onClick={onBack} style={{...styles.btnSecondary, backgroundColor: '#eee'}}>◀ Voltar</button>
          <button onClick={() => setShowRackModal(true)} style={styles.btnAction}>＋ Rack</button>
          <button onClick={() => setShowEletrocalhaModal(true)} style={styles.btnSecondary}>📦 Eletrocalha</button>
          <button onClick={() => setShowPlanRouteModal(true)} style={styles.btnSecondary}>⚡ Rota</button>
          <button onClick={() => setShowRoutes(!showRoutes)} style={{ ...styles.btnSecondary, backgroundColor: showRoutes ? '#d1e7dd' : '#f8d7da', borderColor: showRoutes ? '#28a745' : '#dc3545', color: showRoutes ? '#155724' : '#721c24' }}>
            {showRoutes ? 'Esconder Rotas' : 'Mostrar Rotas'}
          </button>
          <button onClick={handleExportReport} style={styles.btnSecondary}>
            📄 Exportar Relatório
          </button>
        </div>
        <input 
          type="text"
          placeholder="Buscar rack por nome..."
          style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid #DEE2E6', fontSize: '14px', width: '200px' }}
          value={rackSearchTerm}
          onChange={(e) => setRackSearchTerm(e.target.value)}
        />
        <div style={styles.legend}>
          <div style={styles.legendItem}><div style={{...styles.dot, backgroundColor: '#28A745'}}></div> Disponível</div>
          <div style={styles.legendItem}><div style={{...styles.dot, backgroundColor: '#FFC107'}}></div> Parcial</div>
          <div style={styles.legendItem}><div style={{...styles.dot, backgroundColor: '#DC3545'}}></div> Cheio</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{...styles.mapCard, flex: 1, margin: '0 30px 30px' }}>
                      <div style={styles.mapHeader}> <h3 style={styles.mapTitle}>Planta: {project.nome}</h3> <p style={styles.appSubtitle}>Dimensão: {project.largura_mm / 600} x {project.altura_mm / 600} blocos</p> </div>
                      <div ref={wrapperRef} style={styles.mapArea}>
                                      {loading ? <div style={{padding: '40px'}}>Carregando...</div> : (
                                                        <DataHallMap 
                                                          racks={filteredRacks}
                                                          eletrocalhas={eletrocalhas} 
                                                          width={wrapperRef.current?.clientWidth || 800} 
                                                          height={wrapperRef.current?.clientHeight || 600}
                                                          stageState={stageState}
                                                          onWheel={handleWheel}
                                                          onDragEnd={handleDragEnd}
                                                          onRackClick={handleRackClick}
                                                          onEletrocalhaClick={handleEletrocalhaClick}
                                                          project={project}
                                                          session={session}
                                                          previewEletrocalhas={previewEletrocalhas}
                                                          originRackId={originRackId}
                                                          destinationRackId={destinationRackId}
                                                          plannedRoute={plannedRoute}
                                                          showRoutes={showRoutes}
                                                        />                                      )}
                      </div>
                    </div>
                    <AlertsDashboard eletrocalhas={eletrocalhas} />
                    <ProjectStatistics racks={racks} eletrocalhas={eletrocalhas} routes={allProjectRoutes} />
                    <EletrocalhaList eletrocalhas={eletrocalhas} onSelectEletrocalha={handleEletrocalhaClick} />
                  </div>
        
        {activeSidebar === 'rack' && selectedRack && (
            <RackDetailSidebar
            rack={selectedRack}
            onClose={handleCloseSidebars}
            onDataUpdate={refreshMapData}
            />
        )}

        {activeSidebar === 'eletrocalha' && selectedEletrocalha && (
            <EletrocalhaDetailSidebar
                eletrocalha={selectedEletrocalha}
                onClose={handleCloseSidebars}
                onDataUpdate={refreshMapData}
                gridCellSize={40}
            />
        )}

        {activeSidebar === 'route' && plannedRoute && (
            <RouteDetailSidebar
            route={plannedRoute}
            distance={plannedRouteDistance}
            originRack={racks.find(r => r.id === parseInt(originRackId))}
            destinationRack={racks.find(r => r.id === parseInt(destinationRackId))}
            onClose={handleCloseSidebars}
            onConfirm={handleConfirmRoute}
            />
        )}
      </div>

      {showRackModal && (
        <AddRackModal 
          project={project} 
          onClose={() => setShowRackModal(false)} 
          onSuccess={refreshMapData} 
        />
      )}

      {showEletrocalhaModal && (
        <AddEletrocalhaModal
          project={project}
          onClose={handleEletrocalhaModalClose}
          onSuccess={refreshMapData}
          onSuggestPreview={handleSuggestPreview}
          suggestedEletrocalhas={previewEletrocalhas}
        />
      )}

      {showPlanRouteModal && (
        <PlanRouteModal
          racks={filteredRacks}
          originRackId={originRackId}
          setOriginRackId={setOriginRackId}
          destinationRackId={destinationRackId}
          setDestinationRackId={setDestinationRackId}
          onClose={() => {
            setShowPlanRouteModal(false);
            setOriginRackId('');
            setDestinationRackId('');
          }}
          onPlanRoute={handlePlanRoute}
        />
      )}
    </div>
  );
}
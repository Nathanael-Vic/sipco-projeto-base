import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { supabase } from './supabaseClient';
import DataHallMap, { xCoords, gridSize, mapWidth, mapHeight } from './DataHallMap'; 

const styles = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100vh',
    backgroundColor: '#F4F4F4',
  },
  loginCard: {
    padding: '30px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  
  dashboardContainer: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '8px 20px', 
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerH2: {
    margin: 0,
    fontSize: '1.25rem'
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  mapContainerWrapper: { 
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'auto', 
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  mapContainer: { 
    position: 'relative',
    width: `${mapWidth + 25}px`, 
    height: `${mapHeight + 25}px`, 
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  xAxisRuler: { 
    position: 'absolute',
    top: 0,
    left: '25px', 
    width: `${mapWidth}px`,
    height: '25px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #CCCCCC',
    color: '#555',
    zIndex: 5,
    overflow: 'hidden',
  },
  yAxisRuler: { 
    position: 'absolute',
    top: '25px', 
    left: 0,
    width: '25px',
    height: `${mapHeight}px`,
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #CCCCCC',
    color: '#555',
    zIndex: 5,
    overflow: 'hidden',
  },
  rulerNumberX: {
    position: 'absolute',
    top: '5px',
    fontSize: '10px',
    textAlign: 'center',
    width: `${gridSize}px`,
    transform: 'translateX(-50%)',
    boxSizing: 'border-box',
  },
  rulerNumberY: {
    position: 'absolute',
    fontSize: '10px',
    width: '100%',
    textAlign: 'center',
    boxSizing: 'border-box',
    transform: 'translateY(-50%)',
  },
  mapStage: { 
    position: 'absolute',
    top: '25px', 
    left: '25px', 
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => { e.preventDefault(); setLoading(true); try { const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password, }); if (error) throw error; console.log('Login com sucesso!', data); } catch (error) { alert(error.message); } finally { setLoading(false); } };
  return ( <div style={styles.loginContainer}> <div style={styles.loginCard}> <h2 style={{ textAlign: 'center', marginTop: 0 }}>S.I.P.C.O.</h2> <p style={{ textAlign: 'center', color: '#555' }}>Acesse para continuar</p> <form onSubmit={handleLogin}> <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /> <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} /> <button type="submit" disabled={loading} style={{ width: '100%' }}> {loading ? 'Entrando...' : 'Entrar'} </button> </form> </div> </div> );
}

function Dashboard({ session }) {
  const [racks, setRacks] = useState([]);
  const [eletrocalhas, setEletrocalhas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stageState, setStageState] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });

  const handleWheel = (e) => { e.evt.preventDefault(); const scaleBy = 1.1; const stage = e.target.getStage(); const oldScale = stage.scaleX(); const pointer = stage.getPointerPosition(); const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale, }; let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy; newScale = Math.max(1, Math.min(newScale, 10)); let newX, newY; if (newScale === 1) { newX = 0; newY = 0; } else { newX = pointer.x - mousePointTo.x * newScale; newY = pointer.y - mousePointTo.y * newScale; } const newPos = getBoundedPosition(newX, newY, newScale); setStageState({ scale: newScale, ...newPos }); };
  
  const getBoundedPosition = (newX, newY, scale) => {
    const containerW = mapWidth;
    const containerH = mapHeight;
    
    const minX = containerW - (containerW * scale); 
    const minY = containerH - (containerH * scale);

    const boundedX = Math.max(minX, Math.min(newX, 0));
    const boundedY = Math.max(minY, Math.min(newY, 0));
    return { x: boundedX, y: boundedY };
  };

  const dragBoundFunc = (pos) => { const scale = stageState.scale; return getBoundedPosition(pos.x, pos.y, scale); };
  const handleDragEnd = (e) => { setStageState({ ...stageState, x: e.target.x(), y: e.target.y(), }); };
  
  const renderXAxis = () => {
    const numbers = [];
    const spacing = gridSize * stageState.scale;
    for (let i = 0; i < xCoords.length; i++) {
      if (spacing < 30 && i % 2 !== 0) continue; 
      if (spacing < 15 && i % 5 !== 0) continue; 
      const leftPos = ((i + 0.5) * gridSize * stageState.scale) + stageState.x;
      if (leftPos < -20 || leftPos > mapWidth + 40) continue;
      numbers.push( <span key={`x-${i}`} style={{...styles.rulerNumberX, left: `${leftPos}px`}}> {xCoords[i]} </span> );
    }
    return numbers;
  };
  const renderYAxis = () => {
    const numbers = [];
    const spacing = gridSize * stageState.scale;
    const numRows = mapHeight / gridSize;
    for (let j = 0; j < numRows; j++) {
      if (spacing < 30 && j % 2 !== 0) continue; 
      if (spacing < 15 && j % 5 !== 0) continue; 
      const topPos = ((j + 0.5) * gridSize * stageState.scale) + stageState.y;
      if (topPos < -20 || topPos > mapHeight + 40) continue;
      numbers.push( <span key={`y-${j}`} style={{...styles.rulerNumberY, top: `${topPos}px`}}> {j + 1} </span> );
    }
    return numbers;
  };
  
  useEffect(() => {
    const fetchInfraData = async () => {
      try {
        const racksApiUrl = import.meta.env.VITE_API_BASE_URL + "/racks";
        const calhasApiUrl = import.meta.env.VITE_API_BASE_URL + "/eletrocalhas";
        const [racksResponse, calhasResponse] = await Promise.all([
          fetch(racksApiUrl),
          fetch(calhasApiUrl)
        ]);
        const racksData = await racksResponse.json();
        const calhasData = await calhasResponse.json();
        setRacks(racksData.racks || []);
        setEletrocalhas(calhasData.eletrocalhas || []);
      } catch (err) {
        console.error("Erro ao buscar dados da infraestrutura:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfraData();
  }, []);

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.header}>
        <h2 style={styles.headerH2}>Dashboard (HU03 - Visualização da Planta)</h2>
        <div style={styles.headerInfo}>
          <span>Bem-vindo, {session.user.email}</span>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ 
              backgroundColor: '#E0E0E0',
              color: '#333',
              fontWeight: 'normal',
              fontSize: '14px',
              padding: '8px 12px'
            }}
          >
            Sair
          </button>
        </div>
      </div>
      
      <div style={styles.mapContainerWrapper}>
        {loading ? (
          <p>Carregando mapa e infraestrutura...</p>
        ) : (
          <div style={styles.mapContainer}>
            
            <div style={styles.xAxisRuler}>{renderXAxis()}</div>
            <div style={styles.yAxisRuler}>{renderYAxis()}</div>
            
            <div style={styles.mapStage}>
              <DataHallMap 
                racks={racks} 
                eletrocalhas={eletrocalhas}
                stageState={stageState}
                onWheel={handleWheel}
                onDragEnd={handleDragEnd}
                dragBoundFunc={dragBoundFunc}
                width={mapWidth} 
                height={mapHeight} 
              />
            </div>
            
            <div style={{...styles.yAxisRuler, ...styles.xAxisRuler, zIndex: 6, top: 0, left: 0, width: '25px', height: '25px'}} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); }); const { data: { subscription } } = supabase.auth.onAuthStateChange( (_event, session) => { setSession(session); } ); return () => subscription.unsubscribe(); }, []);
  return ( <div> {!session ? <Login /> : <Dashboard session={session} />} </div> );
}
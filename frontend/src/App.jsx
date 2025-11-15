import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient' 
import DataHallMap from './DataHallMap';

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error) throw error
      console.log('Login com sucesso!', data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>S.I.P.C.O. - Login (HU02)</h2>
      <p>Para testar, crie um usuário na aba "Authentication" do Supabase.</p>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        /><br/>
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        /><br/><br/>
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

function Dashboard({ session }) {
  const [racks, setRacks] = useState([]); 
  const [eletrocalhas, setEletrocalhas] = useState([]); 
  const [loading, setLoading] = useState(true); 

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
        alert("Erro ao carregar dados do backend. Veja o console.");
      } finally {
        setLoading(false); 
      }
    };

    fetchInfraData();
  }, []); 

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard (HU03 - Visualização da Planta)</h2>
        <div>
          <span style={{ marginRight: '10px' }}>Bem-vindo, {session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
      </div>

      <hr/>

      {loading ? (
        <p>Carregando mapa e infraestrutura...</p>
      ) : (
        <DataHallMap racks={racks} eletrocalhas={eletrocalhas} />
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div>
      {!session ? <Login /> : <Dashboard session={session} />}
    </div>
  )
}
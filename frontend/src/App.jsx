import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient' 

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
  const [racks, setRacks] = useState([])
  const [loadingRacks, setLoadingRacks] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL + "/racks"
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        setRacks(data.racks || [])
        setLoadingRacks(false)
      })
      .catch(err => {
        console.error("Erro ao buscar racks:", err)
        setLoadingRacks(false)
      })
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard (HU03)</h2>
      <p>Bem-vindo, {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Sair</button>
      
      <hr/>

      <h3>Racks (Buscados do FastAPI):</h3>
      {loadingRacks ? <p>Carregando racks...</p> : (
        <pre style={{ background: '#eee', padding: '10px' }}>
          {JSON.stringify(racks, null, 2)}
        </pre>
      )}
    </div>
  )
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
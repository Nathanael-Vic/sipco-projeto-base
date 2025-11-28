import { useState } from 'react';
import { supabase } from '../api/supabase';

const styles = {
  loginWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' },
  loginBox: { padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '380px', textAlign: 'center' },
  logoIcon: { width: '50px', height: '50px', backgroundColor: '#0056b3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', margin: '0 auto 15px' },
  input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: '1px solid #CED4DA', fontSize: '16px', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', fontSize: '16px', fontWeight: '600', marginTop: '20px', border: 'none', cursor: 'pointer' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginWrapper}>
      <div style={styles.loginBox}>
        <div style={styles.logoIcon}>🖥️</div>
        <h2 style={{margin: '0 0 20px'}}>Bem-vindo</h2>
        <form onSubmit={handleLogin}>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          <button style={styles.btnPrimary} disabled={loading}>{loading ? '...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  );
}
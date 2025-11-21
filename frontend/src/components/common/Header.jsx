import React from 'react';

const styles = {
  topBar: { backgroundColor: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', zIndex: 20 },
  logoArea: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { width: '40px', height: '40px', backgroundColor: '#0056b3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' },
  appTitle: { fontSize: '18px', fontWeight: '700', color: '#343A40', margin: 0 },
  appSubtitle: { fontSize: '13px', color: '#6C757D', margin: 0 },
  userInfo: { textAlign: 'right', marginRight: '15px' },
  userName: { fontWeight: '600', fontSize: '14px', color: '#343A40' },
  userEmail: { fontSize: '12px', color: '#888' },
  btnExit: { backgroundColor: 'transparent', border: '1px solid #DEE2E6', padding: '8px 16px', borderRadius: '6px', color: '#6C757D', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
};

export default function Header({ session, onLogout }) {
  return (
    <div style={styles.topBar}>
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>💾</div>
        <div>
          <h1 style={styles.appTitle}>Data Center Manager</h1>
          <p style={styles.appSubtitle}>Gestão de Infraestrutura</p>
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>Usuário Demo</div>
          <div style={styles.userEmail}>{session?.user?.email}</div>
        </div>
        <button style={styles.btnExit} onClick={onLogout}>
          <span>🚪</span> Sair
        </button>
      </div>
    </div>
  );
}
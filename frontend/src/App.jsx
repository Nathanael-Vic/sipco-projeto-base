import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/auth/Login';
import ProjectList from './components/projects/ProjectList';
import Dashboard from './components/dashboard/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  
  useEffect(() => { 
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session)); 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { 
      setSession(session); 
      if (!session) setCurrentProject(null); 
    }); 
    return () => subscription.unsubscribe(); 
  }, []);

  if (!session) return <Login />;
  if (!currentProject) return <ProjectList session={session} onSelectProject={setCurrentProject} onLogout={() => supabase.auth.signOut()} />;
  
  return <Dashboard session={session} project={currentProject} onBack={() => setCurrentProject(null)} onLogout={() => supabase.auth.signOut()} />;
}
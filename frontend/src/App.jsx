import { useState, useEffect } from 'react';
import { supabase } from './api/supabase';
import LoginPage from './pages/LoginPage';
import ProjectList from './components/projects/ProjectList';
import Dashboard from './pages/DashboardPage';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [triggerEletrocalhaSuggestion, setTriggerEletrocalhaSuggestion] = useState(false); // New state

  useEffect(() => { 
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session)); 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { 
      setSession(session); 
      if (!session) setCurrentProject(null); 
    }); 
    return () => subscription.unsubscribe(); 
  }, []);

  const handleSelectProject = (project, triggerSuggestion = false) => {
    setCurrentProject(project);
    setTriggerEletrocalhaSuggestion(triggerSuggestion);
  };

  if (!session) return <LoginPage />;
  if (!currentProject) return <ProjectList session={session} onSelectProject={handleSelectProject} onLogout={() => supabase.auth.signOut()} />;
  
  return (
    <Dashboard 
      session={session} 
      project={currentProject} 
      onBack={() => setCurrentProject(null)} 
      onLogout={() => supabase.auth.signOut()} 
      triggerEletrocalhaSuggestion={triggerEletrocalhaSuggestion} // Pass the flag
      setTriggerEletrocalhaSuggestion={setTriggerEletrocalhaSuggestion} // Pass setter to reset
    />
  );
}
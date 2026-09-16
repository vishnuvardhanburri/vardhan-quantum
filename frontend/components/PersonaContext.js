'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const PersonaContext = createContext();

export function PersonaProvider({ children }) {
  const [persona, setPersona] = useState('EXECUTIVE');
  const [techMode, setTechMode] = useState(false);

  useEffect(() => {
    const savedP = typeof window !== 'undefined' ? localStorage.getItem('vardhan-active-persona') : null;
    const savedT = typeof window !== 'undefined' ? localStorage.getItem('vardhan-tech-mode') : null;
    if (savedP) setPersona(savedP);
    if (savedT !== null) setTechMode(savedT === 'true');
  }, []);

  const changePersona = (p) => {
    setPersona(p);
    if (typeof window !== 'undefined') localStorage.setItem('vardhan-active-persona', p);
  };

  const toggleTechMode = () => {
    setTechMode(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') localStorage.setItem('vardhan-tech-mode', String(next));
      return next;
    });
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona: changePersona, techMode, setTechMode, toggleTechMode }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    return {
      persona: 'EXECUTIVE',
      setPersona: () => {},
      techMode: false,
      setTechMode: () => {},
      toggleTechMode: () => {},
    };
  }
  return ctx;
}

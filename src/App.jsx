import './App.css';
import { useState } from 'react';
import FormularioNovedad from './FormularioNovedad';
import Calendario from './Calendario';

const USUARIOS = [
  { nombre: 'Beatriz', pin: '2407' },
  { nombre: 'Fernando', pin: '2801' },
  { nombre: 'Ruby', pin: '3006' },
  { nombre: 'Victor', pin: '2108' },
  { nombre: 'Eduardo', pin: '2512' },
  { nombre: 'Andrea', pin: '1504' }
];

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pin, setPin] = useState('');
  const [pantalla, setPantalla] = useState('login');

  const verificarPin = () => {
    const user = USUARIOS.find(u => u.pin === pin);
    if (user) {
      setUsuario(user);
      setPantalla('menu');
    } else {
      alert("PIN incorrecto, intenta de nuevo.");
    }
  };

  const obtenerTurno = () => {
    const hora = new Date().getHours();
    if (hora >= 7 && hora < 14) return "Matutino (7am - 2pm)";
    if (hora >= 14 && hora < 19) return "Vespertino (2pm - 7pm)";
    return "Nocturno (7pm - 7am)";
  };

  // --- Pantalla de Login ---
  if (pantalla === 'login') return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <div className="ios-card" style={{ textAlign: 'center' }}>
        <h2>Acceso Marlene</h2>
        <p style={{ color: '#8E8E93' }}>Ingresa tu PIN de 4 dígitos</p>
        <input 
          className="ios-input" 
          type="password" 
          maxLength="4" 
          placeholder="PIN" 
          onChange={(e) => setPin(e.target.value)} 
        />
        <button className="ios-button" style={{ background: '#60A5FA' }} onClick={verificarPin}>Entrar</button>
      </div>
    </div>
  );

  // --- Pantalla de Formulario ---
  if (pantalla === 'formulario') return (
    <FormularioNovedad usuario={usuario} onVolver={() => setPantalla('menu')} />
  );

  // --- Pantalla de Calendario ---
  if (pantalla === 'calendario') return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <Calendario usuario={usuario} />
        <button className="ios-button" style={{ background: '#A1A1AA', marginTop: '20px' }} onClick={() => setPantalla('menu')}>
            Volver al Menú
        </button>
    </div>
  );

  // --- Pantalla de Menú Principal ---
  return (
    <div style={{ maxWidth: '400px', margin: '20px auto' }}>
      <div className="ios-card" style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#C2410C' }}>Hola, {usuario.nombre}</h1>
        <p style={{ color: '#8E8E93' }}>Turno actual: <br/><strong>{obtenerTurno()}</strong></p>
      </div>
      
      <button 
        className="ios-button" 
        style={{ background: '#60A5FA' }} 
        onClick={() => setPantalla('formulario')}>
        Registrar Reporte
      </button>
      
      <button 
        className="ios-button" 
        style={{ background: '#FCD34D' }} 
        onClick={() => setPantalla('calendario')}>
        Calendario
      </button>

      <button 
        className="ios-button" 
        style={{ background: '#F87171', marginTop: '40px' }} 
        onClick={() => { setUsuario(null); setPantalla('login'); }}>
        Cerrar Sesión
      </button>
    </div>
  );
}
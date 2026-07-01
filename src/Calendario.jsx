import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './App.css';

const CUIDADORES = [
  { nombre: 'Fernando', inicial: 'F', color: '#f7a688' },
  { nombre: 'Andrea', inicial: 'A', color: '#99f5ff' },
  { nombre: 'Ruby', inicial: 'R', color: '#b72d7b' },
  { nombre: 'Bety', inicial: 'B', color: '#e3ec5f' },
  { nombre: 'Víctor', inicial: 'V', color: '#6996ff' },
  { nombre: 'Eduardo', inicial: 'E', color: '#50ff79' }
];

const TURNOS = [
  { id: 'Matutino', label: 'M', horario: '7:00 am - 2:00 pm' },
  { id: 'Vespertino', label: 'V', horario: '2:00 pm - 7:00 pm' },
  { id: 'Nocturno', label: 'N', horario: '7:00 pm - 7:00 am' }
];

export default function Calendario({ usuario }) {
  const [asignaciones, setAsignaciones] = useState({});

  // 1. Cargar turnos desde Firebase al montar el componente
  useEffect(() => {
    const cargarTurnos = async () => {
      const docRef = doc(db, "datos", "calendario");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAsignaciones(docSnap.data());
      }
    };
    cargarTurnos();
  }, []);

  const generarCalendario = () => {
    const cal = [];
    const hoy = new Date();
    const diaSemana = hoy.getDay(); 
    const diff = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    const inicio = new Date(hoy.setDate(diff));

    for (let i = 0; i < 21; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      cal.push({
        nombre: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
        fechaStr: fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      });
    }
    return cal;
  };

  const dias = generarCalendario();

  const getTurnoActual = () => {
    const ahora = new Date();
    const hoyStr = ahora.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const hora = ahora.getHours();
    let turnoId = '';
    if (hora >= 7 && hora < 14) turnoId = 'Matutino';
    else if (hora >= 14 && hora < 19) turnoId = 'Vespertino';
    else turnoId = 'Nocturno';
    return asignaciones[`${hoyStr}-${turnoId}`];
  };

  const turnoActual = getTurnoActual();

  // 2. Guardar turno en Firebase al seleccionar
  const seleccionarTurno = async (dia, turno) => {
    const key = `${dia.fechaStr}-${turno.id}`;
    if (asignaciones[key]) {
      alert(`⚠️ Este turno ya está ocupado por ${asignaciones[key].nombre}.`);
      return;
    }

    if (window.confirm(`¿Elegir turno ${turno.id} (${turno.horario}) el ${dia.nombre} ${dia.fechaStr}? \n\n¡Muchas gracias, Marlene te lo agradece mucho!`)) {
      const nuevasAsignaciones = { ...asignaciones, [key]: usuario };
      setAsignaciones(nuevasAsignaciones);
      
      // Guardar en Firestore
      try {
        await setDoc(doc(db, "datos", "calendario"), nuevasAsignaciones);
      } catch (error) {
        console.error("Error al guardar en Firebase: ", error);
        alert("Hubo un error al guardar, intenta de nuevo.");
      }
    }
  };

  return (
    <div className="ios-card" style={{ padding: '20px', backgroundColor: '#FFF7ED', maxWidth: '1000px', margin: 'auto' }}>
      <h3 style={{color: '#C2410C', textAlign: 'center', margin: '0 0 10px 0'}}>Calendario Semanal</h3>

      <div style={{ 
        background: '#FF7F50', padding: '10px', borderRadius: '8px', 
        marginBottom: '10px', color: '#FFF', textAlign: 'center', fontWeight: 'bold' 
      }}>
        {turnoActual ? `En turno ahora: ${turnoActual.nombre}` : "Sin cuidador asignado en este turno"}
      </div>

      <p style={{color: '#EA580C', fontSize: '14px', textAlign: 'center', margin: '0 0 15px 0'}}>Para Cuidar a Marlene | Llega 10 min antes de tu turno</p>

      <div style={{ background: '#FEE2E2', padding: '10px', borderRadius: '8px', marginBottom: '10px', color: '#991B1B', fontSize: '12px', textAlign: 'center' }}>
        <strong>Revisión urgente:</strong> Asegúrate de cubrir los turnos del día en curso y el siguiente.
      </div>

      <div style={{ background: '#FFEDD5', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#9A3412', fontSize: '11px' }}>
        <strong>Horarios:</strong> {TURNOS.map(t => `${t.id}: ${t.horario}`).join(' | ')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
        {dias.map((dia, idx) => (
          <div key={idx}>
            <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '10px', fontWeight: 'bold' }}>
              {dia.nombre.toUpperCase()}<br/>{dia.fechaStr}
            </div>
            {TURNOS.map(turno => {
              const asignado = asignaciones[`${dia.fechaStr}-${turno.id}`];
              return (
                <div 
                  key={turno.id}
                  onClick={() => seleccionarTurno(dia, turno)}
                  title={asignado ? `Ocupado por: ${asignado.nombre}` : 'Disponible'}
                  style={{
                    height: '65px', border: '1px solid #FDBA74', borderRadius: '8px', marginBottom: '4px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: asignado ? asignado.color : '#FFF', cursor: 'pointer'
                  }}
                >
                  {asignado ? (
                    <>
                      <b style={{fontSize: '16px'}}>{asignado.inicial}</b>
                      <span style={{fontSize: '7px', textAlign: 'center', fontWeight: 'bold'}}>{asignado.nombre}</span>
                    </>
                  ) : (
                    <span style={{fontSize: '12px', color: '#EA580C'}}>{turno.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
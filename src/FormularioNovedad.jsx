import './App.css';
import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const MEDICAMENTOS_LISTA = ["Losartan", "Gaap", "Tramadol/Paracetamol", "Calcio/Vitamina D", "Rivaroxaban", "Carbamazepina", "Supradol", "Ciprofloxacino", "Metformina", "Ibuprofeno", "Humylub", "Bio-Fungi"];
const PORCENTAJES = ["0%", "25%", "50%", "75%", "100%"];
const TURNOS = ["Matutino (7am - 2pm)", "Vespertino (2pm - 7pm)", "Nocturno (7pm - 7am)"];

export default function FormularioNovedad({ onVolver, usuario, soloLectura }) {
  const [data, setData] = useState({
    apoyo: '', medicamentos: [], presion: '', temp: '', oxigeno: '', glucosa: '',
    fc: '', fr: '', observaciones: '', turnoSeleccionado: '', fechaReporte: new Date().toISOString().split('T')[0],
    orina: '', defecacion: '', evacuacionDetalle: '',
    ducha: '', alimentoTipo: '', alimentoDesc: '', ingesta: '', animo: null
  });
  
  const [paso, setPaso] = useState('formulario');
  const [historico, setHistorico] = useState([]);
  const [turnoFiltro, setTurnoFiltro] = useState(null);

  useEffect(() => {
    const hora = new Date().getHours();
    const turnoDefault = hora >= 7 && hora < 14 ? TURNOS[0] : hora >= 14 && hora < 19 ? TURNOS[1] : TURNOS[2];
    setData(prev => ({ ...prev, turnoSeleccionado: turnoDefault }));
  }, []);

  const agregarMed = () => setData({...data, medicamentos: [...data.medicamentos, { med: '', hora: '' }]});
  const actualizarMed = (index, campo, valor) => {
    const nuevos = [...data.medicamentos];
    nuevos[index][campo] = valor;
    setData({...data, medicamentos: nuevos});
  };

  const verHistorico = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reportes"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setHistorico(lista);
      setPaso('historico');
    } catch (e) { console.error(e); alert("Error al cargar."); }
  };
  
  const guardarEnFirebase = async () => {
    try {
      // Integración corregida: usamos 'turno' para que coincida con tu base de datos
      await addDoc(collection(db, "reportes"), { 
        ...data, 
        turno: data.turnoSeleccionado, 
        usuario: usuario.nombre, 
        timestamp: new Date() 
      });
      alert("¡Reporte guardado!");
      onVolver();
    } catch (e) { console.error(e); alert("Error al guardar."); }
  };

  const emojis = ['☹️', '😕', '😐', '🙂', '😊'];
  const estiloInput = { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', color: '#1C1C1E' };

if (paso === 'historico') return (
    <div className="ios-card" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h3>Histórico de Reportes</h3>
      
      {/* Botones de filtro actualizados para mostrar fecha de timestamp si falta fechaReporte */}
      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {historico.map((h, i) => {
          const fechaMostrada = h.fechaReporte || (h.timestamp?.toDate ? h.timestamp.toDate().toLocaleDateString() : 'Sin fecha');
          return (
            <button 
              key={i} 
              className="ios-button" 
              style={{ background: turnoFiltro === h.id ? '#2563EB' : '#E5E7EB', color: turnoFiltro === h.id ? 'white' : 'black', fontSize: '10px', padding: '5px' }} 
              onClick={() => setTurnoFiltro(h.id)}
            >
              {fechaMostrada} | {h.turno ? h.turno.split(' ')[0] : 'Sin turno'}
            </button>
          );
        })}
      </div>

      {turnoFiltro ? (
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', textAlign: 'left', fontSize: '14px' }}>
          {historico.filter(h => h.id === turnoFiltro).map(h => {
            const fechaDetalle = h.fechaReporte || (h.timestamp?.toDate ? h.timestamp.toDate().toLocaleDateString() : 'Fecha no disponible');
            return (
              <div key={h.id}>
                <h4 style={{margin: '5px 0'}}>{fechaDetalle} | {h.turno}</h4>
                <p style={{margin: '5px 0'}}><strong>Cuidador:</strong> {h.usuario || 'No especificado'}</p>
                <hr />
                <p style={{margin: '5px 0'}}><strong>Apoyo:</strong> {h.apoyo}</p>
                <p style={{margin: '5px 0'}}><strong>Medicamentos:</strong> {h.medicamentos?.map((m, idx) => <span key={idx}><br/>• {m.med} ({m.hora})</span>)}</p>
                <p style={{margin: '5px 0'}}><strong>Signos:</strong> P:{h.presion} | T:{h.temp} | Ox:{h.oxigeno} | G:{h.glucosa} | FC:{h.fc} | FR:{h.fr}</p>
                <p style={{margin: '5px 0'}}><strong>Evacuación:</strong> O:{h.orina} | D:{h.defecacion} | {h.evacuacionDetalle}</p>
                <p style={{margin: '5px 0'}}><strong>Ducha:</strong> {h.ducha} | <strong>Comida:</strong> {h.alimentoTipo} ({h.ingesta})</p>
                <p style={{margin: '5px 0'}}><strong>Ánimo:</strong> {h.animo} | <strong>Obs:</strong> {h.observaciones}</p>
              </div>
            );
          })}
          <button className="ios-button" onClick={() => setTurnoFiltro(null)}>Cerrar detalle</button>
        </div>
      ) : <p>Selecciona un reporte arriba para ver detalles.</p>}
      
      <button className="ios-button" style={{marginTop: '20px'}} onClick={() => {setPaso('formulario'); setTurnoFiltro(null);}}>Volver al Formulario</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto' }}>
      <div className="ios-card">
        <h3>Reporte de {usuario.nombre}</h3>
        <label>Fecha del reporte</label>
        <input type="date" className="ios-input" style={estiloInput} value={data.fechaReporte} onChange={(e) => setData({...data, fechaReporte: e.target.value})} />
        <label>Turno</label>
        <select className="ios-input" style={estiloInput} value={data.turnoSeleccionado} onChange={(e) => setData({...data, turnoSeleccionado: e.target.value})}>{TURNOS.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <label>Personal de apoyo</label>
        <input className="ios-input" style={estiloInput} value={data.apoyo} onChange={(e) => setData({...data, apoyo: e.target.value})} />
        <label>Medicamentos</label>
        {data.medicamentos.map((item, i) => (
          <div key={i} style={{display: 'flex', gap: '5px', marginBottom: '5px'}}>
            <select className="ios-input" style={estiloInput} value={item.med} onChange={(e) => actualizarMed(i, 'med', e.target.value)}><option value="">Med...</option>{MEDICAMENTOS_LISTA.map(m => <option key={m} value={m}>{m}</option>)}</select>
            <input type="time" className="ios-input" style={estiloInput} value={item.hora} onChange={(e) => actualizarMed(i, 'hora', e.target.value)} />
          </div>
        ))}
        <button className="ios-button" style={{background: '#FCD34D'}} onClick={agregarMed}>+ Agregar Medicamento</button>
        <label>Signos Vitales</label>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px'}}>
          <input className="ios-input" style={estiloInput} placeholder="Presión" value={data.presion} onChange={(e) => setData({...data, presion: e.target.value})} />
          <input className="ios-input" style={estiloInput} placeholder="Temp" value={data.temp} onChange={(e) => setData({...data, temp: e.target.value})} />
          <input className="ios-input" style={estiloInput} placeholder="Oxigeno" value={data.oxigeno} onChange={(e) => setData({...data, oxigeno: e.target.value})} />
          <input className="ios-input" style={estiloInput} placeholder="Glucosa" value={data.glucosa} onChange={(e) => setData({...data, glucosa: e.target.value})} />
          <input className="ios-input" style={estiloInput} placeholder="FC" value={data.fc} onChange={(e) => setData({...data, fc: e.target.value})} />
          <input className="ios-input" style={estiloInput} placeholder="FR" value={data.fr} onChange={(e) => setData({...data, fr: e.target.value})} />
        </div>
        <label>Observaciones</label>
        <textarea className="ios-input" style={estiloInput} value={data.observaciones} onChange={(e) => setData({...data, observaciones: e.target.value})} />
        <label>Evacuaciones</label>
        <div style={{display: 'flex', gap: '5px'}}>
          <input className="ios-input" style={estiloInput} placeholder="Orina" value={data.orina} onChange={(e) => setData({...data, orina: e.target.value})} />
          <input className="ios-input" style={estiloInput} placeholder="Defecación" value={data.defecacion} onChange={(e) => setData({...data, defecacion: e.target.value})} />
        </div>
        <input className="ios-input" style={estiloInput} placeholder="Detalle (Color/Consistencia)" value={data.evacuacionDetalle} onChange={(e) => setData({...data, evacuacionDetalle: e.target.value})} />
        <label>Ducha</label>
        <select className="ios-input" style={estiloInput} value={data.ducha} onChange={(e) => setData({...data, ducha: e.target.value})}><option value="">Selecciona...</option><option value="Regadera">Regadera</option><option value="Cama">Cama</option><option value="No quiso">No quiso</option></select>
        <label>Alimentos</label>
        <select className="ios-input" style={estiloInput} value={data.alimentoTipo} onChange={(e) => setData({...data, alimentoTipo: e.target.value})}><option value="">Tiempo...</option><option value="Desayuno">Desayuno</option><option value="Comida">Comida</option><option value="Cena">Cena</option></select>
        <input className="ios-input" style={estiloInput} placeholder="Descripción" value={data.alimentoDesc} onChange={(e) => setData({...data, alimentoDesc: e.target.value})} />
        <select className="ios-input" style={estiloInput} value={data.ingesta} onChange={(e) => setData({...data, ingesta: e.target.value})}><option value="">% Ingesta...</option>{PORCENTAJES.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <label>Ánimo</label>
        <div style={{display: 'flex', justifyContent: 'space-around', fontSize: '30px', margin: '10px 0'}}>{emojis.map((e, i) => <span key={i} style={{cursor: 'pointer', filter: data.animo === e ? 'none' : 'grayscale(1)'}} onClick={() => setData({...data, animo: e})}>{e}</span>)}</div>
        <button className="ios-button" onClick={guardarEnFirebase}>Guardar Reporte</button>
        <button className="ios-button" style={{background: '#FCD34D'}} onClick={verHistorico}>Ver Histórico</button>
        <button className="ios-button" style={{background: '#F87171'}} onClick={onVolver}>Volver al Menú</button>
      </div>
    </div>
  );
}
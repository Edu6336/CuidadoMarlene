import './App.css';
import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { db } from './firebase'; // Ajustado al nombre de tu archivo firebase.js
import { collection, addDoc } from 'firebase/firestore';

const MEDICAMENTOS_LISTA = ["Losartan", "Gaap", "Tramadol/Paracetamol", "Calcio/Vitamina D", "Rivaroxaban", "Carbamazepina", "Supradol", "Ciprofloxacino", "Metformina", "Ibuprofeno"];
const PORCENTAJES = ["25%", "50%", "75%", "100%"];

export default function FormularioNovedad({ onVolver, usuario }) {
  const [data, setData] = useState({
    apoyo: '', medicamentos: [], presion: '', temp: '', oxigeno: '', glucosa: '',
    orina: '', defecacion: '', evacuacionDetalle: '',
    ducha: '', alimentoTipo: '', alimentoDesc: '', ingesta: '', animo: null
  });
  const [paso, setPaso] = useState('formulario');
  const resumenRef = useRef(null);

  const obtenerInfoTurno = () => {
    const hora = new Date().getHours();
    const fecha = new Date().toLocaleDateString();
    let nombreTurno = hora >= 7 && hora < 14 ? "Matutino (7am - 2pm)" : hora >= 14 && hora < 19 ? "Vespertino (2pm - 7pm)" : "Nocturno (7pm - 7am)";
    return { nombreTurno, fecha };
  };
  const { nombreTurno, fecha } = obtenerInfoTurno();

  const agregarMed = () => setData({...data, medicamentos: [...data.medicamentos, { med: '', hora: '' }]});
  const actualizarMed = (index, campo, valor) => {
    const nuevos = [...data.medicamentos];
    nuevos[index][campo] = valor;
    setData({...data, medicamentos: nuevos});
  };

  const descargarImagen = () => {
    toPng(resumenRef.current).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `Reporte_${fecha.replace(/\//g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  // Función para guardar en Firebase
  const guardarEnFirebase = async () => {
    try {
      await addDoc(collection(db, "reportes"), {
        ...data,
        usuario: usuario.nombre,
        fecha,
        turno: nombreTurno,
        timestamp: new Date()
      });
      alert("¡Reporte guardado con éxito!");
      onVolver(); // Volver al menú tras guardar
    } catch (e) {
      console.error("Error al guardar: ", e);
      alert("Error al guardar, intenta de nuevo.");
    }
  };

  const validarYContinuar = () => {
    const medicamentosValidos = data.medicamentos.length > 0 && data.medicamentos.every(m => m.med !== '' && m.hora !== '');
    const camposPrincipalesLlenos = data.apoyo && data.presion && data.temp && data.oxigeno && data.glucosa && data.orina && data.defecacion && data.ducha && data.alimentoTipo && data.ingesta && data.animo;

    if (!medicamentosValidos) { alert("Error: Debes agregar al menos un medicamento y completar su nombre y hora."); return; }
    if (!camposPrincipalesLlenos) { alert("Error: Por favor completa todos los campos del formulario."); return; }
    setPaso('resumen');
  };

  const emojis = ['☹️', '😕', '😐', '🙂', '😊'];
  const estiloInput = { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', color: '#1C1C1E' };

  if (paso === 'resumen') return (
    <div className="ios-card" style={{ maxWidth: '400px', margin: 'auto' }}>
      <div ref={resumenRef} style={{ background: 'white', padding: '20px', borderRadius: '15px' }}>
        <h3>Confirmar Reporte</h3>
        <div style={{textAlign: 'left', fontSize: '14px', color: '#000'}}>
          <p><strong>Fecha:</strong> {fecha} | <strong>Turno:</strong> {nombreTurno}</p>
          <p><strong>Cuidador:</strong> {usuario.nombre}</p>
          <p><strong>Apoyo:</strong> {data.apoyo}</p>
          <div><strong>Medicamentos:</strong> {data.medicamentos.map((m, i) => <div key={i}>• {m.med} ({m.hora})</div>)}</div>
          <p><strong>Signos:</strong> P:{data.presion} | T:{data.temp} | Ox:{data.oxigeno} | G:{data.glucosa}</p>
          <p><strong>Evacuación:</strong> O:{data.orina} | D:{data.defecacion} | {data.evacuacionDetalle}</p>
          <p><strong>Ducha:</strong> {data.ducha}</p>
          <p><strong>Comida:</strong> {data.alimentoTipo} ({data.alimentoDesc} - {data.ingesta})</p>
          <p><strong>Ánimo:</strong> {data.animo}</p>
        </div>
      </div>
      <button className="ios-button" style={{background: '#60A5FA'}} onClick={guardarEnFirebase}>Guardar y Enviar a Firebase</button>
      <button className="ios-button" style={{background: '#25D366'}} onClick={descargarImagen}>Descargar Imagen para WhatsApp</button>
      <button className="ios-button" style={{background: '#A1A1AA'}} onClick={() => setPaso('formulario')}>Editar</button>
      <button className="ios-button" style={{background: '#F87171'}} onClick={onVolver}>Volver al Menú</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto' }}>
      <div className="ios-card">
        <h3>Es el turno de {usuario.nombre}</h3>
        <p style={{fontSize: '14px', color: '#8E8E93'}}>Turno: {nombreTurno} | {fecha}</p>
        
        <label>Personal de apoyo</label>
        <input className="ios-input" value={data.apoyo} style={estiloInput} onChange={(e) => setData({...data, apoyo: e.target.value})} />

        <label>Medicamentos suministrados</label>
        {data.medicamentos.map((item, i) => (
          <div key={i} style={{display: 'flex', gap: '5px', marginBottom: '5px'}}>
            <select className="ios-input" value={item.med} style={estiloInput} onChange={(e) => actualizarMed(i, 'med', e.target.value)}>
              <option value="">Med...</option>
              {MEDICAMENTOS_LISTA.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="time" className="ios-input" value={item.hora} style={estiloInput} onChange={(e) => actualizarMed(i, 'hora', e.target.value)} />
          </div>
        ))}
        <button className="ios-button" style={{background: '#FCD34D', fontSize: '12px', padding: '5px'}} onClick={agregarMed}>+ Agregar Medicamento</button>

        <label>Signos Vitales</label>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px'}}>
          <input className="ios-input" value={data.presion} style={estiloInput} placeholder="Presión" onChange={(e) => setData({...data, presion: e.target.value})} />
          <input className="ios-input" value={data.temp} style={estiloInput} placeholder="Temp" onChange={(e) => setData({...data, temp: e.target.value})} />
          <input className="ios-input" value={data.oxigeno} style={estiloInput} placeholder="Ox" onChange={(e) => setData({...data, oxigeno: e.target.value})} />
          <input className="ios-input" value={data.glucosa} style={estiloInput} placeholder="Glucosa" onChange={(e) => setData({...data, glucosa: e.target.value})} />
        </div>

        <label>Evacuaciones</label>
        <div style={{display: 'flex', gap: '5px'}}>
          <input type="number" className="ios-input" value={data.orina} style={estiloInput} placeholder="Orina (Veces)" onChange={(e) => setData({...data, orina: e.target.value})} />
          <input type="number" className="ios-input" value={data.defecacion} style={estiloInput} placeholder="Defecación (Veces)" onChange={(e) => setData({...data, defecacion: e.target.value})} />
        </div>
        <input className="ios-input" value={data.evacuacionDetalle} style={estiloInput} placeholder="Detalle (Color/Consistencia)" onChange={(e) => setData({...data, evacuacionDetalle: e.target.value})} />

        <label>Ducha</label>
        <select className="ios-input" value={data.ducha} style={estiloInput} onChange={(e) => setData({...data, ducha: e.target.value})}>
          <option value="">Selecciona...</option>
          <option value="Regadera">Sí, en regadera</option>
          <option value="Cama">Sí, en cama</option>
          <option value="No quiso">No quiso</option>
        </select>

        <label>Alimentos</label>
        <select className="ios-input" value={data.alimentoTipo} style={estiloInput} onChange={(e) => setData({...data, alimentoTipo: e.target.value})}>
          <option value="">Tiempo...</option>
          <option value="Desayuno">Desayuno</option>
          <option value="Comida">Comida</option>
          <option value="Cena">Cena</option>
        </select>
        <select className="ios-input" value={data.ingesta} style={estiloInput} onChange={(e) => setData({...data, ingesta: e.target.value})}>
          <option value="">% Ingesta...</option>
          {PORCENTAJES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <label>Estado de Ánimo</label>
        <div style={{display: 'flex', justifyContent: 'space-around', fontSize: '30px', margin: '10px 0'}}>
          {emojis.map((e, i) => (
            <span key={i} style={{cursor: 'pointer', filter: data.animo === e ? 'none' : 'grayscale(1)'}} onClick={() => setData({...data, animo: e})}>{e}</span>
          ))}
        </div>

        <button className="ios-button" onClick={validarYContinuar}>Revisar Resumen</button>
        <button className="ios-button" style={{background: '#F87171'}} onClick={onVolver}>Cancelar / Volver al Menú</button>
      </div>
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const CrearInmobiliarias = () => {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleCancel = () => {
    navigate('/administrador/consultar-inmobiliaria');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) { 
      setErrorNombre(true);
      return;
    }

    setErrorNombre(false); 
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/inmobiliarias', {
        nombre
      });
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Inmobiliaria creada correctamente',
        life: 3000,
      });
      setTimeout(() => navigate('/administrador/consultar-inmobiliaria'), 3000);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al crear inmobiliaria',
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
    if (e.target.value.trim()) {
      setErrorNombre(false);
    }
  };

  const handleNombreBlur = () => {
    if (!nombre.trim()) {
      setErrorNombre(true);
    }
  };

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Registrar Nueva Inmobiliaria" className="w-full md:w-5">
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="nombre">Nombre</label>
            <InputText
              id="nombre"
              value={nombre}
              onChange={handleNombreChange}
              onBlur={handleNombreBlur}
              className={`w-full ${errorNombre ? 'p-invalid' : ''}`} 
            />
            {errorNombre && <small className="p-error">Por favor, ingrese un nombre.</small>}
          </div>

          <div className="flex justify-content-between gap-3">
            <Button
              label="Guardar"
              icon="pi pi-check"
              type="submit"
              className="p-button-success w-full"
              loading={loading}
            />
            <Button
              label="Cancelar"
              icon="pi pi-times"
              type="button"
              className="p-button-danger w-full"
              onClick={handleCancel}
              disabled={loading}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CrearInmobiliarias;

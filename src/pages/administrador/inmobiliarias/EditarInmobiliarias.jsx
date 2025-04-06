import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const EditarInmobiliarias = () => {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchInmobiliaria = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/inmobiliarias/${id}`);
        const { nombre } = response.data;
        setNombre(nombre || '');
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la inmobiliaria.',
          life: 5000,
        });
      }
    };

    fetchInmobiliaria();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) { 
      setErrorNombre(true);
      return;
    }

    setLoading(true);

    try {
      await axios.put(`http://localhost:3000/inmobiliarias/${id}`, {
        nombre
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Inmobiliaria actualizada correctamente',
        life: 3000,
      });
      setTimeout(() => navigate('/administrador/consultar-inmobiliaria'), 3000);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar la inmobiliaria.',
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Editar Inmobiliaria" className="w-full md:w-5">
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full" />
          </div>

          <div className="flex justify-content-between gap-3">
            <Button label="Guardar" icon="pi pi-check" type="submit" className="p-button-success w-full" loading={loading} />
            <Button label="Cancelar" icon="pi pi-times" type="button" className="p-button-danger w-full" onClick={() => navigate('/administrador/consultar-inmobiliaria')} disabled={loading} />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditarInmobiliarias;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const EditarClientes = () => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/clientes/${id}`);
        const { nombre, telefono, email, direccion } = response.data;
        setNombre(nombre || '');
        setTelefono(telefono || '');
        setEmail(email || '');
        setDireccion(direccion || '');
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el cliente.',
          life: 5000,
        });
      }
    };

    fetchCliente();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) { 
      setErrorNombre(true);
      return;
    }

    if (email && errorEmail) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un correo electrónico válido.',
        life: 5000,
      });
      return;
    }

    setLoading(true);

    try {
      await axios.put(`http://localhost:3000/clientes/${id}`, {
        nombre,
        telefono: telefono.toString(),
        email,
        direccion,
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cliente actualizado correctamente',
        life: 3000,
      });
      setTimeout(() => navigate('/administrador/consultar-cliente'), 3000);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el cliente.',
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Editar Cliente" className="w-full md:w-5">
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full" />
          </div>

          <div className="field mb-3">
            <label htmlFor="telefono">Teléfono</label>
            <InputText id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full" maxLength={10} />
          </div>

          <div className="field mb-3">
            <label htmlFor="email">Email</label>
            <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
          </div>

          <div className="field mb-3">
            <label htmlFor="direccion">Dirección</label>
            <InputText id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full" />
          </div>

          <div className="flex justify-content-between gap-3">
            <Button label="Guardar" icon="pi pi-check" type="submit" className="p-button-success w-full" loading={loading} />
            <Button label="Cancelar" icon="pi pi-times" type="button" className="p-button-danger w-full" onClick={() => navigate('/administrador/consultar-cliente')} disabled={loading} />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditarClientes;

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const CrearClientes = () => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false); // Nuevo estado para validar el email
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleCancel = () => {
    navigate('/administrador/consultar-cliente');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) { 
      setErrorNombre(true);
      return;
    }

    if (email && errorEmail) { // Si hay un email y está en formato incorrecto
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un correo electrónico válido.',
        life: 5000,
      });
      return;
    }

    setErrorNombre(false); 
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/clientes', {
        nombre,
        telefono: telefono.toString(),
        email,
        direccion,
      });
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cliente creado correctamente',
        life: 3000,
      });
      setTimeout(() => navigate('/administrador/consultar-cliente'), 3000);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al crear cliente',
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validateEmail(e.target.value)) {
      setErrorEmail(false); // Elimina el error si el formato es válido
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setErrorEmail(true);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Registrar Nuevo Cliente" className="w-full md:w-5">
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

          <div className="field mb-3">
            <label htmlFor="telefono">Teléfono</label>
            <InputText
              id="telefono"
              value={telefono}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setTelefono(value);
              }}
              className="w-full"
              maxLength={10}
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={`w-full ${errorEmail ? 'p-invalid' : ''}`} 
            />
            {errorEmail && <small className="p-error">Ingrese un correo electrónico válido.</small>}
          </div>

          <div className="field mb-3">
            <label htmlFor="direccion">Dirección</label>
            <InputText
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full"
            />
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

export default CrearClientes;

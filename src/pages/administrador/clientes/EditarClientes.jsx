import React, { useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { clearLogout } from '../../../redux/authSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ClienteService from "../../../services/ClienteService";

// Componente para editar un cliente existente
const EditarClientes = () => {
  const { id } = useParams(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  const clienteService = ClienteService(); // Instanciar el servicio

  const formik = useFormik({
    initialValues: {
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Correo tiene un formato inválido")
        .required("El correo electrónico es obligatorio"),
    }),
    onSubmit: async (values) => {
      try {
        await clienteService.updateCliente(id, values);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente actualizado correctamente',
          life: 3000,
        });
        setTimeout(() => navigate('/administrador/consultar-cliente'), 3000);
      } catch (error) {
        if (error.message === 'No autorizado') {
          toast.current.show({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No tienes permiso para acceder a esta sección.',
            life: 5000,
          });
          setTimeout(() => {
            dispatch(clearLogout());
            navigate('/');
          }, 5000);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el cliente.',
            life: 5000,
          });
        }
      }
    },
  });

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await clienteService.getClientes(1, 100); // O usa getAllClientes si lo prefieres
        const cliente = response.data.find((c) => c.id === parseInt(id));

        if (cliente) {
          const { nombre, telefono, email, direccion } = cliente;
          formik.setValues({
            nombre: nombre || '',
            telefono: telefono || '',
            email: email || '',
            direccion: direccion || '',
          });
        } else {
          toast.current.show({
            severity: 'warn',
            summary: 'No encontrado',
            detail: 'Cliente no encontrado.',
            life: 3000,
          });
        }
      } catch (error) {
        if (error.message === 'No autorizado') {
          toast.current.show({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No tienes permiso para acceder a esta sección.',
            life: 5000,
          });
          setTimeout(() => {
            dispatch(clearLogout());
            navigate('/');
          }, 5000);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el cliente.',
            life: 5000,
          });
        }
      }
    };

    fetchCliente();
  }, [id, dispatch, navigate]);

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Editar Cliente" className="w-full md:w-5">
        <form onSubmit={formik.handleSubmit} className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="nombre">Nombre</label>
            <InputText
              id="nombre"
              name="nombre"
              value={formik.values.nombre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full ${formik.touched.nombre && formik.errors.nombre ? "p-invalid" : ""}`}
            />
            {formik.touched.nombre && formik.errors.nombre && (
              <small className="p-error">{formik.errors.nombre}</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="telefono">Teléfono</label>
            <InputText
              id="telefono"
              name="telefono"
              value={formik.values.telefono}
              onChange={formik.handleChange}
              maxLength={10}
              className="w-full"
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full ${formik.touched.email && formik.errors.email ? "p-invalid" : ""}`}
            />
            {formik.touched.email && formik.errors.email && (
              <small className="p-error">{formik.errors.email}</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="direccion">Dirección</label>
            <InputText
              id="direccion"
              name="direccion"
              value={formik.values.direccion}
              onChange={formik.handleChange}
              className="w-full"
            />
          </div>

          <div className="flex justify-content-between gap-3">
            <Button
              label="Guardar"
              icon="pi pi-check"
              type="submit"
              className="p-button-success w-full"
              loading={formik.isSubmitting}
            />
            <Button
              label="Cancelar"
              icon="pi pi-times"
              type="button"
              className="p-button-danger w-full"
              onClick={() => navigate('/administrador/consultar-cliente')}
              disabled={formik.isSubmitting}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditarClientes;
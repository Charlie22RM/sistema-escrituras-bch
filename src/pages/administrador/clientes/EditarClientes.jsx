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

// Componente para editar un cliente existente
const EditarClientes = () => {
  const { id } = useParams(); // ID del cliente desde la URL
  const dispatch = useDispatch(); // Hook para acciones de Redux
  const navigate = useNavigate(); // Hook para navegación
  const toast = useRef(null); // Referencia para Toasts

  // Configuración del formulario con Formik y validaciones con Yup
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

    /**
     * Función que se ejecuta al enviar el formulario.
     * Envía los nuevos datos al backend para actualizar el cliente.
     * @param {Object} values - Datos del formulario
     */
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:3000/clientes/${id}`, values);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente actualizado correctamente',
          life: 3000,
        });
        setTimeout(() => navigate('/administrador/consultar-cliente'), 3000);
      } catch (error) {
        if (error.response && error.response.status === 401) {
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

  // Cargar datos del cliente al montar el componente
  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/clientes/${id}`);
        const { nombre, telefono, email, direccion } = response.data;

        // Cargar los valores obtenidos al formulario
        formik.setValues({
          nombre: nombre || '',
          telefono: telefono || '',
          email: email || '',
          direccion: direccion || '',
        });
      } catch (error) {
        if (error.response && error.response.status === 401) {
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
          {/* Campo: Nombre */}
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

          {/* Campo: Teléfono */}
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

          {/* Campo: Email */}
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

          {/* Campo: Dirección */}
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

          {/* Botones: Guardar y Cancelar */}
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

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

// Componente para editar un inmobiliaria existente
const EditarInmobiliarias = () => {
  const { id } = useParams(); // ID de la inmobiliaria desde la URL
  const dispatch = useDispatch(); // Hook para acciones de Redux
  const navigate = useNavigate(); // Hook para navegación
  const toast = useRef(null); // Referencia para Toasts

  // Configuración del formulario con Formik y validaciones con Yup
  const formik = useFormik({
    initialValues: {
      nombre: '',
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
    }),

    /**
     * Función que se ejecuta al enviar el formulario.
     * Envía los nuevos datos al backend para actualizar la inmobiliaria.
     * @param {Object} values - Datos del formulario
     */
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:3000/inmobiliarias/${id}`, values);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Inmobiliaria actualizada correctamente',
          life: 3000,
        });
        setTimeout(() => navigate('/administrador/consultar-inmobiliaria'), 3000);
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
            detail: 'No se pudo actualizar la inmobiliaria.',
            life: 5000,
          });
        }
      }
    },
  });

  // Cargar datos de la inmobiliaria al montar el componente
  useEffect(() => {
    const fetchInmobiliaria = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/inmobiliarias/${id}`);
        const { nombre } = response.data;

        // Cargar los valores obtenidos al formulario
        formik.setValues({
          nombre: nombre || '',
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
            detail: 'No se pudo cargar la inmobiliaria.',
            life: 5000,
          });
        }
      }
    };

    fetchInmobiliaria();
  }, [id, dispatch, navigate]);

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Editar Inmobiliaria" className="w-full md:w-5">
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
              onClick={() => navigate('/administrador/consultar-inmobiliaria')}
              disabled={formik.isSubmitting}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditarInmobiliarias;

import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { clearLogout } from "../../../redux/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProyectoService from "../../../services/ProyectoService";


// Componente que permite registrar un nuevo proyecto
const CrearProyectos = () => {
  const dispatch = useDispatch(); // Hook para disparar acciones de Redux
  const navigate = useNavigate(); // Hook para redireccionar entre rutas
  const toast = useRef(null); // Referencia para mostrar mensajes tipo Toast
  const proyectoService = ProyectoService(); // Servicio de proyectos

  // Hook Formik para manejo del formulario, validación y envío
  const formik = useFormik({
    initialValues: {
      nombre: "",
      urbanizacion: "",
    },
    // Esquema de validación con Yup
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
    }),

    /**
     * Función que se ejecuta al enviar el formulario.
     * Intenta crear un nuevo proyecto con los datos ingresados.
     * @param {Object} values - Datos del formulario
     */
    onSubmit: async (values) => {
      try {
        const response = await proyectoService.createProyecto(values);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Proyecto creado correctamente",
          life: 3000,
        });
        // Redirige después de 3 segundos a la lista de proyectos
        setTimeout(() => navigate("/administrador/consultar-proyecto"), 3000);
      } catch (error) {
        // Manejo de error por falta de autorización
        if (error.response && error.response.status === 401) {
          toast.current.show({
            severity: "warn",
            summary: "Advertencia",
            detail: "Su sesión ha expirado, inicie sesión de nuevo.",
            life: 5000,
          });
          setTimeout(() => {
            dispatch(clearLogout()); // Cierra sesión y redirige
          }, 5000);
        } else {
          // Muestra error general en caso de fallo
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "Error al crear proyecto",
            life: 5000,
          });
        }
      }
    },
  });

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Registrar Nuevo Proyecto" className="w-full md:w-5">
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

          {/* Campo: Provincia */}
          <div className="field mb-3">
            <label htmlFor="urbanizacion">Urbanización</label>
            <InputText
              id="urbanizacion"
              name="urbanizacion"
              value={formik.values.urbanizacion}
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
              loading={formik.isSubmitting} // Desactiva mientras se envía
            />
            <Button
              label="Cancelar"
              icon="pi pi-times"
              type="button"
              className="p-button-danger w-full"
              onClick={() => navigate("/administrador/consultar-proyecto")}
              disabled={formik.isSubmitting}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CrearProyectos;

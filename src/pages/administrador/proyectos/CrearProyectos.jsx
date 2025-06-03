import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { clearLogout } from "../../../redux/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProyectoService from "../../../services/ProyectoService";
import CantonService from "../../../services/CantonService";
import InmobiliariaService from "../../../services/InmobiliariaService";
// Componente que permite registrar un nuevo proyecto
const CrearProyectos = () => {
  const dispatch = useDispatch(); // Hook para disparar acciones de Redux
  const navigate = useNavigate(); // Hook para redireccionar entre rutas
  const toast = useRef(null); // Referencia para mostrar mensajes tipo Toast
  const proyectoService = ProyectoService(); // Servicio de proyectos
  const cantonService = CantonService();
  const inmobiliariaService = InmobiliariaService();
  const [cantones, setCantones] = useState([]);
  const [inmobiliarias, setInmobiliarias] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTags = async () => {
    try {
      const response = await cantonService.getTags();
      console.log("tags", response);
      setCantones(response.data);
    } catch (error) {
      console.error("Error al traer los tags:", error);
      handleError(error);
    }
  };

    const getTags2 = async () => {
    try {
      const response = await inmobiliariaService.getTags2();
      console.log("tags", response);
      setInmobiliarias(response.data);
    } catch (error) {
      console.error("Error al traer los tags:", error);
      handleError(error);
    }
  };

  // Hook Formik para manejo del formulario, validación y envío
  const formik = useFormik({
    initialValues: {
      nombre: "",
      etapa: "",
      canton_id: "",
      inmobiliaria_id: "",
    },
    // Esquema de validación con Yup
    validationSchema: Yup.object({
      nombre: Yup.string().required("Por favor, ingrese un nombre."),
      canton_id: Yup.string().required("Por favor, ingrese seleccione un cantón."),
      inmobiliaria_id: Yup.string().required("Por favor, ingrese seleccione una inmobiliaria."),
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
        handleError(error);
      }
    },
  });

  const handleError = (error) => {
    console.error("Error al cargar los clientes:", error.statusCode);
    if (error?.response?.data?.statusCode === 401 || error.statusCode === 401) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Su sesión ha expirado,inicie sesión de nuevo.",
        life: 5000,
      });

      setTimeout(() => {
        dispatch(clearLogout());
        navigate("/");
      }, 5000);
    } else {
      console.error("Error al cargar los clientes:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
        life: 5000,
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      await getTags();
      await getTags2();
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
  <div className="p-1 flex justify-content-center">
    <Toast ref={toast} />
    <Card
      title={
        <div className="flex align-items-center">
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-plain mr-2"
            onClick={() => navigate("/administrador/consultar-proyecto")}
            tooltip="Volver a página anterior"
            tooltipOptions={{ position: "top" }}
          />
          <span>Registrar Nuevo Proyecto</span>
        </div>
      }
      className="w-full md:w-5"
    >
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
            className={`w-full ${
              formik.touched.nombre && formik.errors.nombre ? "p-invalid" : ""
            }`}
          />
          {formik.touched.nombre && formik.errors.nombre && (
            <small className="p-error">{formik.errors.nombre}</small>
          )}
        </div>

        {/* Campo: Etapa */}
        <div className="field mb-3">
          <label htmlFor="etapa">Etapa</label>
          <InputText
            id="etapa"
            name="etapa"
            value={formik.values.urbanizacion}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>

              {/* Campo: Inmobiliaria */}
        <div className="field mb-3">
          <label htmlFor="inmobiliaria_id">Inmobiliaria</label>
          <Dropdown
            id="inmobiliaria_id"
            name="inmobiliaria_id"
            value={formik.values.inmobiliaria_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            options={inmobiliarias}
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione una Inmobiliaria"
            className={`w-full ${
              formik.touched.inmobiliaria_id && formik.errors.inmobiliaria_id ? "p-invalid" : ""
            }`}
          />
          {formik.touched.inmobiliaria_id && formik.errors.inmobiliaria_id && (
            <small className="p-error">{formik.errors.inmobiliaria_id}</small>
          )}
        </div>

        {/* Campo: Cantón */}
        <div className="field mb-3">
          <label htmlFor="canton_id">Cantón</label>
          <Dropdown
            id="canton_id"
            name="canton_id"
            value={formik.values.canton_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            options={cantones}
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un cantón"
            className={`w-full ${
              formik.touched.canton_id && formik.errors.canton_id ? "p-invalid" : ""
            }`}
          />
          {formik.touched.canton_id && formik.errors.canton_id && (
            <small className="p-error">{formik.errors.canton_id}</small>
          )}
        </div>

        {/* Botones: Guardar y Cancelar */}
        <div className="flex justify-content-between gap-3 mt-4">
          <Button
            label="Guardar"
            icon="pi pi-save"
            type="submit"
            className="w-full custom-primary-button"
            loading={formik.isSubmitting}
          />
          <Button
            label="Cancelar"
            icon="pi pi-times"
            type="button"
            className="w-full custom-danger-button"
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

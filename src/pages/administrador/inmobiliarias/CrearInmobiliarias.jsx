import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { clearLogout } from "../../../redux/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import InmobiliariaService from "../../../services/InmobiliariaService";
import ClienteService from "../../../services/ClienteService";
import { useState } from "react";
import { useEffect } from "react";

// Componente que permite registrar un nuevo inmobiliaria
const CrearInmobiliarias = () => {
  const dispatch = useDispatch(); // Hook para disparar acciones de Redux
  const navigate = useNavigate(); // Hook para redireccionar entre rutas
  const toast = useRef(null); // Referencia para mostrar mensajes tipo Toast
  const inmobiliariaService = InmobiliariaService(); // Servicio de inmobiliarias
  const clienteService = ClienteService(); // Servicio de clientes
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false); // Estado para manejar la carga de datos

  const getTags = async () => {
    try {
      const response = await clienteService.getTags();
      console.log("tags",response);
      setClientes(response);
    } catch (error) {
      console.error("Error al traer los tags:", error);
      handleError(error);
    }
  };
  // Hook Formik para manejo del formulario, validación y envío
  const formik = useFormik({
    initialValues: {
      nombre: "",
      cliente_id: "",
    },
    // Esquema de validación con Yup
    validationSchema: Yup.object({
      nombre: Yup.string().required("Por favor, ingrese un nombre."),
      cliente_id: Yup.string().required("Por favor, seleccione un cliente."),
    }),

    /**
     * Función que se ejecuta al enviar el formulario.
     * Intenta crear un nuevo inmobiliaria  con los datos ingresados.
     * @param {Object} values - Datos del formulario
     */
    onSubmit: async (values) => {
      try {
        const response = await inmobiliariaService.createInmobiliaria(values);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Inmobiliaria creada correctamente",
          life: 3000,
        });
        // Redirige después de 3 segundos a la lista de inmobiliarias
        setTimeout(
          () => navigate("/administrador/consultar-inmobiliaria"),
          3000
        );
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
            detail:
              error.response?.data?.message || "Error al crear inmobiliaria ",
            life: 5000,
          });
        }
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

  useEffect(()=>{
    setLoading(true);
    const fetchData = async () => {
      await getTags();
      setLoading(false);
    };
    fetchData();
  },[])


  return (
  <div className="p-1 flex justify-content-center">
    <Toast ref={toast} />
    <Card
      title={
        <div className="flex align-items-center">
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-plain mr-2"
            onClick={() => navigate("/administrador/consultar-inmobiliaria")}
            tooltip="Volver a página anterior"
            tooltipOptions={{ position: "top" }}
          />
          <span>Registrar Nueva Inmobiliaria</span>
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

        {/* Campo: Cliente */}
        <div className="field mb-3">
          <label htmlFor="cliente_id">Cliente</label>
          <Dropdown
            id="cliente_id"
            name="cliente_id"
            value={formik.values.cliente_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            options={clientes}
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un cliente"
            className={`w-full ${
              formik.touched.cliente_id && formik.errors.cliente_id ? "p-invalid" : ""
            }`}
          />
          {formik.touched.cliente_id && formik.errors.cliente_id && (
            <small className="p-error">{formik.errors.cliente_id}</small>
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
            onClick={() => navigate("/administrador/consultar-inmobiliaria")}
            disabled={formik.isSubmitting}
          />
        </div>
      </form>
    </Card>
  </div>
);

};

export default CrearInmobiliarias;

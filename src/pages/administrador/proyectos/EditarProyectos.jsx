import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { clearLogout } from "../../../redux/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProyectoService from "../../../services/ProyectoService";
import CantonService from "../../../services/CantonService";
import { Dropdown } from "primereact/dropdown";

// Componente para editar un proyecto existente
const EditarProyectos = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [cantones, setCantones] = useState([]);
  const proyectoService = ProyectoService(); // Instanciar el servicio
  const cantonService = CantonService();

  const formik = useFormik({
    initialValues: {
      nombre: "",
      urbanizacion: "",
      canton_id: "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
      canton_id: Yup.string().required("El cantón es obligatorio"),
    }),
    onSubmit: async (values) => {
      try {
        await proyectoService.updateProyecto(id, values);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Proyecto actualizado correctamente",
          life: 3000,
        });
        setTimeout(() => navigate("/administrador/consultar-proyecto"), 3000);
      } catch (error) {
        if (error.message === "No autorizado") {
          toast.current.show({
            severity: "warn",
            summary: "Advertencia",
            detail: "Su sesión ha expirado, inicie sesión de nuevo.",
            life: 5000,
          });
          setTimeout(() => {
            dispatch(clearLogout());
            navigate("/");
          }, 5000);
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "No se pudo actualizar el proyecto.",
            life: 5000,
          });
        }
      }
    },
  });

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
    const fetchProyecto = async () => {
      try {
        const response = await proyectoService.getProyectos(1, 100);
        const proyecto = response.data.find((c) => c.id === parseInt(id));

        if (proyecto) {
          const { nombre, urbanizacion } = proyecto;
          formik.setValues({
            nombre: nombre || "",
            urbanizacion: urbanizacion || "",
            canton_id: proyecto.canton_id || "",
          });
        } else {
          toast.current.show({
            severity: "warn",
            summary: "No encontrado",
            detail: "Proyecto no encontrado.",
            life: 3000,
          });
        }
      } catch (error) {
        if (error.message === "No autorizado") {
          toast.current.show({
            severity: "warn",
            summary: "Advertencia",
            detail: "No tienes permiso para acceder a esta sección.",
            life: 5000,
          });
          setTimeout(() => {
            dispatch(clearLogout());
            navigate("/");
          }, 5000);
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "No se pudo cargar el proyecto.",
            life: 5000,
          });
        }
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchProyecto(), getTags()]);
    };
    fetchData();
  }, [id, dispatch, navigate]);

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Editar Proyecto" className="w-full md:w-5">
        <form onSubmit={formik.handleSubmit} className="p-fluid">
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

          <div className="field">
            <label>Cantón</label>
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
                formik.touched.canton_id && formik.errors.canton_id
                  ? "p-invalid"
                  : ""
              }`}
            />
            {formik.touched.canton_id && formik.errors.canton_id && (
              <small className="p-error">{formik.errors.canton_id}</small>
            )}
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
              onClick={() => navigate("/administrador/consultar-proyecto")}
              disabled={formik.isSubmitting}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditarProyectos;

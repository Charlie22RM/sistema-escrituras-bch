import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { clearLogout } from "../../../redux/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dropdown } from "primereact/dropdown";
import InmobiliariaService from "../../../services/InmobiliariaService";
import ClienteService from "../../../services/ClienteService";

// Componente para editar una inmobiliaria existente
const EditarInmobiliarias = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [clientes, setClientes] = useState([]);
  const inmobiliariaService = InmobiliariaService(); // Instanciar el servicio
  const clienteService = ClienteService();

  const formik = useFormik({
    initialValues: {
      nombre: "",
      cliente_id: "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("Por favor, ingrese un nombre."),
    }),
    onSubmit: async (values) => {
      try {
        await inmobiliariaService.updateInmobiliaria(id, values);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Inmobilaria actualizada correctamente",
          life: 3000,
        });
        setTimeout(
          () => navigate("/administrador/consultar-inmobiliaria"),
          3000
        );
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
            detail: "No se pudo actualizar la inmobiliaria.",
            life: 5000,
          });
        }
      }
    },
  });

  const getTags = async () => {
    try {
      const response = await clienteService.getTags();
      console.log("tags", response);
      setClientes(response);
    } catch (error) {
      console.error("Error al traer los tags:", error);
      handleError(error);
    }
  };

  useEffect(() => {}, []);

  useEffect(() => {
    const fetchInmobiliaria = async () => {
      try {
        const response = await inmobiliariaService.getInmobiliarias(1, 100);
        const inmobiliaria = response.data.find((c) => c.id === parseInt(id));

        if (inmobiliaria) {
          console.log(inmobiliaria);
          const { nombre } = inmobiliaria;
          formik.setValues({
            nombre: nombre || "",
            cliente_id: inmobiliaria.cliente_id || "",
          });
        } else {
          toast.current.show({
            severity: "warn",
            summary: "No encontrado",
            detail: "Inmobiliaria no encontrada.",
            life: 3000,
          });
        }
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
            detail: "No se pudo cargar la inmobiliaria.",
            life: 5000,
          });
        }
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchInmobiliaria(), getTags()]);
    };
    fetchData();
  }, [id, dispatch, navigate]);

 return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card
        className="w-full md:w-5"
        title={
          <div className="flex align-items-center">
            <Button
              icon="pi pi-arrow-left"
              className="p-button-text p-button-plain mr-2"
              onClick={() => navigate("/administrador/consultar-inmobiliaria")}
              tooltip="Volver a página anterior"
              tooltipOptions={{ position: "bottom" }}
            />
            <span>Editar Inmobiliaria</span>
          </div>
        }
      >
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
                formik.touched.cliente_id && formik.errors.cliente_id
                  ? "p-invalid"
                  : ""
              }`}
            />
            {formik.touched.cliente_id && formik.errors.cliente_id && (
              <small className="p-error">{formik.errors.cliente_id}</small>
            )}
          </div>

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

export default EditarInmobiliarias;
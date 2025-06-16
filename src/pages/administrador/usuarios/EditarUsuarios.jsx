import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserService from "../../../services/UsuarioService";
import RolService from "../../../services/RolService";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "primereact/toast";
import { BlockUI } from "primereact/blockui";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useDispatch } from "react-redux";
import { clearLogout } from "../../../redux/authSlice";
import ClienteService from "../../../services/ClienteService";

const EditarUsuarios = () => {
  const { id } = useParams();
  const usuarioService = UserService();
  const clienteService = ClienteService();
  const rolService = RolService();
  const toast = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);

  const getUsuario = async () => {
    try {
      const res = await usuarioService.getById(id);
      setUsuario(res.data);
      console.log(res.data);
    } catch (err) {
      handleError(err);
      console.error("Error al obtener usuario", err);
    }
  };

    const getClientes = async () => {
    try {
      const response = await clienteService.getTags();
      setClientes(response);
    } catch (error) {
      handleError(error);
    }
  };

  const getRoles = async () => {
    try {
      const res = await rolService.getAll();
      setRoles(res.data);
    } catch (err) {
      handleError(err);
      console.error("Error al obtener roles", err);
    }
  };

  const editUsuario = async (values) => {
    try {
      const response = await usuarioService.update(id, values);
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario actualizado correctamente.",
        life: 2000,
      });
      setTimeout(() => {
        navigate("/administrador/consultar-usuario");
      }, 2000);
    } catch (error) {
      handleError(error);
      console.error("Error al obtener roles", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getUsuario(), getRoles(), getClientes()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: usuario ? usuario.nombre : "",
      email: usuario ? usuario.email : "",
      rol_id: usuario ? usuario.rol_id : "",
      cliente_id: usuario ? usuario.cliente_id : null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Por favor, ingrese un nombre."),
      email: Yup.string()
        .email("Email inválido")
        .required("Por favor, ingrese un email."),
      rol_id: Yup.string().required("Por favor, seleccione un rol."),
      cliente_id: Yup.mixed().when("rol_id", (rol_id, schema) => {
        return rol_id == 3
          ? schema
              .required("Por favor, seleccione un cliente")
              .typeError("Selección inválida")
          : schema.notRequired().nullable();
      }),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await editUsuario(values);
        setLoading(false);
      } catch (err) {
        console.error("Error al actualizar el usuario", err);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleCancel = () => {
    navigate(-1);
  };

  const handleError = (error) => {
    if (error.response.data.statusCode === 401) {
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

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} />
      <Card
        className="w-full md:w-5"
        style={{ minWidth: "600px" }}
        title={
          <div className="flex align-items-center">
            <Button
              icon="pi pi-arrow-left"
              className="p-button-text p-button-plain mr-2"
              onClick={() => navigate("/administrador/consultar-usuario")}
              tooltip="Volver a página anterior"
              tooltipOptions={{ position: "top" }}
            />
            <span>Editar Usuario</span>
          </div>
        }
      >
        <form onSubmit={formik.handleSubmit} className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="name">Nombre</label>
            <InputText
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full ${
                formik.errors.name && formik.touched.name ? "p-invalid" : ""
              }`}
            />
            {formik.errors.name && formik.touched.name && (
              <small className="p-error">{formik.errors.name}</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="email">Correo</label>
            <InputText
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full ${
                formik.errors.email && formik.touched.email ? "p-invalid" : ""
              }`}
            />
            {formik.errors.email && formik.touched.email && (
              <small className="p-error">{formik.errors.email}</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="rol_id">Rol</label>
            <Dropdown
              id="rol_id"
              name="rol_id"
              value={formik.values.rol_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              options={roles}
              optionLabel="nombre"
              optionValue="id"
              placeholder="Selecciona un rol"
              className={`w-full ${
                formik.errors.rol_id && formik.touched.rol_id ? "p-invalid" : ""
              }`}
            />
            {formik.errors.rol_id && formik.touched.rol_id && (
              <small className="p-error">{formik.errors.rol_id}</small>
            )}
          </div>

          {formik.values.rol_id === 3 && (
            <div className="field">
              <Dropdown
                id="cliente_id"
                name="cliente_id"
                value={formik.values.cliente_id}
                options={clientes}
                optionLabel="nombre"
                optionValue="id"
                placeholder="Seleccione el Cliente"
                onChange={formik.handleChange}
                className={
                  formik.touched.cliente_id && formik.errors.cliente_id
                    ? "p-invalid"
                    : ""
                }
              />
              {formik.touched.cliente_id && formik.errors.cliente_id && (
                <small className="p-error">{formik.errors.cliente_id}</small>
              )}
            </div>
          )}

          <div className="flex justify-content-between gap-3 mt-4">
            <Button
              type="submit"
              label="Guardar"
              className="w-full custom-primary-button"
              icon="pi pi-check"
              loading={formik.isSubmitting}
            />
            <Button
              type="button"
              label="Cancelar"
              className="w-full custom-danger-button"
              icon="pi pi-times"
              onClick={() => navigate("/administrador/consultar-usuario")}
              disabled={formik.isSubmitting}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditarUsuarios;

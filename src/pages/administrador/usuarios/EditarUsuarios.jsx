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

const EditarUsuarios = () => {
  const { id } = useParams();
  const usuarioService = UserService();
  const rolService = RolService();
  const toast = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
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
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getUsuario(), getRoles()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: usuario ? usuario.nombre : "",
      email: usuario ? usuario.email : "",
      rol_id: usuario ? usuario.rol_id : "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Nombre es requerido"),
      email: Yup.string()
        .email("Email inválido")
        .required("Email es requerido"),
      rol_id: Yup.string().required("Seleccione un rol"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await editUsuario(values);
        setLoading(false);
      } catch (err) {
        console.error("Error al actualizar el usuario", err);
      }finally{
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
      <BlockUI
        style={{ minWidth: "600px", width: "1oo%" }}
        className="w-full md:w-5"
        blocked={loading}
        template={<ProgressSpinner />}
      >
        <Card
          style={{ minWidth: "600px", width: "1oo%" }}
          title="Editar Usuario"
          className="w-full md:w-5"
        >
          <form onSubmit={formik.handleSubmit} className="p-fluid">
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <InputText
                id="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                className={
                  formik.errors.name && formik.touched.name ? "p-invalid" : ""
                }
              />
              {formik.errors.name && formik.touched.name && (
                <small className="p-error">{formik.errors.name}</small>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Correo</label>
              <InputText
                id="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className={
                  formik.errors.email && formik.touched.email ? "p-invalid" : ""
                }
              />
              {formik.errors.email && formik.touched.email && (
                <small className="p-error">{formik.errors.email}</small>
              )}
            </div>

            <div className="field">
              <label htmlFor="rol_id">Rol</label>
              <Dropdown
                id="rol_id"
                value={formik.values.rol_id}
                options={roles}
                optionLabel="nombre"
                optionValue="id"
                onChange={formik.handleChange}
                placeholder="Selecciona un rol"
                className={
                  formik.errors.rol_id && formik.touched.rol_id
                    ? "p-invalid"
                    : ""
                }
              />
              {formik.errors.rol_id && formik.touched.rol_id && (
                <small className="p-error">{formik.errors.rol_id}</small>
              )}
            </div>

            <div className="flex justify-content-between mt-4">
              <Button
                type="submit"
                label="Guardar"
                className="p-button-primary"
              />
              <Button
                type="button"
                label="Cancelar"
                className="p-button-danger"
                onClick={handleCancel}
              />
            </div>
          </form>
        </Card>
      </BlockUI>
    </div>
  );
};

export default EditarUsuarios;

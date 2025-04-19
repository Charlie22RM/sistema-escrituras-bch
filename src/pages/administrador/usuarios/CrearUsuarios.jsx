import React, { useState, useEffect, useRef } from "react";
import { BlockUI } from "primereact/blockui";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import RolService from "../../../services/RolService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearLogout } from "../../../redux/authSlice";
import UserService from "../../../services/UsuarioService";

const CrearUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const toast = useRef(null);
  const rolService = RolService();
  const userService = UserService();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getRoles = async () => {
    try {
      const response = await rolService.getAll();
      setRoles(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const storeUsuario = async (values) => {
    try {
      const response = await userService.store(values);
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario creado correctamente.",
        life: 3000,
      });

      setTimeout(() => {
        navigate("/administrador/consultar-usuario");
      }, 3000);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      handleError(error);
    }
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

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      await getRoles();
      setLoading(false);
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      repeat_password: "",
      rol_id: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Nombre es requerido"),
      email: Yup.string()
        .email("Email inválido")
        .required("Email es requerido"),
      password: Yup.string().required("Contraseña es requerida"),
      repeat_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
        .required("Debe repetir la contraseña"),
      rol_id: Yup.string().required("Seleccione un rol"),
    }),
    onSubmit: async (values) => {
      console.log("Enviando datos:", values);
      setLoading(true);
      try {
        await storeUsuario(values);
      } catch (error) {
        //handleError(error);
        console.error("Error en onSubmit:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="p-1 flex justify-content-center">

        <Card
          style={{ minWidth: "600px", width: "1oo%" }}
          title="Crear Usuario"
          className="w-full md:w-5"
        >
          <form onSubmit={formik.handleSubmit} className="p-fluid">
            <div className="field">
              <InputText
                id="name"
                name="name"
                placeholder="Nombre"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.name && formik.errors.name
                    ? "p-invalid"
                    : ""
                }
              />
              {formik.touched.name && formik.errors.name && (
                <small className="p-error">{formik.errors.name}</small>
              )}
            </div>

            <div className="field">
              <InputText
                id="email"
                name="email"
                placeholder="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.email && formik.errors.email ? "p-invalid" : ""
                }
              />
              {formik.touched.email && formik.errors.email && (
                <small className="p-error">{formik.errors.email}</small>
              )}
            </div>

            <div className="field">
              <Password
                id="password"
                name="password"
                placeholder="Contraseña"
                feedback={false}
                toggleMask
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.password && formik.errors.password
                    ? "p-invalid"
                    : ""
                }
              />
              {formik.touched.password && formik.errors.password && (
                <small className="p-error">{formik.errors.password}</small>
              )}
            </div>

            <div className="field">
              <Password
                id="repeat_password"
                name="repeat_password"
                placeholder="Repetir Contraseña"
                feedback={false}
                toggleMask
                value={formik.values.repeat_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.repeat_password &&
                  formik.errors.repeat_password
                    ? "p-invalid"
                    : ""
                }
              />
              {formik.touched.repeat_password &&
                formik.errors.repeat_password && (
                  <small className="p-error">
                    {formik.errors.repeat_password}
                  </small>
                )}
            </div>

            <div className="field">
              <Dropdown
                id="rol_id"
                name="rol_id"
                value={formik.values.rol_id}
                options={roles}
                optionLabel="nombre"
                optionValue="id"
                placeholder="Rol"
                onChange={formik.handleChange}
                className={
                  formik.touched.rol_id && formik.errors.rol_id
                    ? "p-invalid"
                    : ""
                }
              />
              {formik.touched.rol_id && formik.errors.rol_id && (
                <small className="p-error">{formik.errors.rol_id}</small>
              )}
            </div>

            <div className="flex justify-content-between gap-3">
              <Button
                type="submit"
                label="Guardar"
                className="p-button-success"
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

    </div>
  );
};

export default CrearUsuarios;

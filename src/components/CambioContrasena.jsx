import React, { useState, useRef } from "react";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Password } from "primereact/password";
import AuthService from "../services/AuthService";
import { Button } from "primereact/button";
import { BlockUI } from "primereact/blockui";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import "../App.css";
import { useDispatch } from "react-redux";
import { clearLogout } from "../redux/authSlice";
import "../pages/administrador/administrador.css";

const CambioContrasena = () => {
  const [loading, setLoading] = useState(false);
  const authService = AuthService();
  const navigate = useNavigate();
  const toast = useRef(null);
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      actual_password: "",
      new_password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      actual_password: Yup.string().required(
        "La contraseña actual es obligatoria."
      ),
      new_password: Yup.string().required("La nueva contraseña es obligatoria."),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password"), null], "Las contraseñas no coinciden.")
        .required("La confirmación de la contraseña es obligatoria."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await handleChangePassword(values); // esperás a que termine
      } catch (error) {
      } finally {
        setLoading(false); // siempre se ejecuta
      }
    }
    
  });

  const handleChangePassword = async (values) => {
    try {
      const response = await authService.changeMyPassword(values);

      // Mostrar toast de éxito
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Contraseña cambiada con exito.",
        life: 3000,
      });

      // Limpiar formulario
      formik.resetForm();
    } catch (error) {
      if (error.status == 401 || error.statusCode == 401) {
        console.error('Error al cargar los clientes:', error);
        toast.current.show({
          severity: "warn",
          summary: "Advertencia",
          detail: "Su token ha expirado,inicie sesión denuevo para continuar.",
          life: 4000,
        });

        setTimeout(() => {
          dispatch(clearLogout());
          navigate("/"); // Redirigir al login después de 1 segundo
        }, 4000);
        return;
      }

      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Error al cambiar la contraseña.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <Toast ref={toast} />
      <BlockUI
        blocked={loading}
        template={<ProgressSpinner />}
        pt={{
          maskClassName: "bg-white",
        }}
      >
        <div className="p-1 flex justify-content-center">
          <Card
            className="w-full md:w-5"
            title={
              <div className="flex align-items-center">
                <Button
                  icon="pi pi-arrow-left"
                  className="p-button-text p-button-plain mr-2"
                  onClick={() => navigate("/administrador")}
                  tooltip="Volver a página anterior"
                  tooltipOptions={{ position: "bottom" }}
                />
                <span>Cambio de Contraseña</span>
              </div>
            }
          >
            <form className="p-fluid" onSubmit={formik.handleSubmit}>
              <div className="field mb-3">
                <label htmlFor="actual_password">Contraseña actual</label>
                <Password
                  inputId="actual_password"
                  name="actual_password"
                  value={formik.values.actual_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full ${
                    formik.touched.actual_password && formik.errors.actual_password
                      ? "p-invalid"
                      : ""
                  }`}
                  toggleMask
                  feedback={false}
                />
                {formik.touched.actual_password && formik.errors.actual_password && (
                  <small className="p-error">{formik.errors.actual_password}</small>
                )}
              </div>

              <div className="field mb-3">
                <label htmlFor="new_password">Nueva Contraseña</label>
                <Password
                  inputId="new_password"
                  name="new_password"
                  value={formik.values.new_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full ${
                    formik.touched.new_password && formik.errors.new_password
                      ? "p-invalid"
                      : ""
                  }`}
                  toggleMask
                  feedback={false}
                />
                {formik.touched.new_password && formik.errors.new_password && (
                  <small className="p-error">{formik.errors.new_password}</small>
                )}
              </div>

              <div className="field mb-3">
                <label htmlFor="confirm_password">Repetir Contraseña</label>
                <Password
                  inputId="confirm_password"
                  name="confirm_password"
                  value={formik.values.confirm_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full ${
                    formik.touched.confirm_password && formik.errors.confirm_password
                      ? "p-invalid"
                      : ""
                  }`}
                  toggleMask
                  feedback={false}
                />
                {formik.touched.confirm_password && formik.errors.confirm_password && (
                  <small className="p-error">{formik.errors.confirm_password}</small>
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
                  onClick={handleCancel}
                  disabled={formik.isSubmitting}
                />
              </div>
            </form>
          </Card>
        </div>
      </BlockUI>
    </>
  );
};

export default CambioContrasena;
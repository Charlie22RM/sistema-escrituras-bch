import React, { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { FloatLabel } from "primereact/floatlabel";
import { login } from "../../services/AuthService";
import "./Login.css";
import { Toast } from "primereact/toast";

const Login = () => {
  const toast = useRef(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Correo tiene un formato inválido")
        .required("El correo es obligatorio"),
      password: Yup.string().required("La contraseña es obligatoria"),
    }),
    onSubmit: (values) => {
      console.log("Datos enviados:", values);
      handleLogin(values);
    },
  });

  const handleLogin = async (values) => {
    try {
      const response = await login(values.email, values.password);
      console.log("Login exitoso:", response);
      // Aquí puedes redirigir al usuario a otra página o realizar otras acciones
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Inicio de sesión exitoso",
        life: 3000, // El mensaje durará 3 segundos
      });
    } catch (error) {
      console.error("Error en el login:", error);
      if (error.statusCode == 404) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message,
          life: 3000, // El mensaje durará 3 segundos
        });
        return;
      }
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000, // El mensaje durará 3 segundos
      });
      // Aquí puedes mostrar un mensaje de error al usuario
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
      <div
        className="flex flex-column align-items-center gap-4 p-4 shadow-2 border-round bg-white"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        {/* Título */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Sistema de Escrituras BCHASESORES S.A.
        </h2>

        {/* Avatar */}
        <div className="flex justify-content-center">
          <Avatar
            icon="pi pi-user"
            size="xlarge"
            shape="square"
            className="bg-gray-300"
          />
        </div>

        {/* Toast para mensajes */}
        <Toast ref={toast} />

        {/* Formulario */}
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-column gap-4 w-full"
        >
          {/* Correo */}
          <div className="flex justify-content-center w-full">
            <FloatLabel className="w-full">
              <InputText
                id="email"
                name="email"
                className={`w-full ${
                  formik.touched.email && formik.errors.email ? "p-invalid" : ""
                }`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{ minWidth: "100%" }}
              />
              <label htmlFor="email">Correo</label>
            </FloatLabel>
          </div>
          {formik.touched.email && formik.errors.email && (
            <small className="p-error">{formik.errors.email}</small>
          )}

          {/* Contraseña */}
          <div className="card flex justify-content-center">
            <FloatLabel className="w-full">
              <Password
                inputId="password"
                name="password"
                className={`w-full ${
                  formik.touched.password && formik.errors.password
                    ? "p-invalid"
                    : ""
                }`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                toggleMask
                feedback={false}
                style={{ minWidth: "100%" }}
                inputStyle={{ minWidth: "100%" }}
              />
              <label htmlFor="password">Contraseña</label>
            </FloatLabel>
          </div>
          {formik.touched.password && formik.errors.password && (
            <small className="p-error">{formik.errors.password}</small>
          )}

          {/* Botón de Login */}
          <Button label="Iniciar Sesión" type="submit" className="w-full" />
        </form>
      </div>
    </div>
  );
};

export default Login;

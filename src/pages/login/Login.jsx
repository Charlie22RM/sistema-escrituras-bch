import React, { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { FloatLabel } from "primereact/floatlabel";
import AuthService from "../../services/AuthService";
import "./Login.css";
import { Toast } from "primereact/toast";
import { useDispatch } from 'react-redux';
import { setLogin } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const dispatch = useDispatch();
    const toast = useRef(null);
    const navigateTo = useNavigate();
    const authService = AuthService();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("El email tiene un formato inválido.")
                .required("Por favor, ingrese su email."),
            password: Yup.string().required("Por favor, ingrese su contraseña"),
        }),
        onSubmit: (values, { setSubmitting }) => {
            console.log("Datos enviados:", values);
            handleLogin(values, { setSubmitting });
        },
    });

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const response = await authService.login(values.email, values.password);
            console.log("Login exitoso:", response);

            toast.current.show({
                severity: "success",
                summary: "Éxito",
                detail: "Inicio de sesión exitoso",
                life: 3000,
            });

            const payload = {
                token: response.data.access_token,
                userId: response.data.user.id,
                perfilId: response.data.user.rol_id,
            };

            dispatch(setLogin(payload));
            const perfilId = parseInt(response.data.user.rol_id);

            switch (perfilId) {
                case 1:
                    navigateTo("/administrador/");
                    break;
                case 2:
                    navigateTo("/operador/");
                    break;
                case 3:
                    navigateTo("/cliente/");
                    break;
                default:
                    navigateTo("/");
            }

        } catch (error) {
            console.error("Error en el login:", error);

            // Resetear el estado de envío
            setSubmitting(false);

            if (error.statusCode == 404) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.message,
                    life: 3000,
                });
                return;
            }

            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.message,
                life: 3000,
            });
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo and Title */}
                <div className="login-header">
                    <Avatar
                        icon="pi pi-file-edit"
                        size="xlarge"
                        shape="circle"
                        className="login-avatar bg-indigo-500 text-black"
                    />
                    <h2 className="login-title">Sistema de Escrituras</h2>
                    <p className="login-subtitle">BCHASESORES S.A.</p>
                </div>

                {/* Toast for messages */}
                <Toast ref={toast} position="top-right" />

                {/* Login Form */}
                <form onSubmit={formik.handleSubmit} className="login-form">
                    {/* Email Field */}
                    <div className="form-field">
                        <FloatLabel>
                            <InputText
                                id="email"
                                name="email"
                                className={`w-full ${formik.touched.email && formik.errors.email ? "p-invalid" : ""}`}
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                autoComplete="username"
                            />
                            <label htmlFor="email">Email</label>
                        </FloatLabel>
                        {formik.touched.email && formik.errors.email && (
                            <small className="error-message">{formik.errors.email}</small>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-field">
                        <FloatLabel>
                            <Password
                                inputId="password"
                                name="password"
                                className={`w-full ${formik.touched.password && formik.errors.password ? "p-invalid" : ""}`}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                toggleMask
                                feedback={false}
                                autoComplete="current-password"
                            />
                            <label htmlFor="password">Contraseña</label>
                        </FloatLabel>
                        {formik.touched.password && formik.errors.password && (
                            <small className="error-message">{formik.errors.password}</small>
                        )}
                    </div>

                    {/* Login Button */}
                    <Button
                        label="Iniciar Sesión"
                        type="submit"
                        className="login-button"
                        icon="pi pi-sign-in"
                        iconPos="right"
                        loading={formik.isSubmitting}
                    />

                    {/* Forgot Password Link */}
                    <div className="login-footer">
                        <small className="login-subtitle">
                            Recuerda mantener tus credenciales seguras
                        </small>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Login;
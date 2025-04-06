import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearLogout } from "../../../redux/authSlice";
import ClienteService from "../../../services/ClienteService";

const CrearClientes = () => {
  // Referencia para mostrar notificaciones (toast)
  const toast = useRef(null);
  
  // Navegación para redirigir a otras rutas
  const navigate = useNavigate();
  
  // Dispatch para acciones de Redux
  const dispatch = useDispatch();
  
  // Instancia del servicio de clientes para interactuar con la API
  const clienteService = ClienteService();

  // Formulario gestionado por Formik para la creación de clientes
  const formik = useFormik({
    // Valores iniciales del formulario
    initialValues: {
      nombre: "",
      telefono: "",
      email: "",
      direccion: "",
    },
    // Esquema de validación con Yup
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Correo tiene un formato inválido")
        .required("El correo electrónico es obligatorio"),
    }),
    // Función que se ejecuta cuando el formulario se envía
    onSubmit: async (values) => {
      try {
        // Llamada al servicio para crear un nuevo cliente
        const response = await clienteService.createCliente(values);
        
        // Mostrar mensaje de éxito
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Cliente creado correctamente",
          life: 3000,
        });
        
        // Redirigir a la página de clientes después de 3 segundos
        setTimeout(() => navigate("/administrador/consultar-cliente"), 3000);
      } catch (error) {
        // Manejo de errores en caso de no tener permisos o error de la API
        if (error.response && error.response.status === 401) {
          toast.current.show({
            severity: "warn",
            summary: "Advertencia",
            detail: "No tienes permiso para acceder a esta sección.",
            life: 5000,
          });

          // Limpiar sesión después de mostrar la advertencia
          setTimeout(() => {
            dispatch(clearLogout());
          }, 5000);
        } else {
          // Mostrar mensaje de error si la creación del cliente falla
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "Error al crear cliente",
            life: 5000,
          });
        }
      }
    },
  });

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} /> {/* Componente para mostrar notificaciones */}
      <Card title="Registrar Nuevo Cliente" className="w-full md:w-5">
        <form onSubmit={formik.handleSubmit} className="p-fluid">
          {/* Campo para el nombre del cliente */}
          <div className="field mb-3">
            <label htmlFor="nombre">Nombre</label>
            <InputText
              id="nombre"
              name="nombre"
              value={formik.values.nombre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full ${formik.touched.nombre && formik.errors.nombre ? "p-invalid" : ""}`}
            />
            {formik.touched.nombre && formik.errors.nombre && (
              <small className="p-error">{formik.errors.nombre}</small>
            )}
          </div>

          {/* Campo para el teléfono del cliente */}
          <div className="field mb-3">
            <label htmlFor="telefono">Teléfono</label>
            <InputText
              id="telefono"
              name="telefono"
              value={formik.values.telefono}
              onChange={formik.handleChange}
              maxLength={10}
              className="w-full"
            />
          </div>

          {/* Campo para el email del cliente */}
          <div className="field mb-3">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full ${formik.touched.email && formik.errors.email ? "p-invalid" : ""}`}
            />
            {formik.touched.email && formik.errors.email && (
              <small className="p-error">{formik.errors.email}</small>
            )}
          </div>

          {/* Campo para la dirección del cliente */}
          <div className="field mb-3">
            <label htmlFor="direccion">Dirección</label>
            <InputText
              id="direccion"
              name="direccion"
              value={formik.values.direccion}
              onChange={formik.handleChange}
              className="w-full"
            />
          </div>

          {/* Botones para guardar o cancelar la creación */}
          <div className="flex justify-content-between gap-3">
            <Button
              label="Guardar"
              icon="pi pi-check"
              type="submit"
              className="p-button-success w-full"
              loading={formik.isSubmitting} // Deshabilitar el botón mientras se está enviando el formulario
            />
            <Button
              label="Cancelar"
              icon="pi pi-times"
              type="button"
              className="p-button-danger w-full"
              onClick={() => navigate("/administrador/consultar-cliente")} // Redirigir a la página de clientes
              disabled={formik.isSubmitting} // Deshabilitar el botón mientras se está enviando el formulario
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CrearClientes;




// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from 'primereact/button';
// import { Card } from 'primereact/card';
// import { InputText } from 'primereact/inputtext';
// import { Toast } from 'primereact/toast';
// import { useDispatch } from 'react-redux';
// import { clearLogout } from '../../../redux/authSlice'; // Asegúrate de importar clearLogout
// import ClienteService from '../../../services/ClienteService'; // Asegúrate de usar el servicio con los headers de autorización

// const CrearClientes = () => {
//   const [nombre, setNombre] = useState('');
//   const [telefono, setTelefono] = useState('');
//   const [email, setEmail] = useState('');
//   const [direccion, setDireccion] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorNombre, setErrorNombre] = useState(false);
//   const [errorEmail, setErrorEmail] = useState(false); // Estado para validar el email
//   const navigate = useNavigate();
//   const toast = useRef(null);
//   const dispatch = useDispatch(); // Para manejar el estado global
//   const clienteService = ClienteService(); // Usa el servicio cliente para las solicitudes API

//   // Función para cancelar el formulario y regresar
//   const handleCancel = () => {
//     navigate('/administrador/consultar-cliente');
//   };

//   // Función para enviar el formulario
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!nombre.trim()) {
//       setErrorNombre(true);
//       return;
//     }

//     if (email && errorEmail) { // Si el email está en formato incorrecto
//       toast.current.show({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'Ingrese un correo electrónico válido.',
//         life: 5000,
//       });
//       return;
//     }

//     setErrorNombre(false);
//     setLoading(true);

//     try {
//       // Llamada al servicio para crear un cliente
//       const response = await clienteService.createCliente({
//         nombre,
//         telefono: telefono.toString(),
//         email,
//         direccion,
//       });
//       toast.current.show({
//         severity: 'success',
//         summary: 'Éxito',
//         detail: 'Cliente creado correctamente',
//         life: 3000,
//       });
//       setTimeout(() => navigate('/administrador/consultar-cliente'), 3000);
//     } catch (error) {
//       if (error.response && error.response.status === 401) {
//         toast.current.show({
//           severity: 'warn',
//           summary: 'Advertencia',
//           detail: 'No tienes permiso para acceder a esta sección.',
//           life: 5000,
//         });

//         setTimeout(() => {
//           dispatch(clearLogout()); // Limpiar datos de sesión en Redux y localStorage
//           navigate('/'); // Redirigir al login
//         }, 5000);
//       } else {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: error.response?.data?.message || 'Error al crear cliente',
//           life: 5000,
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Manejo del cambio del nombre
//   const handleNombreChange = (e) => {
//     setNombre(e.target.value);
//     if (e.target.value.trim()) {
//       setErrorNombre(false);
//     }
//   };

//   // Validación al salir del campo de nombre
//   const handleNombreBlur = () => {
//     if (!nombre.trim()) {
//       setErrorNombre(true);
//     }
//   };

//   // Manejo del cambio del correo electrónico
//   const handleEmailChange = (e) => {
//     setEmail(e.target.value);
//     if (validateEmail(e.target.value)) {
//       setErrorEmail(false); // Elimina el error si el formato es válido
//     }
//   };

//   // Validación al salir del campo de correo
//   const handleEmailBlur = () => {
//     if (email && !validateEmail(email)) {
//       setErrorEmail(true);
//     }
//   };

//   // Validación básica de correo electrónico
//   const validateEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   return (
//     <div className="p-1 flex justify-content-center">
//       <Toast ref={toast} />
//       <Card title="Registrar Nuevo Cliente" className="w-full md:w-5">
//         <form onSubmit={handleSubmit} className="p-fluid">
//           <div className="field mb-3">
//             <label htmlFor="nombre">Nombre</label>
//             <InputText
//               id="nombre"
//               value={nombre}
//               onChange={handleNombreChange}
//               onBlur={handleNombreBlur}
//               className={`w-full ${errorNombre ? 'p-invalid' : ''}`}
//             />
//             {errorNombre && <small className="p-error">Por favor, ingrese un nombre.</small>}
//           </div>

//           <div className="field mb-3">
//             <label htmlFor="telefono">Teléfono</label>
//             <InputText
//               id="telefono"
//               value={telefono}
//               onChange={(e) => {
//                 const value = e.target.value.replace(/[^0-9]/g, '');
//                 setTelefono(value);
//               }}
//               className="w-full"
//               maxLength={10}
//             />
//           </div>

//           <div className="field mb-3">
//             <label htmlFor="email">Email</label>
//             <InputText
//               id="email"
//               value={email}
//               onChange={handleEmailChange}
//               onBlur={handleEmailBlur}
//               className={`w-full ${errorEmail ? 'p-invalid' : ''}`}
//             />
//             {errorEmail && <small className="p-error">Ingrese un correo electrónico válido.</small>}
//           </div>

//           <div className="field mb-3">
//             <label htmlFor="direccion">Dirección</label>
//             <InputText
//               id="direccion"
//               value={direccion}
//               onChange={(e) => setDireccion(e.target.value)}
//               className="w-full"
//             />
//           </div>

//           <div className="flex justify-content-between gap-3">
//             <Button
//               label="Guardar"
//               icon="pi pi-check"
//               type="submit"
//               className="p-button-success w-full"
//               loading={loading}
//             />
//             <Button
//               label="Cancelar"
//               icon="pi pi-times"
//               type="button"
//               className="p-button-danger w-full"
//               onClick={handleCancel}
//               disabled={loading}
//             />
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default CrearClientes;

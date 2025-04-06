import React, { useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearLogout } from '../../../redux/authSlice'; // Asegurarnos de importar clearLogout
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const EditarClientes = () => {
  // Obtener el id del cliente desde los parámetros de la URL
  const { id } = useParams();
  
  // Referencia para mostrar mensajes (toast)
  const toast = useRef(null);
  
  // Dispatch para acciones de Redux
  const dispatch = useDispatch();
  
  // Navegación para redirigir a otras rutas
  const navigate = useNavigate();

  // Formulario gestionado por Formik para la edición del cliente
  const formik = useFormik({
    // Valores iniciales del formulario
    initialValues: {
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
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
        // Enviar los datos del cliente actualizado a la API
        await axios.put(`http://localhost:3000/clientes/${id}`, values);
        // Mostrar mensaje de éxito
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente actualizado correctamente',
          life: 3000,
        });
        // Redirigir al listado de clientes después de 3 segundos
        setTimeout(() => navigate('/administrador/consultar-cliente'), 3000);
      } catch (error) {
        // Manejo de errores en caso de no tener permisos o falla en la API
        if (error.response && error.response.status === 401) {
          toast.current.show({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No tienes permiso para acceder a esta sección.',
            life: 5000,
          });
          setTimeout(() => {
            dispatch(clearLogout()); // Limpiar sesión
            navigate('/'); // Redirigir al inicio
          }, 5000);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el cliente.',
            life: 5000,
          });
        }
      }
    },
  });

  // useEffect para cargar los datos del cliente al iniciar el componente
  useEffect(() => {
    // Función para obtener el cliente desde la API
    const fetchCliente = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/clientes/${id}`);
        const { nombre, telefono, email, direccion } = response.data;
        // Llenar los valores del formulario con los datos obtenidos
        formik.setValues({
          nombre: nombre || '',
          telefono: telefono || '',
          email: email || '',
          direccion: direccion || '',
        });
      } catch (error) {
        // Manejo de errores si no se puede obtener el cliente
        if (error.response && error.response.status === 401) {
          toast.current.show({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No tienes permiso para acceder a esta sección.',
            life: 5000,
          });
          setTimeout(() => {
            dispatch(clearLogout());
            navigate('/');
          }, 5000);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el cliente.',
            life: 5000,
          });
        }
      }
    };

    fetchCliente(); // Llamada para obtener los datos del cliente
  }, [id, dispatch, navigate]); // Dependencias: solo se ejecuta cuando cambian el id, dispatch o navigate

  return (
    <div className="p-1 flex justify-content-center">
      <Toast ref={toast} /> {/* Componente para mostrar notificaciones */}
      <Card title="Editar Cliente" className="w-full md:w-5">
        <form onSubmit={formik.handleSubmit} className="p-fluid">
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

          {/* Botones para guardar o cancelar la edición */}
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
              onClick={() => navigate('/administrador/consultar-cliente')} 
              disabled={formik.isSubmitting} 
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditarClientes;


// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { clearLogout } from '../../../redux/authSlice'; // Asegurarnos de importar clearLogout
// import axios from 'axios';
// import { Button } from 'primereact/button';
// import { Card } from 'primereact/card';
// import { InputText } from 'primereact/inputtext';
// import { Toast } from 'primereact/toast';

// const EditarClientes = () => {
//   const [nombre, setNombre] = useState('');
//   const [telefono, setTelefono] = useState('');
//   const [email, setEmail] = useState('');
//   const [direccion, setDireccion] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorNombre, setErrorNombre] = useState(false);
//   const [errorEmail, setErrorEmail] = useState(false);
//   const navigate = useNavigate();
//   const toast = useRef(null);
//   const dispatch = useDispatch(); // Llamar al dispatch
//   const { id } = useParams();

//   useEffect(() => {
//     const fetchCliente = async () => {
//       try {
//         const response = await axios.get(`http://localhost:3000/clientes/${id}`);
//         const { nombre, telefono, email, direccion } = response.data;
//         setNombre(nombre || '');
//         setTelefono(telefono || '');
//         setEmail(email || '');
//         setDireccion(direccion || '');
//       } catch (error) {
//         // Verificar si el error es 401 y hacer el logout
//         if (error.response && error.response.status === 401) {
//           toast.current.show({
//             severity: 'warn',
//             summary: 'Advertencia',
//             detail: 'No tienes permiso para acceder a esta sección.',
//             life: 5000,
//           });

//           setTimeout(() => {
//             dispatch(clearLogout()); 
//             navigate('/'); 
//           }, 5000);
//         } else {
//           toast.current.show({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'No se pudo cargar el cliente.',
//             life: 5000,
//           });
//         }
//       }
//     };

//     fetchCliente();
//   }, [id, dispatch, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!nombre.trim()) { 
//       setErrorNombre(true);
//       return;
//     }

//     if (!validateEmail(email)) { 
//       setErrorEmail(true);
//       toast.current.show({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'Ingrese un correo electrónico válido.',
//         life: 5000,
//       });
//       return;
//     }

//     setErrorEmail(false); 
//     setLoading(true);

//     try {
//       await axios.put(`http://localhost:3000/clientes/${id}`, {
//         nombre,
//         telefono: telefono.toString(),
//         email,
//         direccion,
//       });

//       toast.current.show({
//         severity: 'success',
//         summary: 'Éxito',
//         detail: 'Cliente actualizado correctamente',
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
//           dispatch(clearLogout()); // Limpiar el estado y los datos de autenticación
//           navigate('/'); // Redirigir al login después de 5 segundos
//         }, 5000);
//       } else {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'No se pudo actualizar el cliente.',
//           life: 5000,
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   return (
//     <div className="p-1 flex justify-content-center">
//       <Toast ref={toast} />
//       <Card title="Editar Cliente" className="w-full md:w-5">
//         <form onSubmit={handleSubmit} className="p-fluid">
//           <div className="field mb-3">
//             <label htmlFor="nombre">Nombre</label>
//             <InputText id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full" />
//           </div>

//           <div className="field mb-3">
//             <label htmlFor="telefono">Teléfono</label>
//             <InputText id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full" maxLength={10} />
//           </div>

//           <div className="field mb-3">
//             <label htmlFor="email">Email</label>
//             <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
//           </div>

//           <div className="field mb-3">
//             <label htmlFor="direccion">Dirección</label>
//             <InputText id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full" />
//           </div>

//           <div className="flex justify-content-between gap-3">
//             <Button label="Guardar" icon="pi pi-check" type="submit" className="p-button-success w-full" loading={loading} />
//             <Button label="Cancelar" icon="pi pi-times" type="button" className="p-button-danger w-full" onClick={() => navigate('/administrador/consultar-cliente')} disabled={loading} />
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default EditarClientes; 
import { useState, useEffect, useRef } from "react";
import ClienteModal from "../../../modals/ClienteModal";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import InmobiliariaModal from "../../../modals/InmobiliariaModal";
import CantonService from "../../../services/CantonService";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProyectoModal from "../../../modals/ProyectoModal";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearLogout } from "../../../redux/authSlice";
import ProyectoService from "../../../services/ProyectoService";
import TramiteService from "../../../services/TramiteService";

// Estilo reutilizable para inputs bloqueados
const blockedInputStyle = {
  width: "400px",
  backgroundColor: "#f5f5f5",
  borderColor: "#ddd",
  color: "#666",
};

const CrearTramites = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInmobiliariaVisible, setModalInmobiliariaVisible] =
    useState(false);
  const [modalProyectoVisible, setModalProyectoVisible] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [inmobiliaria, setInmobiliaria] = useState(null);
  const [proyecto, setProyecto] = useState(null);
  const toast = useRef(null);

  const [cantones, setCantones] = useState([]);
  const cantonService = CantonService();
  const tramiteService = TramiteService();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleModalHide = () => setModalVisible(false);

  const handleModalProyecto = () => {
    if (formik.values.canton_id === null) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "No has seleccionado un cantón.",
        life: 3000,
      });
      return;
    }
    setModalProyectoVisible(true);
  };

  const formik = useFormik({
    initialValues: {
      cliente_id: null,
      inmobiliaria_id: null,
      proyecto_id: null,
      canton_id: null,
      nombre_beneficiario: "",
      cedula_beneficiario: "",
      fecha_asignacion: null,
    },
    validationSchema: Yup.object({
      cliente_id: Yup.string().required("Cliente es requerido"),
      inmobiliaria_id: Yup.string().required("Inmobiliaria es requerida"),
      proyecto_id: Yup.string().required("Proyecto es requerido"),
      canton_id: Yup.string().required("Cantón es requerido"),
      nombre_beneficiario: Yup.string().required(
        "Nombre del beneficiario es requerido"
      ),
      cedula_beneficiario: Yup.string()
        .required("Cédula del beneficiario es requerida")
        .matches(/^[0-9]+$/, "La cédula solo debe contener números")
        .length(10, "La cédula debe tener 10 dígitos"),
      fecha_asignacion: Yup.date().required("La fecha del trámite es requerida"),
    }),
    onSubmit: async (values) => {
      try {
        await tramiteService.createTramite(values);

        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Trámite creado correctamente",
          life: 3000,
        });
        setTimeout(() => navigate("/administrador/consultar-tramite"), 3000);
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
        handleError(error);

      }
      console.log("Formulario enviado:", values);
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
    console.log("Error:", error);
    if (error?.response?.status === 401 || error.statusCode === 401) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Su sesión ha expirado, inicie sesión de nuevo.",
        life: 3000,
      });
      setTimeout(() => {
        dispatch(clearLogout());
        navigate("/");
      }, 3000);
    } else {
      console.error("Error al cargar los clientes:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar los clientes.",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    //setLoading(true);
    const fetchData = async () => {
      await getTags();
      //setLoading(false);
    };
    fetchData();
  }, []);

  const showDisabledMessage = () => {
    if (!cliente || !inmobiliaria) {
      toast.current.show({
        severity: "warn",
        summary: "Campos requeridos",
        detail: "Por favor, seleccione un cliente y una inmobiliaria primero.",
        life: 3000, // Duración del toast en ms
      });
    }
  };

  const handleSetCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    formik.setFieldValue("cliente_id", clienteSeleccionado.id);
  };

  const handleSetInmobiliaria = (inmobiliariaSeleccionada) => {
    setInmobiliaria(inmobiliariaSeleccionada);
    formik.setFieldValue("inmobiliaria_id", inmobiliariaSeleccionada.id);
    //formik.setFieldTouched("inmobiliaria_id", true); // <-- Añade esta línea
    // Limpiar campos dependientes si cambia la inmobiliaria
    formik.setFieldValue("proyecto_id", null);
    setProyecto(null);
  };

  const handleSetProyecto = (proyectoSeleccionado) => {
    setProyecto(proyectoSeleccionado);
    formik.setFieldValue("proyecto_id", proyectoSeleccionado.id);
  };

  useEffect(() => {
    // Si cambia el cliente, resetear inmobiliaria y campos dependientes
    if (!formik.values.cliente_id) {
      formik.setFieldValue("inmobiliaria_id", null);
      setInmobiliaria(null);
      formik.setFieldValue("proyecto_id", null);
      setProyecto(null);
    }
  }, [formik.values.cliente_id]);

  useEffect(() => {
    // Si cambia la inmobiliaria, resetear proyecto
    if (!formik.values.inmobiliaria_id) {
      formik.setFieldValue("proyecto_id", null);
      setProyecto(null);
    }
  }, [formik.values.inmobiliaria_id]);

  useEffect(() => {
    // Si cambia el cantón, resetear proyecto
    if (!formik.values.canton_id) {
      formik.setFieldValue("proyecto_id", null);
      setProyecto(null);
    }
  }, [formik.values.canton_id]);

  useEffect(() => {
    if (inmobiliaria && formik.errors.inmobiliaria_id) {
      formik.setFieldTouched("inmobiliaria_id", true);
      //formik.validateForm();
    }
  }, [inmobiliaria]);
  return (
    <>
      <Toast ref={toast} />
      <div className="tramite-form-container">
        <Card
          title={
            <div className="flex align-items-center">
              <Button
                icon="pi pi-arrow-left"
                className="p-button-text p-button-plain mr-2"
                onClick={() => navigate("/administrador/consultar-tramite")}
                tooltip="Volver a página anterior"
                tooltipOptions={{ position: "top" }}
              />
              <span>Registrar nuevo Trámite</span>
            </div>
          }
          //className="tramite-form-card"
          className="w-full md:w-6"
        >
          <form onSubmit={formik.handleSubmit} className="tramite-form">
            <div className="tramite-form-content">
              {/* Input Cliente */}
              <div className="tramite-form-group">
                <div className="tramite-input-group">
                  <InputText
                    value={cliente?.nombre || ""}
                    placeholder="Cliente"
                    disabled
                    className={`tramite-input ${formik.touched.cliente_id && formik.errors.cliente_id ? "p-invalid" : ""}`}
                  />
                  <Button
                  
                    icon="pi pi-search"
                    label="Buscar Cliente"
                    onClick={() => setModalVisible(true)}
                    className="tramite-button tramite-search-button"
                  />
                </div>
                {formik.touched.cliente_id && formik.errors.cliente_id && (
                  <small className="tramite-error">{formik.errors.cliente_id}</small>
                )}
              </div>

              {/* Input Inmobiliaria */}
              <div className="tramite-form-group">
                <div className="tramite-input-group">
                  <InputText
                    value={inmobiliaria?.nombre || ""}
                    placeholder="Inmobiliaria"
                    disabled
                    className={`tramite-input ${formik.touched.inmobiliaria_id && formik.errors.inmobiliaria_id ? "p-invalid" : ""}`}
                  />
                  <Button
                    icon="pi pi-search"
                    label="Buscar Inmobiliaria"
                    onClick={() => {
                      if (!formik.values.cliente_id) {
                        toast.current.show({
                          severity: "warn",
                          summary: "Advertencia",
                          detail: "Primero seleccione un cliente",
                          life: 3000,
                        });
                        return;
                      }
                      setModalInmobiliariaVisible(true);
                    }}
                    className="tramite-button tramite-search-button"
                  />
                </div>
                {formik.touched.inmobiliaria_id && formik.errors.inmobiliaria_id && (
                  <small className="tramite-error">{formik.errors.inmobiliaria_id}</small>
                )}
              </div>

              {/* Input Cantón */}
              <div className="tramite-form-group" onClick={showDisabledMessage}>
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
                  className={`tramite-dropdown ${formik.touched.canton_id && formik.errors.canton_id ? "p-invalid" : ""}`}
                  disabled={!cliente || !inmobiliaria}
                />
                {formik.touched.canton_id && formik.errors.canton_id && (
                  <small className="tramite-error">{formik.errors.canton_id}</small>
                )}
              </div>

              {/* Input Proyecto */}
              <div className="tramite-form-group">
                <div className="tramite-input-group">
                  <InputText
                    value={proyecto?.nombre || ""}
                    placeholder="Proyecto"
                    disabled
                    className={`tramite-input ${formik.touched.proyecto_id && formik.errors.proyecto_id ? "p-invalid" : ""}`}
                  />
                  <Button
                    icon="pi pi-search"
                    label="Buscar Proyecto"
                    onClick={handleModalProyecto}
                    className="tramite-button tramite-search-button"
                  />
                </div>
                {formik.touched.proyecto_id && formik.errors.proyecto_id && (
                  <small className="tramite-error">{formik.errors.proyecto_id}</small>
                )}
              </div>

              {/* Input Nombre del Beneficiario */}
              <div className="tramite-form-group">
                <InputText
                  id="nombre_beneficiario"
                  name="nombre_beneficiario"
                  value={formik.values.nombre_beneficiario}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nombre del beneficiario"
                  className={`tramite-input ${formik.touched.nombre_beneficiario && formik.errors.nombre_beneficiario ? "p-invalid" : ""}`}
                />
                {formik.touched.nombre_beneficiario && formik.errors.nombre_beneficiario && (
                  <small className="tramite-error">{formik.errors.nombre_beneficiario}</small>
                )}
              </div>

              {/* Input Cédula del Beneficiario */}
              <div className="tramite-form-group">
                <InputText
                  id="cedula_beneficiario"
                  name="cedula_beneficiario"
                  value={formik.values.cedula_beneficiario}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    formik.setFieldValue("cedula_beneficiario", value);
                  }}
                  onBlur={formik.handleBlur}
                  placeholder="Cédula del beneficiario"
                  className={`tramite-input ${formik.touched.cedula_beneficiario && formik.errors.cedula_beneficiario ? "p-invalid" : ""}`}
                  maxLength={10}
                />
                {formik.touched.cedula_beneficiario && formik.errors.cedula_beneficiario && (
                  <small className="tramite-error">{formik.errors.cedula_beneficiario}</small>
                )}
              </div>

              {/* Input Fecha del trámite */}
              <div className="tramite-form-group">
                <Calendar
                  id="fecha_asignacion"
                  name="fecha_asignacion"
                  value={formik.values.fecha_asignacion}
                  onChange={(e) => formik.setFieldValue("fecha_asignacion", e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  placeholder="Fecha del trámite"
                  className={`tramite-calendar ${formik.submitCount > 0 && formik.errors.fecha_asignacion ? "p-invalid" : ""}`}
                />
                {formik.submitCount > 0 && formik.errors.fecha_asignacion && (
                  <small className="tramite-error">{formik.errors.fecha_asignacion}</small>
                )}
              </div>

              <div className="tramite-form-actions">
                <Button
                  label="Guardar"
                  icon="pi pi-save"
                  type="submit"
                  className="tramite-button tramite-submit"
                  loading={formik.isSubmitting}
                />
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  type="button"
                  className="tramite-button tramite-cancel"
                  onClick={() => navigate("/administrador/consultar-tramite")}
                  disabled={formik.isSubmitting}
                />
              </div>
            </div>
          </form>
        </Card>

        <ClienteModal
          visible={modalVisible}
          onHide={handleModalHide}
          setCliente={handleSetCliente}
        />
        <InmobiliariaModal
          visible={modalInmobiliariaVisible}
          onHide={() => setModalInmobiliariaVisible(false)}
          setInmobiliaria={handleSetInmobiliaria}
          cliente_id={cliente?.id}
        />
        <ProyectoModal
          visible={modalProyectoVisible}
          onHide={() => setModalProyectoVisible(false)}
          setProyecto={handleSetProyecto}
          canton_id={formik.values.canton_id}
          inmobiliaria_id={formik.values.inmobiliaria_id} // <-- ¡Nuevo prop!
        />
      </div>
    </>
  );
};

export default CrearTramites;

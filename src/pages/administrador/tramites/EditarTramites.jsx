import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import ClienteModal from "../../../modals/ClienteModal";
import InmobiliariaModal from "../../../modals/InmobiliariaModal";
import ProyectoModal from "../../../modals/ProyectoModal";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import TramiteService from "../../../services/TramiteService";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { clearLogout } from "../../../redux/authSlice";
import CantonService from "../../../services/CantonService";
import * as Yup from "yup";
import { FileUpload } from "primereact/fileupload";
import PdfService from "../../../services/PdfService";
import Swal from "sweetalert2";
import { InputTextarea } from "primereact/inputtextarea";

// Estilo reutilizable para inputs bloqueados
const blockedInputStyle = {
  width: "400px",
  backgroundColor: "#f5f5f5",
  borderColor: "#ddd",
  color: "#666",
};
const EditarTramites = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const formik = useFormik({
    initialValues: {
      cliente_id: null,
      inmobiliaria_id: null,
      proyecto_id: null,
      canton_id: null,
      nombre_beneficiario: "",
      cedula_beneficiario: "",
      fecha_asignacion: null,
      fecha_revision_titulo: null,
      fecha_envio_liquidar_impuesto: null,
      observaciones_liquidacion_impuesto: null,
      fecha_envio_aprobacion_proforma: null,
      fecha_aprobacion_proforma: null,
      observaciones_proforma: null,
      fecha_firma_matriz_cliente: null,
      fecha_retorno_matriz_firmada: null,
      observaciones_matriz_firmada: null,
      fecha_ingreso_registro: null,
      fecha_tentativa_inscripcion: null,
      fecha_inscripcion: null,
      fecha_ingreso_catastro: null,
      fecha_tentativa_catastro: null,
      fecha_catastro: null,
      observaciones_catastro: null,
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
      fecha_asignacion: Yup.date().required(
        "La fecha del trámite es requerida"
      ),
      fecha_revision_titulo: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de envío para liquidar impuestos",
          function (value) {
            const { fecha_envio_liquidar_impuesto } = this.parent;
            if (fecha_envio_liquidar_impuesto && !value) return false;
            return true;
          }
        ),
      fecha_envio_aprobacion_proforma: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de envío para aprobación de proforma",
          function (value) {
            const { fecha_aprobacion_proforma } = this.parent;
            if (fecha_aprobacion_proforma && !value) return false;
            return true;
          }
        ),

      fecha_aprobacion_proforma: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de aprobación de proforma",
          function (value) {
            const { fecha_firma_matriz_cliente } = this.parent;
            if (fecha_firma_matriz_cliente && !value) return false;
            return true;
          }
        ),

      fecha_firma_matriz_cliente: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de retorno de matriz firmada",
          function (value) {
            const { fecha_retorno_matriz_firmada } = this.parent;
            if (fecha_retorno_matriz_firmada && !value) return false;
            return true;
          }
        ),

      fecha_retorno_matriz_firmada: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de ingreso al registro",
          function (value) {
            const { fecha_ingreso_registro } = this.parent;
            if (fecha_ingreso_registro && !value) return false;
            return true;
          }
        ),

      fecha_ingreso_registro: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de tentativa de inscripción",
          function (value) {
            const { fecha_tentativa_inscripcion } = this.parent;
            if (fecha_tentativa_inscripcion && !value) return false;
            return true;
          }
        ),

      fecha_tentativa_inscripcion: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de inscripción",
          function (value) {
            const { fecha_inscripcion } = this.parent;
            if (fecha_inscripcion && !value) return false;
            return true;
          }
        ),

      fecha_inscripcion: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de ingreso al catastro",
          function (value) {
            const { fecha_ingreso_catastro } = this.parent;
            if (fecha_ingreso_catastro && !value) return false;
            return true;
          }
        ),

      fecha_ingreso_catastro: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha tentativa de catastro",
          function (value) {
            const { fecha_tentativa_catastro } = this.parent;
            if (fecha_tentativa_catastro && !value) return false;
            return true;
          }
        ),

      fecha_tentativa_catastro: Yup.date()
        .nullable()
        .test(
          "requerido-si-envio-existe",
          "No puede estar vacío si ya llenaste la fecha de catastro",
          function (value) {
            const { fecha_catastro } = this.parent;
            if (fecha_catastro && !value) return false;
            return true;
          }
        ),
    }),
    onSubmit: async (values) => {
      try {
        await tramiteService.update(id, values);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Trámite actualizado correctamente",
          life: 3000,
        });
        setTimeout(() => navigate("/administrador/consultar-tramite"), 3000);
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
        handleError(error);
      }
    },
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInmobiliariaVisible, setModalInmobiliariaVisible] =
    useState(false);
  const [modalProyectoVisible, setModalProyectoVisible] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [inmobiliaria, setInmobiliaria] = useState(null);
  const [proyecto, setProyecto] = useState(null);
  const [cantones, setCantones] = useState([]);
  const tramiteService = TramiteService();
  const cantonService = CantonService();
  const pdfService = PdfService();
  const [pdfCatastroId, setPdfCatastroId] = useState(null);
  const [pdfTituloId, setPdfTituloId] = useState(null);
  const [pdfFacturasId, setPdfFacturasId] = useState([]);
  const [uploading, setUploading] = useState(false);

  const getTramite = async () => {
    try {
      const tramite = await tramiteService.findOne(id);
      console.log(tramite);
      if (tramite) {
        setCliente(tramite.cliente);
        setInmobiliaria(tramite.inmobiliaria);
        setProyecto(tramite.proyecto);
        if (tramite.pdfs) {
          const pdfs = tramite.pdfs;
          pdfs.forEach((pdf) => {
            if (pdf.is_catastro) {
              setPdfCatastroId(pdf.id);
            } else if (pdf.is_titulo) {
              setPdfTituloId(pdf.id);
            } else if (pdf.is_factura) {
              setPdfFacturasId((prev) => [...prev, pdf.id]);
            }
          });
        }
        // Convertir la fecha de string a objeto Date
        const fechaAsignacion = tramite.fecha_asignacion
          ? new Date(tramite.fecha_asignacion)
          : null;
        const fecha_revision_titulo = tramite.fecha_revision_titulo
          ? new Date(tramite.fecha_revision_titulo)
          : null;
        const fecha_envio_liquidar_impuesto =
          tramite.fecha_envio_liquidar_impuesto
            ? new Date(tramite.fecha_envio_liquidar_impuesto)
            : null;
        const fecha_firma_matriz_cliente = tramite.fecha_firma_matriz_cliente
          ? new Date(tramite.fecha_firma_matriz_cliente)
          : null;
        const fecha_retorno_matriz_firmada =
          tramite.fecha_retorno_matriz_firmada
            ? new Date(tramite.fecha_retorno_matriz_firmada)
            : null;
        const fecha_ingreso_registro = tramite.fecha_ingreso_registro
          ? new Date(tramite.fecha_ingreso_registro)
          : null;
        const fecha_tentativa_inscripcion = tramite.fecha_tentativa_inscripcion
          ? new Date(tramite.fecha_tentativa_inscripcion)
          : null;
        const fecha_inscripcion = tramite.fecha_inscripcion
          ? new Date(tramite.fecha_inscripcion)
          : null;
        const fecha_ingreso_catastro = tramite.fecha_ingreso_catastro
          ? new Date(tramite.fecha_ingreso_catastro)
          : null;
        const fecha_tentativa_catastro = tramite.fecha_tentativa_catastro
          ? new Date(tramite.fecha_tentativa_catastro)
          : null;
        const fecha_catastro = tramite.fecha_catastro
          ? new Date(tramite.fecha_catastro)
          : null;
        const fecha_envio_aprobacion_proforma =
          tramite.fecha_envio_aprobacion_proforma
            ? new Date(tramite.fecha_envio_aprobacion_proforma)
            : null;
        const fecha_aprobacion_proforma = tramite.fecha_aprobacion_proforma
          ? new Date(tramite.fecha_aprobacion_proforma)
          : null;

        formik.setValues({
          cliente_id: tramite.cliente_id,
          inmobiliaria_id: tramite.inmobiliaria_id,
          proyecto_id: tramite.proyecto_id,
          canton_id: tramite.canton_id,
          nombre_beneficiario: tramite.nombre_beneficiario || "",
          cedula_beneficiario: tramite.cedula_beneficiario,
          fecha_asignacion: fechaAsignacion,
          fecha_revision_titulo: fecha_revision_titulo,
          fecha_envio_liquidar_impuesto: fecha_envio_liquidar_impuesto,
          fecha_aprobacion_proforma: fecha_aprobacion_proforma,
          fecha_envio_aprobacion_proforma: fecha_envio_aprobacion_proforma,
          observaciones_proforma: tramite.observaciones_proforma || "",
          observaciones_liquidacion_impuesto:
            tramite.observaciones_liquidacion_impuesto || "",
          fecha_firma_matriz_cliente: fecha_firma_matriz_cliente,
          fecha_retorno_matriz_firmada: fecha_retorno_matriz_firmada,
          observaciones_matriz_firmada:
            tramite.observaciones_matriz_firmada || "",
          fecha_ingreso_registro: fecha_ingreso_registro,
          fecha_tentativa_inscripcion: fecha_tentativa_inscripcion,
          fecha_inscripcion: fecha_inscripcion,
          fecha_ingreso_catastro: fecha_ingreso_catastro,
          fecha_tentativa_catastro: fecha_tentativa_catastro,
          fecha_catastro: fecha_catastro,
          observaciones_catastro: tramite.observaciones_catastro || "",
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

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
    console.error("Error al cargar los clientes:", error.statusCode);
    if (error?.response?.data?.statusCode === 401 || error.statusCode === 401) {
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

  const handleSetCliente = (clienteSeleccionado) => {
    // Resetear todo en una sola operación
    formik.setValues({
      ...formik.values,
      cliente_id: clienteSeleccionado.id,
      inmobiliaria_id: null,
      canton_id: null,
      proyecto_id: null,
    });

    // Actualizar estados locales
    setCliente(clienteSeleccionado);
    setInmobiliaria("null");
    setProyecto(null);
    setModalVisible(false);

    // Marcar campos como "touched" si es necesario
    formik.setTouched({
      ...formik.touched,
      inmobiliaria_id: false,
      proyecto_id: false,
    });
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
    const fetchData = async () => {
      Promise.all([getTags(), getTramite()]);
    };
    fetchData();
  }, []);

  const handleUpload = async (event, additionalData) => {
    const { files } = event;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadRes = await pdfService.uploadPdf(files[0], {
        tramite_id: id,
        ...additionalData,
      });

      const pdfId = uploadRes.data.id; // Asegúrate de retornar el ID en el backend
      if (additionalData.is_catastro) {
        setPdfCatastroId(pdfId);
      } else if (additionalData.is_titulo) {
        setPdfTituloId(pdfId);
      } else if (additionalData.is_factura) {
        setPdfFacturasId((prev) => [...prev, pdfId]);
      }

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "PDF subido correctamente",
        life: 3000,
      });
      //console.error("Error subiendo PDF", error);
      //alert("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const getPdfUrl = async () => {
    try {
      const pdfId = pdfCatastroId;
      const response = await pdfService.getPdf(pdfId);
      window.open(response.data.url, "_blank");
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeletePdf = async (id, tipo) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await pdfService.deletePdf(id);
        Swal.fire("¡Eliminado!", "El PDF ha sido borrado.", "success");
        switch (tipo) {
          case "catastro":
            setPdfCatastroId(null);
            break;
          case "titulo":
            setPdfTituloId(null);
            break;
          case "factura":
            setPdfFacturasId((prev) => prev.filter((pdfId) => pdfId !== id));
            break;
          default:
            console.error("Tipo de PDF no reconocido:", tipo);
            break;
        }
      } catch (error) {
        //Swal.fire("Error", "No se pudo eliminar el PDF", "error");
        handleError(error);
      }
    }
  };
  return (
    <div className="p-fluid">
      <Toast ref={toast} />

      {/* Formulario principal que envuelve todos los tabs */}
      <form onSubmit={formik.handleSubmit}>
        <TabView>
          {/* TAB 1: INFORMACIÓN GENERAL */}
          <TabPanel header="Información general">
            <div className="flex flex-column align-items-center gap-4 p-4">
              <Card title="Registrar Nuevo Trámite" className="w-full md:w-5">
                <div
                  className="flex flex-column gap-5 w-full"
                  style={{ maxWidth: "650px" }}
                >
                  {/* Input Cliente */}
                  <div className="flex flex-column gap-2">
                    <div className="flex align-items-center gap-3">
                      <div style={{ minWidth: "400px", cursor: "not-allowed" }}>
                        <InputText
                          value={cliente?.nombre || ""}
                          placeholder="Cliente"
                          disabled
                          className={`p-inputtext-sm w-full ${
                            formik.touched.cliente_id &&
                            formik.errors.cliente_id
                              ? "p-invalid"
                              : ""
                          }`}
                          style={{
                            ...blockedInputStyle,
                            borderColor:
                              formik.touched.cliente_id &&
                              formik.errors.cliente_id
                                ? "#e24c4c"
                                : "#ddd",
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        icon="pi pi-user"
                        label="Buscar Cliente"
                        onClick={() => setModalVisible(true)}
                        className="p-button-primary flex-grow-1"
                      />
                    </div>
                    {formik.touched.cliente_id && formik.errors.cliente_id && (
                      <small className="p-error">
                        {formik.errors.cliente_id}
                      </small>
                    )}
                  </div>

                  {/* Input Inmobiliaria */}
                  <div className="flex flex-column gap-2">
                    <div className="flex align-items-center gap-3">
                      <div style={{ minWidth: "400px", cursor: "not-allowed" }}>
                        <InputText
                          value={inmobiliaria?.nombre || ""}
                          placeholder="Inmobiliaria"
                          disabled
                          className={`p-inputtext-sm w-full ${
                            formik.touched.inmobiliaria_id &&
                            formik.errors.inmobiliaria_id
                              ? "p-invalid"
                              : ""
                          }`}
                          style={{
                            ...blockedInputStyle,
                            borderColor:
                              formik.touched.inmobiliaria_id &&
                              formik.errors.inmobiliaria_id
                                ? "#e24c4c"
                                : "#ddd",
                          }}
                        />
                      </div>
                      <Button
                        type="button"
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
                        className="p-button-primary flex-grow-1"
                      />
                    </div>
                    {formik.touched.inmobiliaria_id &&
                      formik.errors.inmobiliaria_id && (
                        <small className="p-error">
                          {formik.errors.inmobiliaria_id}
                        </small>
                      )}
                  </div>

                  {/* Input Cantón */}
                  <div className="field" onClick={showDisabledMessage}>
                    <label>Cantón</label>
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
                      className={`w-full ${
                        formik.touched.canton_id && formik.errors.canton_id
                          ? "p-invalid"
                          : ""
                      }`}
                      disabled={!cliente || !inmobiliaria}
                    />
                    {formik.touched.canton_id && formik.errors.canton_id && (
                      <small className="p-error">
                        {formik.errors.canton_id}
                      </small>
                    )}
                  </div>

                  {/* Input Proyecto */}
                  <div className="flex flex-column gap-2">
                    <div className="flex align-items-center gap-3">
                      <div style={{ minWidth: "400px", cursor: "not-allowed" }}>
                        <InputText
                          value={proyecto?.nombre || ""}
                          placeholder="Proyecto"
                          disabled
                          className={`p-inputtext-sm w-full ${
                            formik.touched.proyecto_id &&
                            formik.errors.proyecto_id
                              ? "p-invalid"
                              : ""
                          }`}
                          style={{
                            ...blockedInputStyle,
                            borderColor:
                              formik.touched.proyecto_id &&
                              formik.errors.proyecto_id
                                ? "#e24c4c"
                                : "#ddd",
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        icon="pi pi-search"
                        label="Buscar Proyecto"
                        onClick={handleModalProyecto}
                        className="p-button-primary flex-grow-1"
                      />
                    </div>
                    {formik.touched.proyecto_id &&
                      formik.errors.proyecto_id && (
                        <small className="p-error">
                          {formik.errors.proyecto_id}
                        </small>
                      )}
                  </div>

                  {/* Input Nombre del Beneficiario */}
                  <div className="flex align-items-center gap-3">
                    <div style={{ minWidth: "400px" }}>
                      <InputText
                        id="nombre_beneficiario"
                        name="nombre_beneficiario"
                        value={formik.values.nombre_beneficiario}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nombre del beneficiario"
                        className={`p-inputtext-sm w-full ${
                          formik.touched.nombre_beneficiario &&
                          formik.errors.nombre_beneficiario
                            ? "p-invalid"
                            : ""
                        }`}
                      />
                      {formik.touched.nombre_beneficiario &&
                        formik.errors.nombre_beneficiario && (
                          <small className="p-error">
                            {formik.errors.nombre_beneficiario}
                          </small>
                        )}
                    </div>
                  </div>

                  {/* Input Cédula del Beneficiario */}
                  <div className="flex align-items-center gap-3">
                    <div style={{ minWidth: "400px" }}>
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
                        className={`p-inputtext-sm w-full ${
                          formik.touched.cedula_beneficiario &&
                          formik.errors.cedula_beneficiario
                            ? "p-invalid"
                            : ""
                        }`}
                        maxLength={10}
                      />
                      {formik.touched.cedula_beneficiario &&
                        formik.errors.cedula_beneficiario && (
                          <small className="p-error">
                            {formik.errors.cedula_beneficiario}
                          </small>
                        )}
                    </div>
                  </div>

                  {/* Input Fecha del trámite */}
                  <div className="flex align-items-center gap-3">
                    <div style={{ minWidth: "400px" }}>
                      <label htmlFor="fecha_asignacion">
                        Fecha del trámite
                      </label>
                      <Calendar
                        id="fecha_asignacion"
                        name="fecha_asignacion"
                        value={formik.values.fecha_asignacion}
                        onChange={(e) =>
                          formik.setFieldValue("fecha_asignacion", e.value)
                        }
                        onBlur={formik.handleBlur}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className={`w-full ${
                          formik.touched.fecha_asignacion &&
                          formik.errors.fecha_asignacion
                            ? "p-invalid"
                            : ""
                        }`}
                      />
                      {formik.touched.fecha_asignacion &&
                        formik.errors.fecha_asignacion && (
                          <small className="p-error">
                            {formik.errors.fecha_asignacion}
                          </small>
                        )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* TAB 2: LIQUIDACIÓN DE IMPUESTO */}
          <TabPanel
            header="Liquidación de impuesto"
            disabled={
              !formik.values.proyecto_id ||
              !formik.values.canton_id ||
              formik.values.fecha_asignacion === null
            }
          >
            <div className="flex flex-column align-items-center gap-4 p-4">
              <Card title="Liquidación de Impuestos" className="w-full md:w-5">
                {/* Campo: Revisión de título */}
                <div className="field">
                  <label>Fecha revisión título*</label>
                  <Calendar
                    name="fecha_revision_titulo"
                    value={formik.values.fecha_revision_titulo}
                    onChange={(e) =>
                      formik.setFieldValue("fecha_revision_titulo", e.value)
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_revision_titulo &&
                      formik.errors.fecha_revision_titulo
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_asignacion} // Fecha mínima = fecha_asignacion
                  />
                  {formik.touched.fecha_revision_titulo &&
                    formik.errors.fecha_revision_titulo && (
                      <small className="p-error">
                        {formik.errors.fecha_revision_titulo}
                      </small>
                    )}
                </div>

                {/* Campo: Envío para liquidar impuestos */}
                <div className="field">
                  <label>Envío para liquidar impuestos*</label>
                  <Calendar
                    name="envio_liquidar_impuestos"
                    value={formik.values.fecha_envio_liquidar_impuesto}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "fecha_envio_liquidar_impuesto",
                        e.value
                      )
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_envio_liquidar_impuesto &&
                      formik.errors.fecha_envio_liquidar_impuesto
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_revision_titulo} // Fecha mínima = revision_titulo
                    disabled={!formik.values.fecha_revision_titulo} // Deshabilitado si no hay fecha de revisión
                  />
                  {formik.touched.fecha_envio_liquidar_impuesto &&
                    formik.errors.fecha_envio_liquidar_impuesto && (
                      <small className="p-error">
                        {formik.errors.fecha_envio_liquidar_impuesto}
                      </small>
                    )}
                </div>

                <div className="field mt-4">
                  <label>Comentarios</label>
                  <InputTextarea
                    name="observaciones_liquidacion_impuesto"
                    value={
                      formik.values.observaciones_liquidacion_impuesto || ""
                    }
                    onChange={(e) => {
                      formik.setFieldValue(
                        "observaciones_liquidacion_impuesto",
                        e.target.value
                      );
                    }}
                    onBlur={formik.handleBlur}
                    rows={5} // Número de filas visibles
                    autoResize // Ajusta la altura automáticamente
                    className={`w-full ${
                      formik.touched.observaciones_liquidacion_impuesto &&
                      formik.errors.observaciones_liquidacion_impuesto
                        ? "p-invalid"
                        : ""
                    }`}
                    placeholder="Ingrese observaciones sobre la liquidación..."
                  />
                  {formik.touched.observaciones_liquidacion_impuesto &&
                    formik.errors.observaciones_liquidacion_impuesto && (
                      <small className="p-error">
                        {formik.errors.observaciones_liquidacion_impuesto}
                      </small>
                    )}
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* TAB 3: APROBACIÓN DE PROFORMA */}
          <TabPanel
            header="Aprobación de proforma"
            disabled={!formik.values.fecha_envio_liquidar_impuesto}
          >
            <div className="flex flex-column align-items-center gap-4 p-4">
              <Card title="Aprobación de Proforma" className="w-full md:w-5">
                <div
                  className="flex flex-column gap-5 w-full"
                  style={{ maxWidth: "650px" }}
                >
                  <div className="field">
                    <label>Envio de Aprobación de proforma*</label>
                    <Calendar
                      name="fecha_envio_aprobacion_proforma"
                      value={formik.values.fecha_envio_aprobacion_proforma}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "fecha_envio_aprobacion_proforma",
                          e.value
                        )
                      }
                      onBlur={formik.handleBlur}
                      dateFormat="dd/mm/yy"
                      showIcon
                      className={`w-full ${
                        formik.touched.fecha_envio_aprobacion_proforma &&
                        formik.errors.fecha_envio_aprobacion_proforma
                          ? "p-invalid"
                          : ""
                      }`}
                      minDate={formik.values.fecha_envio_liquidar_impuesto}
                    />
                    {formik.touched.fecha_envio_aprobacion_proforma &&
                      formik.errors.fecha_envio_aprobacion_proforma && (
                        <small className="p-error">
                          {formik.errors.fecha_envio_aprobacion_proforma}
                        </small>
                      )}
                  </div>

                  <div className="field">
                    <label>Fecha de Aprobación de proforma*</label>
                    <Calendar
                      name="fecha_aprobacion_proforma"
                      value={formik.values.fecha_aprobacion_proforma}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "fecha_aprobacion_proforma",
                          e.value
                        )
                      }
                      onBlur={formik.handleBlur}
                      dateFormat="dd/mm/yy"
                      showIcon
                      className={`w-full ${
                        formik.touched.fecha_aprobacion_proforma &&
                        formik.errors.fecha_aprobacion_proforma
                          ? "p-invalid"
                          : ""
                      }`}
                      disabled={
                        formik.values.fecha_envio_aprobacion_proforma == null
                      } // Deshabilitado si no hay fecha de envío de aprobación de proforma
                      minDate={formik.values.fecha_envio_aprobacion_proforma}
                    />
                    {formik.touched.fecha_aprobacion_proforma &&
                      formik.errors.fecha_aprobacion_proforma && (
                        <small className="p-error">
                          {formik.errors.fecha_aprobacion_proforma}
                        </small>
                      )}
                  </div>

                  <div className="field mt-4">
                    <label>Comentarios</label>
                    <InputTextarea
                      name="observaciones_proforma"
                      value={formik.values.observaciones_proforma || ""}
                      onChange={(e) => {
                        formik.setFieldValue(
                          "observaciones_proforma",
                          e.target.value
                        );
                      }}
                      onBlur={formik.handleBlur}
                      rows={5} // Número de filas visibles
                      autoResize // Ajusta la altura automáticamente
                      className={`w-full ${
                        formik.touched.observaciones_proforma &&
                        formik.errors.observaciones_proforma
                          ? "p-invalid"
                          : ""
                      }`}
                      placeholder="Ingrese observaciones sobre la proforma..."
                    />
                    {formik.touched.observaciones_proforma &&
                      formik.errors.observaciones_proforma && (
                        <small className="p-error">
                          {formik.errors.observaciones_proforma}
                        </small>
                      )}
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel
            header="En firma matriz"
            disabled={formik.values.fecha_aprobacion_proforma == null}
          >
            <div className="flex flex-column align-items-center gap-4 p-4">
              <Card title="Liquidación de Impuestos" className="w-full md:w-5">
                <div className="field">
                  <label>Fecha de firma de matriz cliente*</label>
                  <Calendar
                    name="fecha_firma_matriz_cliente"
                    value={formik.values.fecha_firma_matriz_cliente}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "fecha_firma_matriz_cliente",
                        e.value
                      )
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_firma_matriz_cliente &&
                      formik.errors.fecha_firma_matriz_cliente
                        ? "p-invalid"
                        : ""
                    }`}
                    disabled={
                      formik.values.fecha_retorno_matriz_firmada != null
                    } // Deshabilitado si hay fecha de retorno
                    minDate={formik.values.fecha_aprobacion_proforma}
                  />
                  {formik.touched.fecha_firma_matriz_cliente &&
                    formik.errors.fecha_firma_matriz_cliente && (
                      <small className="p-error">
                        {formik.errors.fecha_firma_matriz_cliente}
                      </small>
                    )}
                </div>

                <div className="field">
                  <label>Fecha de retorno de la matriz firmada*</label>
                  <Calendar
                    name="fecha_retorno_matriz_firmada"
                    value={formik.values.fecha_retorno_matriz_firmada}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "fecha_retorno_matriz_firmada",
                        e.value
                      )
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_retorno_matriz_firmada &&
                      formik.errors.fecha_retorno_matriz_firmada
                        ? "p-invalid"
                        : ""
                    }`}
                    disabled={formik.values.fecha_firma_matriz_cliente == null} // Deshabilitado si no hay fecha de firma
                    minDate={formik.values.fecha_firma_matriz_cliente} // Fecha mínima = fecha_firma_matriz_cliente
                  />
                  {formik.touched.fecha_retorno_matriz_firmada &&
                    formik.errors.fecha_retorno_matriz_firmada && (
                      <small className="p-error">
                        {formik.errors.fecha_retorno_matriz_firmada}
                      </small>
                    )}
                </div>

                <div className="field mt-4">
                  <label>Comentarios</label>
                  <InputTextarea
                    name="observaciones_matriz_firmada"
                    value={formik.values.observaciones_matriz_firmada || ""}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "observaciones_matriz_firmada",
                        e.target.value
                      );
                    }}
                    onBlur={formik.handleBlur}
                    rows={5} // Número de filas visibles
                    autoResize // Ajusta la altura automáticamente
                    className={`w-full ${
                      formik.touched.observaciones_matriz_firmada &&
                      formik.errors.observaciones_matriz_firmada
                        ? "p-invalid"
                        : ""
                    }`}
                    placeholder="Ingrese observaciones sobre la matriz firmada..."
                  />
                  {formik.touched.observaciones_matriz_firmada &&
                    formik.errors.observaciones_matriz_firmada && (
                      <small className="p-error">
                        {formik.errors.observaciones_matriz_firmada}
                      </small>
                    )}
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel
            header="En inscripción"
            disabled={!formik.values.fecha_retorno_matriz_firmada}
          >
            <div className="flex flex-column align-items-center gap-4 p-4">
              <Card title="En inscripción" className="w-full md:w-5">
                <div className="field">
                  <label>Fecha de ingreso al registro</label>
                  <Calendar
                    name="fecha_ingreso_registro"
                    value={formik.values.fecha_ingreso_registro}
                    onChange={(e) =>
                      formik.setFieldValue("fecha_ingreso_registro", e.value)
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_ingreso_registro &&
                      formik.errors.fecha_ingreso_registro
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_retorno_matriz_firmada} // Fecha mínima = fecha_retorno_matriz_firmada
                  />
                  {formik.touched.fecha_ingreso_registro &&
                    formik.errors.fecha_ingreso_registro && (
                      <small className="p-error">
                        {formik.errors.fecha_ingreso_registro}
                      </small>
                    )}
                </div>

                <div className="field">
                  <label>Fecha tentativa de inscripción</label>
                  <Calendar
                    name="fecha_tentativa_inscripcion"
                    value={formik.values.fecha_tentativa_inscripcion}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "fecha_tentativa_inscripcion",
                        e.value
                      )
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_tentativa_inscripcion &&
                      formik.errors.fecha_tentativa_inscripcion
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_ingreso_registro} // Fecha mínima = ingreso_registro
                    disabled={!formik.values.fecha_ingreso_registro} // Deshabilitado si no hay fecha de ingreso
                  />
                  {formik.touched.fecha_tentativa_inscripcion &&
                    formik.errors.fecha_tentativa_inscripcion && (
                      <small className="p-error">
                        {formik.errors.fecha_tentativa_inscripcion}
                      </small>
                    )}
                </div>

                <div className="field">
                  <label>Fecha de inscripción</label>
                  <Calendar
                    name="fecha_inscripcion"
                    value={formik.values.fecha_inscripcion}
                    onChange={(e) =>
                      formik.setFieldValue("fecha_inscripcion", e.value)
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_inscripcion &&
                      formik.errors.fecha_inscripcion
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_tentativa_inscripcion} // Fecha mínima = tentativa_inscripcion
                    disabled={!formik.values.fecha_tentativa_inscripcion} // Deshabilitado si no hay fecha de ingreso
                  />
                  {formik.touched.fecha_inscripcion &&
                    formik.errors.fecha_inscripcion && (
                      <small className="p-error">
                        {formik.errors.fecha_inscripcion}
                      </small>
                    )}
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel
            header="En catastro"
            disabled={!formik.values.fecha_inscripcion}
          >
            <div className="flex flex-column align-items-center gap-4 p-4">
              <Card title="En catastro" className="w-full md:w-5">
                <div className="field">
                  <label>Fecha de ingreso al catastro</label>
                  <Calendar
                    name="fecha_ingreso_catastro"
                    value={formik.values.fecha_ingreso_catastro}
                    onChange={(e) =>
                      formik.setFieldValue("fecha_ingreso_catastro", e.value)
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_ingreso_catastro &&
                      formik.errors.fecha_ingreso_catastro
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_inscripcion}
                  />
                  {formik.touched.fecha_ingreso_catastro &&
                    formik.errors.fecha_ingreso_catastro && (
                      <small className="p-error">
                        {formik.errors.fecha_ingreso_catastro}
                      </small>
                    )}
                </div>

                <div className="field">
                  <label>Fecha tentativa de catastro</label>
                  <Calendar
                    name="fecha_tentativa_catastro"
                    value={formik.values.fecha_tentativa_catastro}
                    onChange={(e) =>
                      formik.setFieldValue("fecha_tentativa_catastro", e.value)
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_tentativa_catastro &&
                      formik.errors.fecha_tentativa_catastro
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_ingreso_catastro} // Fecha mínima = ingreso_catastro
                    disabled={!formik.values.fecha_ingreso_catastro} // Deshabilitado si no hay fecha de ingreso
                  />
                  {formik.touched.fecha_tentativa_catastro &&
                    formik.errors.fecha_tentativa_catastro && (
                      <small className="p-error">
                        {formik.errors.fecha_tentativa_catastro}
                      </small>
                    )}
                </div>

                <div className="field">
                  <label>Fecha de catastro</label>
                  <Calendar
                    name="fecha_catastro"
                    value={formik.values.fecha_catastro}
                    onChange={(e) =>
                      formik.setFieldValue("fecha_catastro", e.value)
                    }
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className={`w-full ${
                      formik.touched.fecha_catastro &&
                      formik.errors.fecha_catastro
                        ? "p-invalid"
                        : ""
                    }`}
                    minDate={formik.values.fecha_tentativa_catastro} // Fecha mínima = tentativa_catastro
                    disabled={!formik.values.fecha_tentativa_catastro} // Deshabilitado si no hay fecha de ingreso
                  />
                  {formik.touched.fecha_catastro &&
                    formik.errors.fecha_catastro && (
                      <small className="p-error">
                        {formik.errors.fecha_catastro}
                      </small>
                    )}
                </div>

                <div className="field mt-4">
                  <label>Comentarios</label>
                  <InputTextarea
                    name="observaciones_catastro"
                    value={formik.values.observaciones_catastro || ""}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "observaciones_catastro",
                        e.target.value
                      );
                    }}
                    onBlur={formik.handleBlur}
                    rows={5} // Número de filas visibles
                    autoResize // Ajusta la altura automáticamente
                    className={`w-full ${
                      formik.touched.observaciones_catastro &&
                      formik.errors.observaciones_catastro
                        ? "p-invalid"
                        : ""
                    }`}
                    placeholder="Ingrese observaciones sobre la liquidación..."
                  />
                  {formik.touched.observaciones_catastro &&
                    formik.errors.observaciones_catastro && (
                      <small className="p-error">
                        {formik.errors.observaciones_catastro}
                      </small>
                    )}
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel header="Documentación">
            {/* Sección Catastro (mantienes lo que ya tienes) */}
            <div className="p-fluid">
              {!pdfCatastroId ? (
                <FileUpload
                  name="file"
                  accept="application/pdf"
                  maxFileSize={5 * 1024 * 1024}
                  mode="basic"
                  chooseLabel={
                    uploading ? "Subiendo..." : "Seleccionar PDF Catastro"
                  }
                  customUpload
                  auto
                  uploadHandler={(e) =>
                    handleUpload(e, {
                      is_catastro: true,
                      is_titulo: false,
                      is_factura: false,
                    })
                  }
                  disabled={uploading}
                />
              ) : (
                <div className="flex flex-row justify-content-between gap-3 mt-3">
                  <Button
                    type="button"
                    label="Ver PDF del catastro"
                    icon="pi pi-eye"
                    onClick={() => getPdfUrl(pdfCatastroId)}
                  />
                  <Button
                    type="button"
                    label="Eliminar PDF del catastro"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={() => handleDeletePdf(pdfCatastroId, "catastro")}
                  />
                </div>
              )}
            </div>

            {/* Sección Título (mantienes lo que ya tienes) */}
            <div className="p-fluid" style={{ marginTop: "2rem" }}>
              {!pdfTituloId ? (
                <FileUpload
                  name="file"
                  accept="application/pdf"
                  maxFileSize={5 * 1024 * 1024}
                  mode="basic"
                  chooseLabel={
                    uploading ? "Subiendo..." : "Seleccionar PDF Título"
                  }
                  customUpload
                  auto
                  uploadHandler={(e) =>
                    handleUpload(e, {
                      is_catastro: false,
                      is_titulo: true,
                      is_factura: false,
                    })
                  }
                  disabled={uploading}
                />
              ) : (
                <div className="flex flex-row justify-content-between gap-3 mt-3">
                  <Button
                    type="button"
                    label="Ver PDF del título"
                    icon="pi pi-eye"
                    onClick={() => getPdfUrl(pdfTituloId, "titulo")}
                  />
                  <Button
                    type="button"
                    label="Eliminar PDF del título"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={() => handleDeletePdf(pdfTituloId)}
                  />
                </div>
              )}
            </div>

            {/* Nueva sección para Facturas */}
            <div className="p-fluid" style={{ marginTop: "2rem" }}>
              <h4>Facturas</h4>

              {/* Botón para subir nueva factura */}
              <FileUpload
                name="file"
                accept="application/pdf"
                maxFileSize={5 * 1024 * 1024}
                mode="basic"
                chooseLabel={uploading ? "Subiendo..." : "Subir Nueva Factura"}
                customUpload
                auto
                uploadHandler={(e) =>
                  handleUpload(e, {
                    is_catastro: false,
                    is_titulo: false,
                    is_factura: true,
                  })
                }
                disabled={uploading}
              />

              {/* Lista de facturas subidas */}
              {pdfFacturasId.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  {pdfFacturasId.map((facturaId, index) => (
                    <div
                      key={facturaId}
                      className="flex flex-row justify-content-between gap-3 mt-3"
                    >
                      <Button
                        type="button"
                        label={`Ver Factura ${index + 1}`}
                        icon="pi pi-eye"
                        onClick={() => getPdfUrl(facturaId)}
                      />
                      <Button
                        type="button"
                        label="Eliminar Factura"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={() => handleDeletePdf(facturaId, "factura")}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabPanel>
        </TabView>

        {/* Botones de acción fuera de los tabs pero dentro del form */}
        <div className="flex justify-content-between gap-3 p-4">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            type="button"
            className="p-button-danger"
            onClick={() => window.history.back()}
          />
          <Button
            label="Guardar Todo"
            icon="pi pi-check"
            type="submit"
            className="p-button-success"
            loading={formik.isSubmitting}
          />
        </div>
      </form>

      {/* Modales (fuera del formulario) */}
      <ClienteModal
        visible={modalVisible}
        setCliente={handleSetCliente}
        onHide={() => setModalVisible(false)}
      />
      <InmobiliariaModal
        visible={modalInmobiliariaVisible}
        setInmobiliaria={handleSetInmobiliaria}
        onHide={() => setModalInmobiliariaVisible(false)}
        cliente_id={cliente?.id}
      />
      <ProyectoModal
        visible={modalProyectoVisible}
        setProyecto={handleSetProyecto}
        onHide={() => setModalProyectoVisible(false)}
        canton_id={formik.values.canton_id}
      />
    </div>
  );
};

export default EditarTramites;

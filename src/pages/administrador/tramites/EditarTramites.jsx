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
import { Checkbox } from "primereact/checkbox";
import { FileUpload } from "primereact/fileupload";
import PdfService from "../../../services/PdfService";
import Swal from "sweetalert2";

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
        formik.setValues({
          cliente_id: tramite.cliente_id,
          inmobiliaria_id: tramite.inmobiliaria_id,
          proyecto_id: tramite.proyecto_id,
          canton_id: tramite.canton_id,
          nombre_beneficiario: tramite.nombre_beneficiario || "",
          cedula_beneficiario: tramite.cedula_beneficiario,
          fecha_asignacion: fechaAsignacion,
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
              </Card>
            </div>
          </TabPanel>

          {/* TAB 3: APROBACIÓN DE PROFORMA */}
          <TabPanel
            header="Aprobación de proforma"
            disabled={!formik.values.liquidacion_valor}
          >
            <div className="p-4">
              <Card title="Aprobación de Proforma" className="w-full md:w-5">
                <div
                  className="flex flex-column gap-5 w-full"
                  style={{ maxWidth: "650px" }}
                >
                  <div className="field">
                    <Checkbox
                      inputId="proforma_aprobada"
                      name="proforma_aprobada"
                      checked={formik.values.proforma_aprobada}
                      onChange={formik.handleChange}
                      className={`mr-2 ${
                        formik.touched.proforma_aprobada &&
                        formik.errors.proforma_aprobada
                          ? "p-invalid"
                          : ""
                      }`}
                    />
                    <label htmlFor="proforma_aprobada" className="ml-2">
                      Proforma aprobada*
                    </label>
                    {formik.touched.proforma_aprobada &&
                      formik.errors.proforma_aprobada && (
                        <small className="p-error block">
                          {formik.errors.proforma_aprobada}
                        </small>
                      )}
                  </div>

                  <div className="field">
                    <label>Fecha de aprobación</label>
                    <Calendar
                      name="proforma_fecha"
                      value={formik.values.proforma_fecha}
                      onChange={(e) =>
                        formik.setFieldValue("proforma_fecha", e.value)
                      }
                      onBlur={formik.handleBlur}
                      dateFormat="dd/mm/yy"
                      showIcon
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* Resto de tabs (puedes añadir más campos según necesites) */}
          <TabPanel header="En firma matriz">
            <div className="p-4">
              <Card title="Firma Matriz" className="w-full md:w-5">
                <div className="field">
                  <Checkbox
                    inputId="firma_matriz"
                    name="firma_matriz"
                    checked={formik.values.firma_matriz}
                    onChange={formik.handleChange}
                  />
                  <label htmlFor="firma_matriz" className="ml-2">
                    Documentos firmados
                  </label>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel header="En inscripción">
            {/* Contenido del tab... */}
          </TabPanel>

          <TabPanel header="En catastro">{/* Contenido del tab... */}</TabPanel>

          <TabPanel header="Finalizado">{/* Contenido del tab... */}</TabPanel>

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
                    onClick={() => getPdfUrl(pdfTituloId,"titulo")}
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
                        onClick={() => handleDeletePdf(facturaId,"factura")}
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

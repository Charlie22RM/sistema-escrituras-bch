import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import TramiteService from "../../../services/TramiteService";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { clearLogout } from "../../../redux/authSlice";
import "../administrador.css";
import InformeService from "../../../services/InformeService";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClienteModal from "../../../modals/ClienteModal";
import InmobiliariaModal from "../../../modals/InmobiliariaModal";
import CantonService from "../../../services/CantonService";
import ProyectoModal from "../../../modals/ProyectoModal";

const ConsultarTramites = () => {
  const [tramites, setTramites] = useState([]);
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState(""); // Se ejecuta la búsqueda con este valor
  const [searchInput, setSearchInput] = useState(""); // Input controlado por el usuario

  const tramiteService = TramiteService();
  const informeService = InformeService();
  const cantonService = CantonService();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [inmobiliaria, setInmobiliaria] = useState(null);
  const [proyecto, setProyecto] = useState(null);
  const [cantones, setCantones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInmobiliariaVisible, setModalInmobiliariaVisible] =
    useState(false);
  const [modalProyectoVisible, setModalProyectoVisible] = useState(false);

  const formik = useFormik({
    initialValues: {
      cliente_id: null,
      inmobiliaria_id: null,
      proyecto_id: null,
      canton_id: null,
    },
  });

  const estadoTramiteTemplate = (rowData) => {
    return (
      <Tag value={rowData.estado} severity={getSeverity(rowData.estado)} />
    );
  };
  const getSeverity = (estado) => {
    switch (estado) {
      case "INICIADO":
        return "info";
      case "LIQUIDACION_IMPUESTO":
      case "APROBACION_PROFORMA":
      case "LIQUIDACION_APROBADA":
      case "FIRMA_MATRIZ":
      case "INSCRIPCION":
      case "CATASTRO":
        return "warning";
      case "FINALIZADO":
        return "success";
      default:
        return null;
    }
  };

  const toast = useRef(null);

  const loadTramites = async (qs = "", page = null, row = null) => {
    setLoading(true);
    try {
      const response = await tramiteService.getTramites(
        `?page=${page || lazyState.page}&limit=${row || lazyState.rows}${qs}`
      );
      
      setTramites(response.data.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error && error.statusCode === 401) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Su sesión ha expirado, inicie sesión de nuevo.",
        life: 5000,
      });
      setTimeout(() => {
        dispatch(clearLogout());
        navigate("/");
      }, 5000);
    } else {
      console.error("Error al cargar los trámites:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar los trámites.",
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

  const handleModalHide = () => setModalVisible(false);

  const handleSetCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    formik.setFieldValue("cliente_id", clienteSeleccionado.id);
  };

  const handleSetProyecto = (proyectoSeleccionado) => {
    setProyecto(proyectoSeleccionado);
    formik.setFieldValue("proyecto_id", proyectoSeleccionado.id);
  };

  const handleSetInmobiliaria = (inmobiliariaSeleccionada) => {
    setInmobiliaria(inmobiliariaSeleccionada);
    formik.setFieldValue("inmobiliaria_id", inmobiliariaSeleccionada.id);
    //formik.setFieldTouched("inmobiliaria_id", true); // <-- Añade esta línea
    // Limpiar campos dependientes si cambia la inmobiliaria
    formik.setFieldValue("proyecto_id", null);
    setProyecto(null);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        let qs = search ? `&search=${search}` : "";
        if (proyecto) {
          qs += `&proyectoId=${proyecto}`;
        }
        if (inmobiliaria) {
          qs += `&inmobiliariaId=${inmobiliaria}`;
        }
        if (cliente) {
          qs += `&clienteId=${cliente}`;
        }
        if (formik.values.canton_id) {
          qs += `&cantonId=${formik.values.canton_id}`;
        }
        await loadTramites(qs);
      } catch (error) {
        handleError(error);
      }
    };
    fetchData();
  }, [lazyState.page, lazyState.rows, search]);

  const onPageChange = (event) => {
    setLazyState({
      ...lazyState,
      first: event.first,
      rows: event.rows,
      page: event.page + 1,
    });
  };

  const handleSearchClick = () => {
    setSearch(searchInput);
    setLazyState({
      ...lazyState,
      first: 0,
      page: 1,
    });
  };

  const handleClick = async () => {
    if (lazyState.first !== 0 && lazyState.page !== 1) {
      setLazyState({
        ...lazyState,
        first: 0,
        page: 1,
      });
      return;
    }

    try {
      let qs = search ? `&search=${search}` : "";
      if (proyecto) {
        qs += `&proyectoId=${proyecto.id}`;
      }
      if (inmobiliaria) {
        qs += `&inmobiliariaId=${inmobiliaria.id}`;
      }
      if (cliente) {
        qs += `&clienteId=${cliente.id}`;
      }
      if (formik.values.canton_id) {
        qs += `&cantonId=${formik.values.canton_id}`;
      }
      await loadTramites(qs, 0, 1);
    } catch (error) {
      handleError(error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/administrador/editar-tramite/${id}`);
  };

  const handleDelete = (id) => {
    // Verificar si ya hay un diálogo abierto
    if (document.querySelector(".custom-dialog")) return;

    // Crear elemento de diálogo personalizado
    const dialog = document.createElement("div");
    dialog.className = "custom-dialog";

    dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-container">
      <div class="dialog-header">
        <i class="dialog-icon pi pi-exclamation-triangle"></i>
        <h3>Confirmar eliminación</h3>
      </div>
      <div class="dialog-content">
        <p>¿Estás seguro de que deseas eliminar este trámite?</p>
      </div>
      <div class="dialog-footer">
        <button class="dialog-btn cancel-btn">Cancelar</button>
        <button class="dialog-btn confirm-btn">Sí, eliminar</button>
      </div>
    </div>
  `;

    // Agregar el diálogo al DOM
    document.body.appendChild(dialog);

    // Manejar clic en confirmar
    dialog.querySelector(".confirm-btn").addEventListener("click", async () => {
      try {
        await tramiteService.deleteTramite(id);
        setTramites((prev) => prev.filter((cliente) => cliente.id !== id));

        // Mostrar notificación de éxito
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Trámite eliminado correctamente",
          life: 3000,
        });
      } catch (error) {
        handleError(error);
        console.error("Error al eliminar el trámite:", error);
      } finally {
        // Cerrar el diálogo
        dialog.remove();
      }
    });

    // Manejar clic en cancelar
    dialog.querySelector(".cancel-btn").addEventListener("click", () => {
      dialog.remove();
    });

    // Cerrar al hacer clic fuera del contenedor del diálogo
    dialog.querySelector(".dialog-overlay").addEventListener("click", () => {
      dialog.remove();
    });
  };

  useEffect(() => {
    //setLoading(true);
    const fetchData = async () => {
      await getTags();
      //setLoading(false);
    };
    fetchData();
  }, []);

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
  const donwloadExcel = async () => {
    try {
      const response = await informeService.getInformeTramite();
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tramites.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      handleError(error);
    }
  };
  return (
    <div className="consultar-container">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="consultar-header">
        <h2 className="consultar-title">Trámites</h2>

        <div className="consultar-actions">
          <div className="search-wrapper">
            <div className="search-group">
              <InputText
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchClick();
                  }
                }}
                placeholder="Buscar trámite"
                className="search-input"
              />
              <Button
                icon="pi pi-search"
                className="search-button"
                onClick={handleSearchClick}
              />
              {searchInput && (
                <Button
                  icon="pi pi-times"
                  className="clear-button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setLazyState({
                      ...lazyState,
                      first: 0,
                      page: 1,
                    });
                  }}
                />
              )}
            </div>
          </div>

          <Button onClick={donwloadExcel} className="add-button">
            <i className="pi pi-file-excel" />
            Descargar Excel
          </Button>

          <Button
            label="Agregar Trámite"
            className="add-button"
            onClick={() => navigate("/administrador/crear-tramite")}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <ProgressSpinner />
        </div>
      ) : (
        <>
          <Card title="Filtros">
            <div className="tramite-form-group">
              <div className="tramite-input-group">
                <InputText
                  value={cliente?.nombre || ""}
                  placeholder="Cliente"
                  disabled
                  className={`tramite-input ${
                    formik.touched.cliente_id && formik.errors.cliente_id
                      ? "p-invalid"
                      : ""
                  }`}
                />
                <Button
                  icon="pi pi-search"
                  label="Buscar Cliente"
                  onClick={() => setModalVisible(true)}
                  className="tramite-button tramite-search-button"
                />
              </div>
              {formik.touched.cliente_id && formik.errors.cliente_id && (
                <small className="tramite-error">
                  {formik.errors.cliente_id}
                </small>
              )}
            </div>

            {/* Input Inmobiliaria */}
            <div className="tramite-form-group">
              <div className="tramite-input-group">
                <InputText
                  value={inmobiliaria?.nombre || ""}
                  placeholder="Inmobiliaria"
                  disabled
                  className={`tramite-input ${
                    formik.touched.inmobiliaria_id &&
                    formik.errors.inmobiliaria_id
                      ? "p-invalid"
                      : ""
                  }`}
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
              {formik.touched.inmobiliaria_id &&
                formik.errors.inmobiliaria_id && (
                  <small className="tramite-error">
                    {formik.errors.inmobiliaria_id}
                  </small>
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
                className={`tramite-dropdown ${
                  formik.touched.canton_id && formik.errors.canton_id
                    ? "p-invalid"
                    : ""
                }`}
                disabled={!cliente || !inmobiliaria}
              />
              {formik.touched.canton_id && formik.errors.canton_id && (
                <small className="tramite-error">
                  {formik.errors.canton_id}
                </small>
              )}
            </div>

            {/* Input Proyecto */}
            <div className="tramite-form-group">
              <div className="tramite-input-group">
                <InputText
                  value={proyecto?.nombre || ""}
                  placeholder="Proyecto"
                  disabled
                  className={`tramite-input ${
                    formik.touched.proyecto_id && formik.errors.proyecto_id
                      ? "p-invalid"
                      : ""
                  }`}
                />
                <Button
                  icon="pi pi-search"
                  label="Buscar Proyecto"
                  onClick={handleModalProyecto}
                  className="tramite-button tramite-search-button"
                />
              </div>
              {formik.touched.proyecto_id && formik.errors.proyecto_id && (
                <small className="tramite-error">
                  {formik.errors.proyecto_id}
                </small>
              )}
            </div>

            <Button type="button" onClick={handleClick}>
              Buscar trámite
            </Button>
          </Card>
          <div className="table-container">
            <DataTable
              value={tramites}
              lazy
              paginator
              scrollable
              scrollDirection="horizontal"
              first={lazyState.first}
              rows={lazyState.rows}
              totalRecords={totalRecords}
              onPage={onPageChange}
              loading={loading}
              rowsPerPageOptions={[5, 10, 20, 30]}
              className="consultar-table"
              emptyMessage="No se encontraron trámites"
            >
              <Column
                style={{ minWidth: "120px" }}
                field="cedula_beneficiario"
                header="Cédula del Beneficiario"
              />
              <Column
                style={{ minWidth: "120px" }}
                field="nombre_beneficiario"
                header="Nombre del Beneficiario"
              />
              <Column
                style={{ minWidth: "100px" }}
                field="canton.nombre"
                header="Cantón"
              />
              <Column
                style={{ minWidth: "120px" }}
                field="fecha_asignacion"
                header="Fecha de Asignación"
                body={
                  (rowData) =>
                    rowData.fecha_asignacion
                      ? new Date(rowData.fecha_asignacion).toLocaleDateString(
                          "es-EC",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "120px" }}
                field="fecha_revision_titulo"
                header="Revisión de Título"
                body={
                  (rowData) =>
                    rowData.fecha_revision_titulo
                      ? new Date(
                          rowData.fecha_revision_titulo
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "150px" }}
                field="fecha_envio_liquidar_impuesto"
                header="Envío a Liquidar Impuestos"
                body={
                  (rowData) =>
                    rowData.fecha_envio_liquidar_impuesto
                      ? new Date(
                          rowData.fecha_envio_liquidar_impuesto
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "150px" }}
                field="observaciones_liquidacion_impuesto"
                header="Observaciones"
              />
              <Column
                style={{ minWidth: "180px" }}
                field="fecha_envio_aprobacion_proforma"
                header="Envío de Aprobación de Proforma"
                body={
                  (rowData) =>
                    rowData.fecha_envio_aprobacion_proforma
                      ? new Date(
                          rowData.fecha_envio_aprobacion_proforma
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "180px" }}
                field="fecha_aprobacion_proforma"
                header="Fecha de Aprobación de Proforma"
                body={
                  (rowData) =>
                    rowData.fecha_envio_aprobacion_proforma
                      ? new Date(
                          rowData.fecha_envio_aprobacion_proforma
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "150px" }}
                field="observaciones_proforma"
                header="Observaciones"
              />
              <Column
                style={{ minWidth: "150px" }}
                field="fecha_firma_matriz_cliente"
                header="Fecha de Firma Matriz Cliente"
                body={
                  (rowData) =>
                    rowData.fecha_firma_matriz_cliente
                      ? new Date(
                          rowData.fecha_firma_matriz_cliente
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "160px" }}
                field="fecha_retorno_matriz_firmada"
                header="Fecha de Retorno de la Matriz Firmada"
                body={
                  (rowData) =>
                    rowData.fecha_retorno_matriz_firmada
                      ? new Date(
                          rowData.fecha_retorno_matriz_firmada
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "150px" }}
                field="observaciones_matriz_firmada"
                header="Observaciones"
              />

              <Column
                style={{ minWidth: "150px" }}
                field="fecha_ingreso_registro"
                header="Fecha de Ingreso al Registro"
                body={
                  (rowData) =>
                    rowData.fecha_ingreso_registro
                      ? new Date(
                          rowData.fecha_ingreso_registro
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "140px" }}
                field="fecha_tentativa_inscripcion"
                header="Fecha Tentativa de Inscripción"
                body={
                  (rowData) =>
                    rowData.fecha_tentativa_inscripcion
                      ? new Date(
                          rowData.fecha_tentativa_inscripcion
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "120px" }}
                field="fecha_inscripcion"
                header="Fecha de Inscripción"
                body={
                  (rowData) =>
                    rowData.fecha_inscripcion
                      ? new Date(rowData.fecha_inscripcion).toLocaleDateString(
                          "es-EC",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "150px" }}
                field="fecha_ingreso_catastro"
                header="Fecha de Ingreso al Catastro"
                body={
                  (rowData) =>
                    rowData.fecha_ingreso_catastro
                      ? new Date(
                          rowData.fecha_ingreso_catastro
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "140px" }}
                field="fecha_tentativa_catastro"
                header="Fecha Tentativa de Catastro"
                body={
                  (rowData) =>
                    rowData.fecha_tentativa_catastro
                      ? new Date(
                          rowData.fecha_tentativa_catastro
                        ).toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "120px" }}
                field="fecha_catastro"
                header="Fecha de Catastro"
                body={
                  (rowData) =>
                    rowData.fecha_catastro
                      ? new Date(rowData.fecha_catastro).toLocaleDateString(
                          "es-EC",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )
                      : "" // o puedes poner 'Sin revisar' u otro texto
                }
              />
              <Column
                style={{ minWidth: "150px" }}
                field="observaciones_catastro"
                header="Observaciones"
                columnClassName="col-cedula"
              />
              <Column
                field="estado"
                header="Estado"
                body={estadoTramiteTemplate}
                frozen
                alignFrozen="right"
              />
              <Column
                frozen
                alignFrozen="right"
                body={(rowData) => (
                  <div className="actions-cell">
                    <Button
                      icon="pi pi-pencil"
                      rounded
                      text
                      className="edit-button"
                      onClick={() => handleEdit(rowData.id)}
                    />
                    <Button
                      icon="pi pi-trash"
                      rounded
                      text
                      className="delete-button"
                      onClick={() => handleDelete(rowData.id)}
                    />
                  </div>
                )}
                header="Acciones"
              />
            </DataTable>
          </div>

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
        </>
      )}
    </div>
  );
};

export default ConsultarTramites;

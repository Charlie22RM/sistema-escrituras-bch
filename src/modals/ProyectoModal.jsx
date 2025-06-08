import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import ProyectoService from "../services/ProyectoService";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "./modals.css";

const ProyectoModal = ({ visible, onHide, setProyecto, canton_id, inmobiliaria_id }) => {
  const [proyectos, setProyectos] = useState([]);
  const toast = useRef(null);
  const proyectoService = ProyectoService();
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 1,
    searchTerm: "",
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [inputSearch, setInputSearch] = useState("");

  const getProyectos = async (qs = "") => {
    try {
      const response = await proyectoService.find(
        `?page=${lazyState.page}&limit=${lazyState.rows}${qs}`
      );
      console.log("response proyectos", response);
      setProyectos(response.data.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      handleError(error);
    }
  };
  const handleClose = () => {
    setLazyState({
      ...lazyState,
      first: 0,
      rows: 10,
      page: 1,
      searchTerm: "",
    });
    setInputSearch("");
    onHide();
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
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
      console.error("Error al cargar los proyectos:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar los proyectos.",
        life: 5000,
      });
    }
  };

  const handleSearch = () => {
    // Actualiza TODO en un solo estado (evita múltiples renders)
    setLazyState((prev) => ({
      ...prev,
      first: 0,
      page: 1,
      searchTerm: inputSearch, // Agrega searchTerm a lazyState
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let qs = "";
        if (canton_id && canton_id !== "0") {
          qs = `&cantonId=${canton_id}`;
        }
        // Filtro por inmobiliaria (si está seleccionada)
        if (inmobiliaria_id && inmobiliaria_id !== "0") {
          qs += `&inmobiliariaId=${inmobiliaria_id}`;
        }
        if (lazyState.searchTerm) {
          qs += `&search=${lazyState.searchTerm}`;
        }
        await getProyectos(qs);
      } catch (error) {
        console.error("Error al cargar los proyectos:", error);
      }
    };
    // Solo ejecuta la búsqueda si hay cantón e inmobiliaria seleccionados
    if (canton_id && inmobiliaria_id) {
      fetchData();
    }
  }, [canton_id, inmobiliaria_id, lazyState.page, lazyState.rows, lazyState.searchTerm]);

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header="Proyectos"
        visible={visible}
        onHide={handleClose}
        className="p-fluid min-w-min"
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "80vw", minWidth: "800px" }}
      >


        <div className="search-wrapper">
          <div className="search-group">
            <InputText
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Buscar proyecto"
              className="search-input"
            />
            <Button
              icon="pi pi-search"
              className="search-button"
              onClick={handleSearch}
            />
            {inputSearch && (
              <Button
                icon="pi pi-times"
                className="clear-button"
                onClick={() => {
                  setInputSearch("");
                  setLazyState((prev) => ({
                    ...prev,
                    first: 0,
                    page: 1,
                    searchTerm: "", // 👈 Aquí se limpia el filtro
                  }));
                }}
              />

            )}
          </div>
        </div>


        <DataTable
          value={proyectos}
          paginator
          rows={lazyState.rows}
          totalRecords={totalRecords}
          lazy
          first={lazyState.first}
          onPage={(e) => {
            setLazyState((prev) => ({
              ...prev,
              first: e.first,
              rows: e.rows,
              page: e.page + 1,
            }));
          }}
          emptyMessage="No hay proyectos disponibles en este cantón."
          className="table-container"
        >
          <Column field="nombre" header="Nombre" />
          <Column field="etapa" header="Etapa" />

          <Column field="canton.nombre" header="Cantón" />
          <Column
            header="Acciones"
            body={(rowData) => (
              <Button
                label="Seleccionar"
                icon="pi pi-check"
                className="tramite-button tramite-submit"
                style={{ width: "150px" }}
                onClick={() => {
                  setProyecto(rowData);
                  handleClose();
                }}
              />
            )}
          />
        </DataTable>
      </Dialog>
    </>
  );
};

export default ProyectoModal;

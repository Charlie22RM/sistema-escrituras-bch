import React, { useState, useEffect, useRef } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import ClienteService from "../services/ClienteService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearLogout } from "../redux/authSlice";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const ClienteModal = ({ visible, onHide,setCliente }) => {
  const [clientes, setClientes] = useState([]);
  const clienteService = ClienteService();
  const toast = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 1,
    searchTerm: "",
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [inputSearch, setInputSearch] = useState("");

  const loadClientes = async (qs = "") => {
    try {
      const response = await clienteService.getAllWithFilters(
        `?page=${lazyState.page}&limit=${lazyState.rows}${qs}`
      );
      console.log("response clientes", response);
      setClientes(response.data.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      handleError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      //setLoading(true);
      try {
        await loadClientes();
        //setLoading(false);
      } catch (error) {
        //setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onPageChange = (event) => {
    setLazyState({
      ...lazyState,
      first: event.first,
      rows: event.rows,
      page: event.page + 1, // PrimeReact indexa desde 0, pero tu API parece usar 1-indexed
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      //setLoading(true);
      try {
        const qs = lazyState.searchTerm
          ? `&search=${lazyState.searchTerm}`
          : "";
        await loadClientes(qs);
        //setLoading(false);
      } catch (error) {
        //setLoading(false);
      }
    };
    fetchData();
  }, [lazyState.page, lazyState.rows, lazyState.searchTerm]);

  const handleSearch = () => {
    // Actualiza TODO en un solo estado (evita múltiples renders)
    setLazyState((prev) => ({
      ...prev,
      first: 0,
      page: 1,
      searchTerm: inputSearch, // Agrega searchTerm a lazyState
    }));
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
      console.error("Error al cargar los clientes:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar los clientes.",
        life: 5000,
      });
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
  }

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header="Cliente"
        visible={visible}
        onHide={handleClose}
        className="p-fluid min-w-min"
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "80vw", minWidth: "800px" }}
      >
        <div className="flex justify-content-center align-items-center mb-4">
          <div className="flex align-items-center" style={{ gap: "10px" }}>
            <InputText
              placeholder="Buscar Usuario"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="p-inputtext-sm"
              style={{ width: "300px" }}
            />

            <Button
              size="small"
              className="p-button-success"
              label="Buscar"
              style={{ width: "100px" }}
              onClick={handleSearch}
            />
          </div>
        </div>

        <DataTable
          value={clientes}
          paginator
          rows={lazyState.rows}
          totalRecords={totalRecords}
          lazy
          first={lazyState.first}
          onPage={onPageChange}
          className="p-datatable-customers"
        >
          <Column field="nombre" header="Nombre" />
          <Column field="telefono" header="Teléfono" />
          <Column field="email" header="Correo Electrónico" />
          <Column field="direccion" header="Dirección" />
          <Column 
            header="Acciones"
            body={(rowData) => (
              <Button
                label="Seleccionar"
                icon="pi pi-check"
                className="p-button-sm p-button-success"
                style={{ width: "150px" }}
                onClick={() => {
                  // Aquí puedes manejar la acción de seleccionar el cliente
                  console.log("Cliente seleccionado:", rowData);
                  setCliente(rowData); // Asigna el cliente seleccionado al estado
                  handleClose(); // Cierra el modal
                }}
              />
            )}
          />
        </DataTable>
      </Dialog>
    </>
  );
};

export default ClienteModal;

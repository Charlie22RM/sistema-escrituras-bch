import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { BlockUI } from "primereact/blockui";
import { ProgressSpinner } from "primereact/progressspinner";
import "../../../App.css";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import UserService from "../../../services/UsuarioService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearLogout } from "../../../redux/authSlice";
import { Column } from "primereact/column";
import "../administrador.css";

const ConsultarUsuarios = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const userService = UserService();
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

  const getClientes = async (qs = "") => {
    try {
      const response = await userService.getUsuarios(
        `?page=${lazyState.page}&limit=${lazyState.rows}${qs}`
      );
      //console.log(response);
      setUsuarios(response.data.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (error.response.data.statusCode === 401) {
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
        detail: "No se pudo cargar los clientes.",
        life: 5000,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getClientes();
        setLoading(false);
      } catch (error) {
        setLoading(false);
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
      setLoading(true);
      try {
        const qs = lazyState.searchTerm
          ? `&search=${lazyState.searchTerm}`
          : "";
        await getClientes(qs);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, [lazyState.page, lazyState.rows, lazyState.searchTerm]); // ¡Depende de realSearch, no de inputSearch!

  const handleSearch = () => {
    // Actualiza TODO en un solo estado (evita múltiples renders)
    setLazyState((prev) => ({
      ...prev,
      first: 0,
      page: 1,
      searchTerm: inputSearch, // Agrega searchTerm a lazyState
    }));
  };

  const handleEdit = (id) => {
    navigate(`/administrador/editar-usuario/${id}`);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "¿Está seguro de que desea eliminar este usuario?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      accept: async () => {
        try {
          setLoading(true);
          await userService.deleteValue(id);
          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Usuario eliminado correctamente.",
            life: 3000,
          });
          setLazyState((prev) => ({
            ...prev,
            first: 0,
            page: 1,
          }));
          await getClientes();
          setLoading(false);
        } catch (error) {
          handleError(error);
          setLoading(false);
        }
      },
    });
  };
  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <BlockUI blocked={loading} template={<ProgressSpinner />}>
        <h2 className="section-title">Usuarios</h2>

        <div className="search-container">

            <div className="p-inputgroup custom-inputgroup">
              <InputText
                placeholder="Buscar Usuario"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
              />
              <Button
                icon="pi pi-search"
                className="p-button-secondary"
                onClick={handleSearch}
              />
            </div>


          <Button
            label="Agregar usuario"
            icon="pi pi-plus"
            className="p-button-sm p-button-success create-btn"
            onClick={() => navigate("/administrador/crear-usuario")}
          />
        </div>

        <DataTable
          value={usuarios}
          showGridlines
          lazy
          paginator
          first={lazyState.first}
          rows={lazyState.rows}
          totalRecords={totalRecords}
          onPage={onPageChange}
          className="p-datatable-striped"
        >
          <Column field="email" header="Email" />
          <Column field="nombre" header="Nombre" />
          <Column field="rol.nombre" header="Rol" />
          <Column
            body={(rowData) => (
              <div>
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  className="custom-edit-btn"
                  onClick={() => handleEdit(rowData.id)}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  className="custom-delete-btn"
                  onClick={() => handleDelete(rowData.id)}
                />
              </div>
            )}
            header="Acciones"
          />
        </DataTable>
      </BlockUI>
    </div>
  );
};

export default ConsultarUsuarios;

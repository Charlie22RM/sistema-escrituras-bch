import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";

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
  // Evitar abrir múltiples diálogos
  if (document.querySelector('.custom-dialog')) return;

  // Crear diálogo personalizado
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog';

  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-container">
      <div class="dialog-header">
        <i class="dialog-icon pi pi-exclamation-triangle"></i>
        <h3>Confirmación</h3>
      </div>
      <div class="dialog-content">
        <p>¿Está seguro de que desea eliminar este usuario?</p>
      </div>
      <div class="dialog-footer">
        <button class="dialog-btn cancel-btn">Cancelar</button>
        <button class="dialog-btn confirm-btn p-button-danger">Sí, eliminar</button>
      </div>
    </div>
  `;

  // Agregar al DOM
  document.body.appendChild(dialog);

  // Confirmar eliminación
  dialog.querySelector('.confirm-btn').addEventListener('click', async () => {
    try {
      setLoading(true);
      await userService.deleteValue(id);

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario eliminado correctamente.',
        life: 3000,
      });

      setLazyState(prev => ({
        ...prev,
        first: 0,
        page: 1,
      }));

      await getClientes();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      dialog.remove();
    }
  });

  // Cancelar eliminación
  dialog.querySelector('.cancel-btn').addEventListener('click', () => {
    dialog.remove();
  });

  // Cerrar al hacer clic fuera del diálogo
  dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
    dialog.remove();
  });
};

  return (
    <div className="consultar-container">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="consultar-header">
        <h2 className="consultar-title">Usuarios</h2>

        <div className="consultar-actions">
          <div className="search-wrapper">
            <div className="search-group">
              <InputText
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Buscar usuario"
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
                    setInputSearch('');
                    setLazyState((prev) => ({
                      ...prev,
                      searchTerm: '',
                      page: 1,
                      first: 0,
                    }));
                  }}
                />
              )}
            </div>
          </div>

          <Button
            label="Agregar Usuario"
            className="add-button"
            onClick={() => navigate('/administrador/crear-usuario')}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="table-container">
          <DataTable
            value={usuarios}
            showGridlines
            lazy
            paginator
            first={lazyState.first}
            rows={lazyState.rows}
            totalRecords={totalRecords}
            onPage={onPageChange}
            loading={loading}
            rowsPerPageOptions={[5, 10, 20, 30]}
            className="consultar-table"
            emptyMessage="No se encontraron usuarios"
          >
            <Column field="email" header="Correo Electrónico" />
            <Column field="nombre" header="Nombre" />
            <Column field="rol.nombre" header="Rol" />
            <Column
              header="Acciones"
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
            />
          </DataTable>
        </div>
      )}
    </div>
  );
};

export default ConsultarUsuarios;

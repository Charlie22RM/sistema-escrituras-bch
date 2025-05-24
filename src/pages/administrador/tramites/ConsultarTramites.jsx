import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import TramiteService from '../../../services/TramiteService';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { clearLogout } from '../../../redux/authSlice';
import '../administrador.css';

const ConsultarTramites = () => {
  const [tramites, setTramites] = useState([]);
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 1
  });
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState(''); // Se ejecuta la búsqueda con este valor
  const [searchInput, setSearchInput] = useState(''); // Input controlado por el usuario

  const tramiteService = TramiteService();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  const loadTramites = async (page, limit, searchQuery = '') => {
    setLoading(true);
    try {
      let response;
      if (searchQuery) {
        response = await tramiteService.searchTramites(searchQuery, page, limit);
      } else {
        response = await tramiteService.getTramites(page, limit);
      }
      setTramites(response.data);
      setTotalRecords(response.total);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: "Su sesión ha expirado, inicie sesión de nuevo.",
        life: 5000,
      });
      setTimeout(() => {
        dispatch(clearLogout());
        navigate('/');
      }, 5000);
    } else {
      console.error('Error al cargar los trámites:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar los trámites.',
        life: 5000,
      });
    }
  };

  useEffect(() => {
    loadTramites(lazyState.page, lazyState.rows, search);
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

  const handleEdit = (id) => {
    navigate(`/administrador/editar-tramite/${id}`);
  };

  const handleDelete = (id) => {
  // Verificar si ya hay un diálogo abierto
  if (document.querySelector('.custom-dialog')) return;

  // Crear elemento de diálogo personalizado
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog';

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
  dialog.querySelector('.confirm-btn').addEventListener('click', async () => {
    try {
      await tramiteServiceService.deleteTramite(id);
      setClientes(prev => prev.filter(cliente => cliente.id !== id));

      // Mostrar notificación de éxito
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Trámite eliminado correctamente',
        life: 3000,
      });
    } catch (error) {
      handleError(error);
    } finally {
      // Cerrar el diálogo
      dialog.remove();
    }
  });

  // Manejar clic en cancelar
  dialog.querySelector('.cancel-btn').addEventListener('click', () => {
    dialog.remove();
  });

  // Cerrar al hacer clic fuera del contenedor del diálogo
  dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
    dialog.remove();
  });
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
                  if (e.key === 'Enter') {
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
                    setSearchInput('');
                    setSearch('');
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
          
          <Button
            label="Agregar Trámite"
            className="add-button"
            onClick={() => navigate('/administrador/crear-tramite')}
          />
        </div>
      </div>

      {/* {loading ? (
        <div className="loading-spinner">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="table-container">
          <DataTable
            value={tramites}
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
            emptyMessage="No se encontraron trámites"
          >
            <Column field="nombre" header="Nombre" />
            <Column field="telefono" header="Teléfono" />
            <Column field="email" header="Correo Electrónico" />
            <Column field="direccion" header="Dirección" />
            <Column
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
      )} */}
    </div>
  );
};

export default ConsultarTramites;
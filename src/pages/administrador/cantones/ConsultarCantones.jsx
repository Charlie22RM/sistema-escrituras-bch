import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import CantonService from '../../../services/CantonService';
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

const ConsultarCantones = () => {
  // Estados principales para manejar los datos de cantones, paginación, búsqueda, carga y total de registros
  const [cantones, setCantones] = useState([]);
  const [lazyState, setLazyState] = useState({
    first: 0,     // Índice del primer registro a mostrar
    rows: 10,     // Cantidad de registros por página
    page: 1       // Página actual (1-indexed)
  });
  const [loading, setLoading] = useState(true); // Indica si los datos están cargando
  const [totalRecords, setTotalRecords] = useState(0); // Total de cantones disponibles en el servidor
  const [search, setSearch] = useState(''); // Término de búsqueda ingresado por el usuario
  const [searchInput, setSearchInput] = useState(''); // Input controlado por el usuario

  // Inicialización de servicios y utilidades de navegación, dispatch y toast
  const cantonService = CantonService();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  /**
   * Función que carga los cantones desde el servicio, ya sea todos o filtrados por búsqueda.
   * @param {number} page Página actual
   * @param {number} limit Número de registros por página
   * @param {string} searchQuery Término de búsqueda
   */
  const loadCantones = async (page, limit, searchQuery = '') => {
    setLoading(true);
    try {
      let response;
      if (searchQuery) {
        response = await cantonService.searchCantones(searchQuery, page, limit);
      } else {
        response = await cantonService.getCantones(page, limit);
      }
      setCantones(response.data);
      setTotalRecords(response.total);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja los errores provenientes del backend, especialmente los de autorización (401).
   * Desconecta al usuario si no tiene permisos.
   */
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
      console.error('Error al cargar los cantones:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar los cantones.',
        life: 5000,
      });
    }
  };

  // Carga los cantones cada vez que cambian la página, número de filas o término de búsqueda
  useEffect(() => {
    loadCantones(lazyState.page, lazyState.rows, search);
  }, [lazyState.page, lazyState.rows, search]);

  /**
   * Actualiza el estado de paginación cuando el usuario cambia de página en la tabla
   * @param {object} event Evento emitido por el DataTable
   */
  const onPageChange = (event) => {
    setLazyState({
      ...lazyState,
      first: event.first,
      rows: event.rows,
      page: event.page + 1, // PrimeReact indexa desde 0, pero tu API parece usar 1-indexed
    });
  };

  /**
   * Maneja los cambios en el campo de búsqueda, reiniciando la paginación al primer registro
   * @param {object} e Evento del input
   */
  const handleSearchClick = () => {
    setSearch(searchInput);
    setLazyState({
      ...lazyState,
      first: 0,
      page: 1,
    });
  };

  // Redirige al formulario de edición con el ID del cantón seleccionado
  const handleEdit = (id) => {
    navigate(`/administrador/editar-canton/${id}`);
  };

  /**
   * Muestra un cuadro de confirmación antes de eliminar un cantón
   * Si se confirma, se llama al servicio y se actualiza el estado local
   * @param {number} id ID del cantón a eliminar
   */
const handleDelete = (id) => {
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
        <p>¿Estás seguro de que deseas eliminar este cantón?</p>
      </div>
      <div class="dialog-footer">
        <button class="dialog-btn cancel-btn">Cancelar</button>
        <button class="dialog-btn confirm-btn">Sí, eliminar</button>
      </div>
    </div>
  `;

  // Agregar a DOM
  document.body.appendChild(dialog);
  
  // Manejar clic en confirmar
  dialog.querySelector('.confirm-btn').addEventListener('click', async () => {
    try {
      await cantonService.deleteCanton(id);
      setCantones(prev => prev.filter(canton => canton.id !== id));
      
      // Mantener el toast de PrimeReact original
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cantón eliminado correctamente',
        life: 3000
      });
      
    } catch (error) {
      handleError(error);
    } finally {
      // Cerrar diálogo
      dialog.remove();
    }
  });
  
  // Manejar clic en cancelar
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
      <h2 className="consultar-title">Cantones</h2>

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
              placeholder="Buscar cantón"
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
          label="Agregar Cantón"
          className="add-button"
          onClick={() => navigate('/administrador/crear-canton')}
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
          value={cantones}
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
          emptyMessage="No se encontraron cantones"
        >
          <Column field="nombre" header="Nombre" />
          <Column field="provincia" header="Provincia" />
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

export default ConsultarCantones;

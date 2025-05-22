import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
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
import ProyectoService from '../../../services/ProyectoService';

const ConsultarProyectos = () => {
  // Estados principales para manejar los datos de proyectos, paginación, búsqueda, carga y total de registros
  const [proyectos, setProyectos] = useState([]);
  const [lazyState, setLazyState] = useState({
    first: 0,     // Índice del primer registro a mostrar
    rows: 10,     // Cantidad de registros por página
    page: 1       // Página actual (1-indexed)
  });
  const [loading, setLoading] = useState(true); // Indica si los datos están cargando
  const [totalRecords, setTotalRecords] = useState(0); // Total de proyectos disponibles en el servidor
  const [search, setSearch] = useState(''); // Término de búsqueda ingresado por el usuario
  const [searchInput, setSearchInput] = useState(''); // Input controlado por el usuario

  // Inicialización de servicios y utilidades de navegación, dispatch y toast
  const proyectoService = ProyectoService();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  /**
   * Función que carga los proyectos desde el servicio, ya sea todos o filtrados por búsqueda.
   * @param {number} page Página actual
   * @param {number} limit Número de registros por página
   * @param {string} searchQuery Término de búsqueda
   */
  const loadProyectos = async (page, limit, searchQuery = '') => {
    setLoading(true);
    try {
      let response;
      if (searchQuery) {
        response = await proyectoService.searchProyectos(searchQuery, page, limit);
      } else {
        response = await proyectoService.getProyectos(page, limit);
      }
      setProyectos(response.data);
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
      console.error('Error al cargar los proyectos:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar los proyectos.',
        life: 5000,
      });
    }
  };

  // Carga los proyectos cada vez que cambian la página, número de filas o término de búsqueda
  useEffect(() => {
    loadProyectos(lazyState.page, lazyState.rows, search);
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

  // Redirige al formulario de edición con el ID del proyecto seleccionado
  const handleEdit = (id) => {
    navigate(`/administrador/editar-proyecto/${id}`);
  };

  /**
   * Muestra un cuadro de confirmación antes de eliminar un proyecto
   * Si se confirma, se llama al servicio y se actualiza el estado local
   * @param {number} id ID del proyecto a eliminar
   */
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
        <h3>Confirmar eliminación</h3>
      </div>
      <div class="dialog-content">
        <p>¿Estás seguro de que deseas eliminar este proyecto?</p>
      </div>
      <div class="dialog-footer">
        <button class="dialog-btn cancel-btn">Cancelar</button>
        <button class="dialog-btn confirm-btn">Sí, eliminar</button>
      </div>
    </div>
  `;

  // Agregar al DOM
  document.body.appendChild(dialog);

  // Confirmar eliminación
  dialog.querySelector('.confirm-btn').addEventListener('click', async () => {
    try {
      await proyectoService.deleteProyecto(id);
      setProyectos(prev => prev.filter(proyecto => proyecto.id !== id));

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Proyecto eliminado correctamente',
        life: 3000,
      });
    } catch (error) {
      handleError(error);
    } finally {
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
        <h2 className="consultar-title">Proyectos</h2>

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
                placeholder="Buscar proyecto"
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
            label="Agregar Proyecto"
            className="add-button"
            onClick={() => navigate('/administrador/crear-proyecto')}
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
            value={proyectos}
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
            emptyMessage="No se encontraron proyectos"
          >
            <Column field="nombre" header="Nombre" />
            <Column field="urbanizacion" header="Urbanización" />
            <Column field="canton.nombre" header="Cantón" />
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

export default ConsultarProyectos;

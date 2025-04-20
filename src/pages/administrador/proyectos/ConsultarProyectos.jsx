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
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar este proyecto?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      accept: async () => {
        try {
          await proyectoService.deleteProyecto(id);
          setProyectos(prev => prev.filter(proyecto => proyecto.id !== id));
          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Proyecto eliminada correctamente',
            life: 3000,
          });
        } catch (error) {
          handleError(error);
        }
      },
    });
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2 className="section-title">Proyectos</h2>

      {/* Barra de búsqueda y botón para crear proyecto */}
      <div className="search-container">
        <div className="p-inputgroup custom-inputgroup">
          <InputText
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchClick();
              }
            }}
            placeholder="Buscar Cliente"
            className="p-inputtext-sm"
          />

          {searchInput && (
            <Button
              icon="pi pi-times"
              className="p-button-danger p-button-sm"
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

          <Button
            icon="pi pi-search"
            className="p-button-success"
            onClick={handleSearchClick}
          />
        </div>

        <Button
          label="Agregar proyecto"
          icon="pi pi-plus"
          className="p-button-sm p-button-success create-btn"
          onClick={() => navigate('/administrador/crear-proyecto')}
        />
      </div>

      {/* Spinner de carga mientras se obtienen los datos */}
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : (
        // Tabla de proyectos con paginación, ordenamiento y acciones
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
          className="p-datatable-striped"
          emptyMessage="No se encontraron proyectos"
        >
          <Column field="nombre" header="Nombre" />
          <Column field="urbanizacion" header="Urbanización" />
          <Column
            body={(rowData) => (
              <div>
                <Button
                  icon="pi pi-pencil"
                  rounded text
                  className="custom-edit-btn"
                  onClick={() => handleEdit(rowData.id)}
                />
                <Button
                  icon="pi pi-trash"
                  rounded text
                  className="custom-delete-btn"
                  onClick={() => handleDelete(rowData.id)}
                />
              </div>
            )}
            header="Funciones"
          />
        </DataTable>
      )}
    </div>
  );
};

export default ConsultarProyectos;

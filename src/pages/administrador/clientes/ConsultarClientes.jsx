import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import ClienteService from '../../../services/ClienteService';
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

const ConsultarClientes = () => {
  // Estados principales para manejar los datos de clientes, paginación, búsqueda, carga y total de registros
  const [clientes, setClientes] = useState([]);
  const [lazyState, setLazyState] = useState({
    first: 0,     // Índice del primer registro a mostrar
    rows: 10,     // Cantidad de registros por página
    page: 1       // Página actual (1-indexed)
  });
  const [loading, setLoading] = useState(true); // Indica si los datos están cargando
  const [totalRecords, setTotalRecords] = useState(0); // Total de clientes disponibles en el servidor
  const [search, setSearch] = useState(''); // Término de búsqueda ingresado por el usuario

  // Inicialización de servicios y utilidades de navegación, dispatch y toast
  const clienteService = ClienteService();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  /**
   * Función que carga los clientes desde el servicio, ya sea todos o filtrados por búsqueda.
   * @param {number} page Página actual
   * @param {number} limit Número de registros por página
   * @param {string} searchQuery Término de búsqueda
   */
  const loadClientes = async (page, limit, searchQuery = '') => {
    setLoading(true);
    try {
      let response;
      if (searchQuery) {
        response = await clienteService.searchClientes(searchQuery, page, limit);
      } else {
        response = await clienteService.getClientes(page, limit);
      }
      setClientes(response.data);
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
        detail: 'No tienes permiso para acceder a esta sección.',
        life: 5000,
      });
      setTimeout(() => {
        dispatch(clearLogout());
        navigate('/');
      }, 5000);
    } else {
      console.error('Error al cargar los clientes:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar los clientes.',
        life: 5000,
      });
    }
  };

  // Carga los clientes cada vez que cambian la página, número de filas o término de búsqueda
  useEffect(() => {
    loadClientes(lazyState.page, lazyState.rows, search);
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
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setLazyState({
      ...lazyState,
      first: 0,
      page: 1,
    });
  };

  // Redirige al formulario de edición con el ID del cliente seleccionado
  const handleEdit = (id) => {
    navigate(`/administrador/editar-cliente/${id}`);
  };

  /**
   * Muestra un cuadro de confirmación antes de eliminar un cliente
   * Si se confirma, se llama al servicio y se actualiza el estado local
   * @param {number} id ID del cliente a eliminar
   */
  const handleDelete = (id) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar este cliente?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      accept: async () => {
        try {
          await clienteService.deleteCliente(id);
          setClientes(prev => prev.filter(cliente => cliente.id !== id));
          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente eliminado correctamente',
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
      <h2 className="section-title">Entidades Financieras</h2>
      <div className="search-container">
        <div className="p-inputgroup custom-inputgroup">
          <InputText
            value={search}
            onChange={handleSearch}
            placeholder="Buscar Cliente"
            className="p-inputtext-sm"
          />
          <Button
            icon="pi pi-search"
            className="p-button-secondary"
          />
        </div>

        <Button
          label="Agregar Cliente"
          icon="pi pi-plus"
          className="p-button-sm p-button-success create-btn"
          onClick={() => navigate('/administrador/crear-cliente')}
        />
      </div>

      {/* Spinner de carga mientras se obtienen los datos */}
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : (
        // Tabla de clientes con paginación, ordenamiento y acciones
        <DataTable
          value={clientes}
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
          emptyMessage="No se encontraron clientes"
        >
          <Column field="nombre" header="Nombre" />
          <Column field="telefono" header="Teléfono" />
          <Column field="email" header="Correo Electrónico" />
          <Column field="direccion" header="Dirección" />
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

export default ConsultarClientes;

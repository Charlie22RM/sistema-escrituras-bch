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
  const [clientes, setClientes] = useState([]);
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 1
  });
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState(''); // Se ejecuta la búsqueda con este valor
  const [searchInput, setSearchInput] = useState(''); // Input controlado por el usuario

  const clienteService = ClienteService();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

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
      console.error('Error al cargar los clientes:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar los clientes.',
        life: 5000,
      });
    }
  };

  useEffect(() => {
    loadClientes(lazyState.page, lazyState.rows, search);
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
    navigate(`/administrador/editar-cliente/${id}`);
  };

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
          label="Agregar Cliente"
          icon="pi pi-plus"
          className="p-button-sm p-button-success create-btn"
          onClick={() => navigate('/administrador/crear-cliente')}
        />
      </div>

      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : (
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

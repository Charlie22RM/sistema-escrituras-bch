import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { clearLogout } from '../../../redux/authSlice';
import ClienteService from '../../../services/ClienteService';
import './clientes.css'

const ConsultarClientes = () => {
  // Estados locales para almacenar clientes, estado de carga y búsqueda
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Variables de navegación y referencia a toast para mostrar mensajes
  const navigate = useNavigate();
  const toast = useRef(null);

  // Dispatcher de Redux para realizar acciones
  const dispatch = useDispatch();

  // Servicio que interactúa con la API de clientes
  const clienteService = ClienteService();

  // Efecto que se ejecuta al cargar el componente para obtener los clientes
  useEffect(() => {
    // Función para obtener los clientes desde la API
    const fetchClientes = async () => {
      try {
        const response = await clienteService.getClientes();
        setClientes(response.data);
      } catch (error) {
        // Manejo de errores cuando el usuario no tiene permisos o el servidor falla
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
      } finally {
        setLoading(false);
      }
    };

    // Llamada para obtener los clientes
    fetchClientes();
  }, [clienteService, dispatch, navigate]);

  // Función para manejar la edición de un cliente
  const handleEdit = (id) => {
    navigate(`/administrador/editar-cliente/${id}`);
  };

  // Función para manejar la eliminación de un cliente
  const handleDelete = (id) => {
    confirmDialog({
      message: '¿Estás seguro de que quieres eliminar este cliente?',
      header: 'Confirmación de eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          // Eliminación del cliente en la API
          await clienteService.deleteCliente(id);
          setClientes(clientes.filter(cliente => cliente.id !== id));
          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente eliminado correctamente',
            life: 3000,
          });
        } catch (error) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el cliente.',
            life: 5000,
          });
        }
      },
      reject: () => {
        toast.current.show({
          severity: 'warn',
          summary: 'Acción cancelada',
          detail: 'No se eliminó el cliente.',
          life: 3000,
        });
      }
    });
  };

  // Función para manejar la búsqueda de clientes
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Filtra los clientes basándose en el valor de búsqueda
  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
    cliente.telefono?.toLowerCase().includes(search.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <h2 className="section-title">Gestión de Clientes</h2>

      <div className="search-container">
        <InputText
          value={search}
          onChange={handleSearch}
          placeholder="Buscar Cliente..."
          className="p-inputtext-sm search-input"
        />

        <Button
          label="Crear Cliente"
          icon="pi pi-plus"
          className="p-button-sm p-button-success create-client-btn"
          onClick={() => navigate('/administrador/crear-cliente')}
        />
      </div>

      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable value={filteredClientes} paginator rows={10} className="p-datatable-striped">
          <Column field="nombre" header="Nombre" sortable />
          <Column field="telefono" header="Teléfono" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="direccion" header="Dirección" sortable />
          <Column
            body={(rowData) => (
              <div>
                <Button
                  icon="pi pi-pencil"
                  rounded text raised
                  severity="success"
                  onClick={() => handleEdit(rowData.id)}
                />
                <Button
                  icon="pi pi-trash"
                  rounded text raised
                  severity="danger"
                  onClick={() => handleDelete(rowData.id)}
                />
              </div>
            )}
            header="Acciones"
          />
        </DataTable>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default ConsultarClientes;

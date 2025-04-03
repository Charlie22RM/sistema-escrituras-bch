import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import './clientes.css'

const ConsultarClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const toast = useRef(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/clientes');
        setClientes(response.data);
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar los clientes.',
          life: 5000,
        });
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchClientes();
  }, []);

  const handleEdit = (id) => {
    navigate(`/administrador/editar-cliente/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/clientes/${id}`);
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
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Filtrar clientes por nombre, teléfono o email
  const filteredClientes = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(search.toLowerCase()) || 
    cliente.telefono?.toLowerCase().includes(search.toLowerCase()) || 
    cliente.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      
      {/* Título de la sección */}
      <h2 className="section-title">Gestión de Clientes</h2>

      {/* Contenedor flex con clases CSS personalizadas */}
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
    </div>
  );
};

export default ConsultarClientes;

import React, { useState, useEffect, useRef } from "react";
import ClienteModal from "../../../modals/ClienteModal";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import InmobiliariaModal from "../../../modals/InmobiliariaModal";

// Estilo reutilizable para inputs bloqueados
const blockedInputStyle = {
  width: "400px",
  backgroundColor: "#f5f5f5",
  borderColor: "#ddd",
  color: "#666",
};

const CrearTramites = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInmobiliariaVisible, setModalInmobiliariaVisible] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [inmobiliaria, setInmobiliaria] = useState(null);
  const [tramite, setTramite] = useState(null);
  const toast = useRef(null);

  const handleModalHide = () => setModalVisible(false);

  const handleModalInmobilaria = () => {
    if (cliente === null) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "No has seleccionado un cliente.",
        life: 5000,
      });
      return;
    }
    setModalInmobiliariaVisible(true);
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-column align-items-center gap-4 p-4">
        <h1>Crear Trámites</h1>

        <div
          className="flex flex-column gap-5 w-full"
          style={{ maxWidth: "650px" }}
        >
          {/* Input Cliente */}
          <div className="flex align-items-center gap-3">
            <div style={{ minWidth: "400px", cursor: "not-allowed" }}>
              <InputText
                value={cliente?.nombre || ""}
                placeholder="Cliente"
                disabled
                className="p-inputtext-sm w-full" // w-full para que ocupe el ancho del contenedor
                style={blockedInputStyle}
              />
            </div>
            <Button
              icon="pi pi-user"
              label="Buscar Cliente"
              onClick={() => setModalVisible(true)}
              className="p-button-primary flex-grow-1" // flex-grow-1 para que el botón crezca
            />
          </div>

          {/* Input Inmobiliaria */}
          <div className="flex align-items-center gap-3">
            <div style={{ minWidth: "400px", cursor: "not-allowed" }}>
              <InputText
                value={inmobiliaria?.nombre || ""}
                placeholder="Inmobiliaria"
                disabled
                className="p-inputtext-sm w-full"
                style={blockedInputStyle}
              />
            </div>
            <Button
              icon="pi pi-search"
              label="Buscar Inmobiliaria"
              onClick={handleModalInmobilaria}
              className="p-button-primary flex-grow-1"
            />
          </div>

          {/* Input Tipo de Trámite */}
          <div className="flex align-items-center gap-3">
            <div style={{ minWidth: "400px", cursor: "not-allowed" }}>
              <InputText
                value={tramite?.tipo || ""}
                placeholder="Tipo de trámite"
                disabled
                className="p-inputtext-sm w-full"
                style={blockedInputStyle}
              />
            </div>
            <Button
              icon="pi pi-briefcase"
              label="Seleccionar"
              onClick={() => console.log("Buscar trámite")}
              className="p-button-help flex-grow-1"
            />
          </div>

          {/* Input Documento */}
          <div className="flex align-items-center gap-3">
            <div style={{ minWidth: "400px", cursor: "not-allowed" }}>
              <InputText
                value={tramite?.documento || ""}
                placeholder="Documento requerido"
                disabled
                className="p-inputtext-sm w-full"
                style={blockedInputStyle}
              />
            </div>
            <Button
              icon="pi pi-file-pdf"
              label="Adjuntar"
              onClick={() => console.log("Adjuntar documento")}
              className="p-button-warning flex-grow-1"
            />
          </div>
        </div>

        <ClienteModal
          visible={modalVisible}
          onHide={handleModalHide}
          setCliente={setCliente}
        />
        <InmobiliariaModal 
          visible={modalInmobiliariaVisible}
          onHide={() => setModalInmobiliariaVisible(false)}
          setInmobiliaria={setInmobiliaria}
          cliente_id={cliente?.id} // Asegúrate de pasar el ID del cliente seleccionado
        />
      </div>
    </>
  );
};

export default CrearTramites;

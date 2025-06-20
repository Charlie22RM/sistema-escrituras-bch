import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TramiteService from "../../../services/TramiteService";
import PdfService from "../../../services/PdfService";
import { Toast } from "primereact/toast";
import { useDispatch } from "react-redux";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { clearLogout } from "../../../redux/authSlice";

const ConsultarDocumentacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tramiteService = TramiteService();
  const pdfService = PdfService();
  const [pdfCatastroId, setPdfCatastroId] = useState(null);
  const [pdfTituloId, setPdfTituloId] = useState(null);
  const [pdfFacturasId, setPdfFacturasId] = useState([]);
  const toast = useRef(null);

  const getTramite = async () => {
    try {
      const tramite = await tramiteService.findOne(id);
      console.log(tramite);
      if (tramite) {
        if (tramite.pdfs) {
          const pdfs = tramite.pdfs;
          setPdfFacturasId([]);
          setPdfCatastroId(null);
          setPdfTituloId(null);
          pdfs.forEach((pdf) => {
            if (pdf.is_catastro) {
              setPdfCatastroId(pdf.id);
            } else if (pdf.is_titulo) {
              setPdfTituloId(pdf.id);
            } else if (pdf.is_factura) {
              setPdfFacturasId((prev) => [...prev, pdf.id]);
            }
          });
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getPdfUrl = async (pdfId) => {
    try {
      const response = await pdfService.getPdf(pdfId);
      window.open(response.data.url, "_blank");
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    console.error("Error al cargar los pdf:", error.statusCode);
    if (error?.response?.data?.statusCode === 401 || error.statusCode === 401) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Su sesión ha expirado,inicie sesión de nuevo.",
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
        detail: error.response.data.message,
        life: 5000,
      });
    }
  };

  useEffect(() => {
    getTramite();
  }, []);
  return (
    <div>
      <Toast ref={toast} />
      <div className="tramite-form-container">
        <Card
          title={
            <div className="flex align-items-center">
              <Button
                icon="pi pi-arrow-left"
                className="p-button-text p-button-plain mr-2"
                onClick={() =>
                  navigate("/cliente/")
                }
                tooltip="Volver a página principal"
                tooltipOptions={{ position: "top" }}
              />
              <span>Documentación</span>
            </div>
          }
          className="w-full md:w-6">
          <div className="document-section">
            <div className="section-header">
              <i className="pi pi-file-pdf section-icon"></i>
              <h3>Título de Propiedad</h3>
            </div>
            <div className="section-content">
              <div className="tramite-form-actions">
                {pdfTituloId != null ? (
                  <Button
                    type="button"
                    label="Ver PDF del título"
                    icon="pi pi-eye"
                    className="tramite-button tramite-submit"
                    onClick={() => getPdfUrl(pdfTituloId)}
                  />
                ) : (
                  <p className="empty-message">El título de propiedad aún no está disponible.</p>
                )}
              </div>
            </div>

          </div>

          <div className="document-section">
            <div className="section-header">
              <i className="pi pi-file-pdf section-icon"></i>
              <h3>Certificado Catastral</h3>
            </div>
            <div className="section-content">
              {pdfCatastroId != null ? (
                <div className="tramite-form-actions">
                  <Button
                    type="button"
                    label="Ver PDF del catastro"
                    icon="pi pi-eye"
                    className="tramite-button tramite-submit"
                    onClick={() => getPdfUrl(pdfCatastroId)}
                  />
                </div>
              ) : (
                <p className="empty-message">El certificado catastral aún no está disponible.</p>
              )}
            </div>
          </div>

          {/* Sección Facturas */}
          <div className="document-section">
            <div className="section-header">
              <i className="pi pi-receipt section-icon"></i>
              <h3>Facturas de Servicios</h3>
            </div>
            <div className="section-content">
              {pdfFacturasId.length > 0 ? (
                <div className="invoice-list">
                  {pdfFacturasId.map((facturaId, index) => (
                    <div key={facturaId} className="invoice-item">
                      <span className="invoice-label">Factura {index + 1}</span>
                      <div className="tramite-form-actions">
                        <Button
                          type="button"
                          label="Ver Factura"
                          icon="pi pi-eye"
                          className="tramite-button tramite-submit"
                          onClick={() => getPdfUrl(facturaId)}
                        />
                      </div>

                    </div>

                  ))}
                </div>
              ) : (
                <p className="empty-message">Las facturas aún no están disponibles.</p>
              )}

            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default ConsultarDocumentacion;

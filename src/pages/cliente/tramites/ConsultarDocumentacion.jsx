import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TramiteService from "../../../services/TramiteService";
import PdfService from "../../../services/PdfService";
import { Toast } from "primereact/toast";
import { useDispatch } from "react-redux";
import { Button } from "primereact/button";
import { clearLogout } from "../../../redux/authSlice";

const ConsultarDocumentacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tramiteService = TramiteService();
  const pdfService = PdfService();
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
          pdfs.forEach((pdf) => {
            if (pdf.is_factura) {
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
    <>
      <Toast ref={toast} />
      {pdfFacturasId.length > 0 && (
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
      )}
      <Button
        type="button"
        label="Regresar"
        icon="pi pi-arrow-left"
        className="tramite-button tramite-submit"
        onClick={() => navigate(-1)}
      ></Button>
    </>
  );
};

export default ConsultarDocumentacion;

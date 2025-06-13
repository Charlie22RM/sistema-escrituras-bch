import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "primereact/card";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import { clearLogout } from "../../redux/authSlice";
import ConfiguracionService from "../../services/ConfiguracionService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


const Parametros = () => {
  const toast = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const configuracionService = ConfiguracionService();
  // Validación del formulario
  const validationSchema = Yup.object().shape({
    canDeleteTramite: Yup.boolean(),
  });

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      canDeleteTramite: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Aquí iría tu llamada al servicio para guardar los parámetros
        // await parametroService.update(values);

        // Simulamos un retraso de red
        await configuracionService.update({
          PERMITIR_ELIMINAR_TRAMITES: values.canDeleteTramite,
        });

        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Configuración guardada correctamente",
          life: 3000,
        });
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleError = (error) => {
    console.log("Error:", error);
    if (error?.response?.status === 401 || error.statusCode === 401) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Su sesión ha expirado, inicie sesión de nuevo.",
        life: 3000,
      });
      setTimeout(() => {
        dispatch(clearLogout());
        navigate("/");
      }, 3000);
    } else {
      console.error("Error al configurar:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo guardar la configuración.",
        life: 3000,
      });
    }
  };

  // Cargar configuración inicial
  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        setLoading(true);
        const response = await configuracionService.getAll();
        const configuraciones = response.data;

        configuraciones.forEach((config) => {
          if (config.codigo === "PERMITIR_ELIMINAR_TRAMITES") {
            formik.setFieldValue("canDeleteTramite", config.valor === "true");
          }
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudo cargar la configuración",
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialConfig();
  }, []);

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <Card title="Parámetros" className="shadow-2">
        <form onSubmit={formik.handleSubmit}>
          <div className="field grid align-items-center">
            <div className="col-12 md:col-6">
              <label htmlFor="canDeleteTramite" className="block text-lg font-medium text-gray-800 mb-2">
                ¿Desea permitir que se eliminen trámites del sistema?
              </label>
              <div className="flex align-items-center gap-3">
                <InputSwitch
                  id="canDeleteTramite"
                  name="canDeleteTramite"
                  checked={formik.values.canDeleteTramite}
                  onChange={(e) => formik.setFieldValue("canDeleteTramite", e.value)}
                  pt={{
                    slider: {
                      style: {
                        backgroundColor: formik.values.canDeleteTramite ? '#1e3c72' : '',
                      },
                    },
                    root: {
                      style: {
                        border: 'none',
                        boxShadow: 'none',
                      },
                    },
                  }}
                />
      
                <i
                  className="pi pi-info-circle ml-2 cursor-pointer text-primary"
                  data-pr-tooltip="Esta opción permite a los operadores eliminar trámites del sistema"
                  data-pr-position="right"
                />
                <Tooltip target=".pi-info-circle" />
              </div>
              {formik.touched.canDeleteTramite && formik.errors.canDeleteTramite && (
                <div className="text-red-500 mt-1 text-sm">
                  {formik.errors.canDeleteTramite}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            label="Guardar"
            icon="pi pi-save"
            loading={loading}
            className="tramite-button tramite-submit"
          />
        </form>

        <div className="mt-4 surface-100 p-3 border-round">
          <h3 className="mt-0 text-lg font-semibold">Configuración actual</h3>
          <p className="text-gray-700">
            <span className="font-medium">Permitir eliminar trámites:</span>{' '}
            <strong className={formik.values.canDeleteTramite ? 'text-green-600' : 'text-red-600'}>
              {formik.values.canDeleteTramite ? 'Activado' : 'Desactivado'}
            </strong>
          </p>
        </div>
      </Card>
    </div>
  );

};

export default Parametros;

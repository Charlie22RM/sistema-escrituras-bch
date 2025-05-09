import React, { useState, useEffect, useRef } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import ClienteService from "../services/ClienteService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearLogout } from "../redux/authSlice";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const InmobiliariaModal = ({ visible, onHide, setInmobiliaria }) => {
  const toast = useRef(null);
  const [inputSearch, setInputSearch] = useState("");
  return (
    <>
      <Toast ref={toast} />

      <Dialog>
        <div className="flex justify-content-center align-items-center mb-4">
            <div className="flex align-items-center" style={{ gap: "10px" }}>
                <InputText 
                    placeholder="Buscar inmobiliaria"
                    value={inputSearch}
                />
            </div>
        </div>
      </Dialog>
    </>
  );
};

export default InmobiliariaModal;

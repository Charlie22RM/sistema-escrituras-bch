import { Navigate, Outlet } from "react-router-dom";
//import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
    //const user = useSelector(state => state.user); // Asegúrate de que el estado de Redux tiene `user`
    
    /*
    if (!user?.id) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
    */
    return <Outlet />;
};

export default ProtectedRoute;

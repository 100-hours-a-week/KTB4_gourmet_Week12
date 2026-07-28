import {
    Navigate,
    Outlet,
    useLocation
} from "react-router";

import useAuth from "../hooks/useAuth.js";

function ProtectedRoute() {
    const location = useLocation();

    const {
        isAuthenticated,
        isAuthLoading
    } = useAuth();

    if (isAuthLoading) {
        return (
            <main className="route-loading">
                로그인 상태를 확인하고 있습니다.
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location
                }}
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;
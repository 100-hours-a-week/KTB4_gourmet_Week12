import {
    Navigate,
    Outlet
} from "react-router";

import useAuth from "../hooks/useAuth.js";

function PublicOnlyRoute() {
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

    if (isAuthenticated) {
        return (
            <Navigate
                to="/boards/free"
                replace
            />
        );
    }

    return <Outlet />;
}

export default PublicOnlyRoute;
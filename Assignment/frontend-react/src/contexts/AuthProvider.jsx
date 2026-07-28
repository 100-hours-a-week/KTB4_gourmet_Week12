import {
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    login as requestLogin,
    logout as requestLogout
} from "../api/authApi.js";

import AuthContext from "./AuthContext.js";

function AuthProvider({ children }) {
    const [
        currentUser,
        setCurrentUser
    ] = useState(null);

    const [
        isAuthLoading,
        setIsAuthLoading
    ] = useState(true);

    const isAuthenticated =
        currentUser !== null;

    function replaceCurrentUser(user) {
        if (!user?.id) {
            throw new Error(
                "사용자 정보가 올바르지 않습니다."
            );
        }

        setCurrentUser(user);
    }

    function clearAuthentication() {
        setCurrentUser(null);
    }

    useEffect(function () {
        let ignore = false;

        async function restoreLoginUser() {
            try {
                const user =
                    await getCurrentUser();

                if (!ignore) {
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error(
                    "로그인 상태 복구 오류:",
                    error
                );

                if (!ignore) {
                    setCurrentUser(null);
                }
            } finally {
                if (!ignore) {
                    setIsAuthLoading(false);
                }
            }
        }

        restoreLoginUser();

        return function () {
            ignore = true;
        };
    }, []);

    async function signIn(credentials) {
        const data =
            await requestLogin(credentials);

        setCurrentUser(data.user);

        return data.user;
    }

    async function signOut() {
        await requestLogout();

        setCurrentUser(null);
    }

    const value = {
        currentUser,
        isAuthenticated,
        isAuthLoading,
        signIn,
        signOut,
        replaceCurrentUser,
        clearAuthentication
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
import PasswordChangePage from
    "./pages/PasswordChangePage.jsx";

import ProfileEditPage from
    "./pages/ProfileEditPage.jsx";

import SearchPage from
    "./pages/SearchPage.jsx";

import PostEditPage from
    "./pages/PostEditPage.jsx";

import PostCreatePage from
    "./pages/PostCreatePage.jsx";

import ProjectCreatePage from
    "./pages/ProjectCreatePage.jsx";

import PostDetailPage from
    "./pages/PostDetailPage.jsx";

import {
    Navigate,
    Route,
    Routes
} from "react-router";


import AuthLayout from "./layouts/AuthLayout.jsx";
import CommunityLayout from "./layouts/CommunityLayout.jsx";

import BoardPage from "./pages/BoardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicOnlyRoute from "./routes/PublicOnlyRoute.jsx";

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            <Route element={<PublicOnlyRoute />}>
                <Route element={<AuthLayout />}>
                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/signup"
                        element={<SignupPage />}
                    />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<CommunityLayout />}>
                    <Route
                        path="/boards/:boardType"
                        element={<BoardPage />}
                    />

                    <Route
                        path="/posts/new"
                        element={<PostCreatePage />}
                    />

                    <Route
                        path="/projects/new"
                        element={<ProjectCreatePage />}
                    />

                    <Route
                        path="/posts/:postId"
                        element={<PostDetailPage />}
                    />

                    <Route
                        path="/posts/:postId/edit"
                        element={<PostEditPage />}
                    />

                    <Route
                        path="/search"
                        element={<SearchPage />}
                    />

                    <Route
                        path="/profile"
                        element={
                            <Navigate
                                to="/profile/edit"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/profile/edit"
                        element={<ProfileEditPage />}
                    />

                    <Route
                        path="/profile/password"
                        element={<PasswordChangePage />}
                    />
                </Route>
            </Route>

            <Route
                path="*"
                element={<NotFoundPage />}
            />
        </Routes>
    );
}

export default App;
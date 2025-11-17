import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { routes } from './routeConfig';
import { ComingSoon, NotFound, Unauthorized } from '@/views';

interface Props {
    userRole: string;
    isAuthenticated: boolean;
}
const Routing = ({ userRole, isAuthenticated }: Props) => {
    return (
        <Routes>
            {routes.map(({ path, element: Component, allowedRoles, isPublic }) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        isPublic ? (
                            <Component />
                        ) : (
                            <ProtectedRoute
                                allowedRoles={allowedRoles}
                                userRole={userRole}
                                isAuthenticated={isAuthenticated}
                            >
                                <Component />
                            </ProtectedRoute>
                        )
                    }
                />
            ))}

            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="*" element={<NotFound />} />

            <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
    );
};

export default Routing;
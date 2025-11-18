// import Home from '@/views/Home';

// import { ComingSoon } from '@/views';
import Home from '@/views/Home';

export const routes = [
    {
        path: '/',
        element: Home,
        isPublic: true,
        allowedRoles: []
    }
    // {
    //     path:'/coming-soon',
    //     element:ComingSoon,
    //     isPublic:false,
    //     allowedRoles:['admin','user']
    // }

];
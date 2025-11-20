import { users } from '@/apiEndPoints';
import APIrequest from '@/services/apiService';
import type { APIRequestConfig } from '@/types/common.types';
import type { GetDiscountQueryParamsType } from '@/types/discounts.types';

export const UsersService = {
    getUsers: async ({ queryParams }: GetDiscountQueryParamsType) => {
        // eslint-disable-next-line no-useless-catch
        try {
            const payload = {
                ...users.fetchUsers,
                queryParams
            };
            const res = await APIrequest(payload as unknown as APIRequestConfig);
            return res;
        } catch (error) {
            throw error;
        }
    }

    // addLoyaltyPrograms: async ({ bodyData }) => {
    //     // eslint-disable-next-line no-useless-catch
    //     try {
    //         const payload = {
    //             ...users.addLoyaltyProgram,
    //             bodyData,
    //             formHeaders: {
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         };
    //         const res = await APIrequest(payload as unknown as APIRequestConfig);
    //         return res;
    //     } catch (error) {
    //         throw error;
    //     }
    // },
    // updateLoyaltyPrograms: async ({ bodyData }) => {
    //     // eslint-disable-next-line no-useless-catch
    //     try {
    //         const payload = {
    //             ...users.editLoyaltyProgram,
    //             bodyData,
    //             formHeaders: {
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         };
    //         const res = await APIrequest(payload as unknown as APIRequestConfig);
    //         return res;
    //     } catch (error) {
    //         throw error;
    //     }
    // },
    // deleteLoyaltyPrograms: async ({ bodyData }) => {
    //     // eslint-disable-next-line no-useless-catch
    //     try {
    //         const payload = {
    //             ...users.deleteLoyaltyProgram,
    //             bodyData,
    //             formHeaders: {
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         };
    //         const res = await APIrequest(payload as unknown as APIRequestConfig);
    //         return res;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
};

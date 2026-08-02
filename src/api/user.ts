import http, { ApiResponse } from '../utils/http';

export const UserService = {
    getUsers() {
        return http.get('/user')
    },

    getUserById(id: number) {
        return http.get(`/user/${id}`)
    },

    getUserByName(username: string) {
        return http.get(`/user/username/${username}`)
    },
}
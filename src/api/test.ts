import http from '../utils/http'

export const TestService = {
    test() {
        return http.get('/')
    },
}

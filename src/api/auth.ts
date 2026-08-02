import AsyncStorage from "@react-native-async-storage/async-storage";
import http from "../utils/http";
import { TOKEN_KEY } from "../utils/http";
import { logging } from "~utils";


export interface SigninParams {
    username: string;
    password: string;
}

export interface SignupParams extends SigninParams {
    password2: string;
}

export interface Token {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export const AuthService = {
    async signin(params: SigninParams) {
        const res = await http.post('/auth/login', params)
        if (res.success) {
            await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(res.data))
        }
        return res
    },

    async signup(params: SignupParams) {
        return http.post('/auth/signup', params)
    }
}

export const Auth = {
    async getToken() {
        const token = await AsyncStorage.getItem(TOKEN_KEY)
        if (!token) return null
        return JSON.parse(token) as Token
    },
    removeToken: () => AsyncStorage.removeItem(TOKEN_KEY)
}
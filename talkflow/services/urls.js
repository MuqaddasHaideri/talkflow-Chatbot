const baseUrl = 'http://localhost:5001/api';

export const authUrls = {
    signup: `${baseUrl}/auth/signup`,
    login: `${baseUrl}/auth/login`,
}

export const sessionUrls = {
    createSession: `${baseUrl}/sessions/create`,
    getSessions: `${baseUrl}/sessions/get`,
    updateSession: `${baseUrl}/sessions/update`,
    deleteSession: `${baseUrl}/sessions/delete`,
}
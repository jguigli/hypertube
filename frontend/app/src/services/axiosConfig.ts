import axios from "axios";

const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export function setupAxiosInterceptors(logoutAndRedirect: () => void) {

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logoutAndRedirect();
      }
      return Promise.reject(error);
    }
  );
}

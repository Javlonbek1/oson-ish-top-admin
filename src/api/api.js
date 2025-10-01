import axios from "axios";

const api = axios.create({
  baseURL: "https://api.osonishtop.uz/api/v1", // o'zingning backend manzilingni qo'y
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;


import axios from "axios";



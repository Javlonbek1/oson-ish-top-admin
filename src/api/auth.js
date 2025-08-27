import axiosInstance from "./axiosInstance";


export const loginUser = async ({phone , password}) => {
  const {data} = await axiosInstance.post("auth/signin" , {phone , password});
  return data;
}
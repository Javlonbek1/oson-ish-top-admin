import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../../validation/loginSchema";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../../api/auth";

const LoginPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data?.data?.jwt);
      localStorage.setItem("roles", data?.data?.roles);
      navigate("/region");
    },
    onError: (error) => {
      alert(
        error.response?.data?.message || "Login muvaffaqiyatisiz yakunlandi"
      );
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center "
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-black/50 h-[100vh] flex flex-col justify-center p-6 shadow-lg  sm:max-w-96  w-full space-y-4 rounded"
      >
        <h2 className="text-2xl font-[cursive] font-bold text-center text-white">
          Admin Login
        </h2>

        {/* Telefon */}
        <div>
          <input
            type="tel"
            placeholder="Telefon raqam"
            {...register("phone")}
            className="w-full border-2 border-t-0 border-x-0 bg-transparent  text-white p-2 rounded 
             focus:outline-none  border-bottom border-[#ffffff74]  focus:ring-0 focus:border-blue-500 shadow-none 
             placeholder-gray-300"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Parol */}
        <div>
          <input
            type="password"
            placeholder="Parol"
            {...register("password")}
            className="w-full bg-transparent  border-2 border-t-0 border-x-0    border-[#ffffff74] text-white p-2 rounded focus:outline-none focus:ring-0 focus:border-blue-500 placeholder-gray-300"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full cursor-pointer bg-[#0000ff3d] text-white font-[500] p-2 rounded hover:bg-[#0000ff6e] disabled:bg-gray-400"
        >
          {mutation.isPending ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

import * as yup from "yup";

export const loginSchema = yup.object().shape({
  phone: yup.string().required("Telefon raqam majburiy"),
  password: yup
    .string()
    .min(3, "Parol kamida 3 ta belgidan iborat bo‘lishi kerak")
    .required("Parol majburiy"),
});


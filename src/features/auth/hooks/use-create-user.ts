import { useMutation } from "@tanstack/react-query";
import { createUserApi, type CreateUserInput } from "../api/auth-api";

export function useCreateUser() {
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUserApi(input),
  });
}

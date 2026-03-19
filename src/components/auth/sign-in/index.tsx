"use client";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import { useRouter } from "next/navigation";
import { validateAndSetErrors } from "@/utils/validation";
import { signInSchema } from "../schema";
import toast from "react-hot-toast";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
    emailVerifiedAt: string | null;
  };
}

function SignIn() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleLogin = async () => {
    if (
      !(await validateAndSetErrors(
        signInSchema,
        { email, password },
        setErrors
      ))
    )
      return;
    setIsLoading(true);
    try {
      const response = await apiCall<LoginResponse>({
        endpoint: routes.api.login,
        method: "POST",
        data: { email, password },
      });
      if (response.success === true) {
        if (response.data?.user?.isAdmin) {
          setErrors({});
          document.cookie = `authtoken=${response?.data?.token}; path=/`;
          router.push(routes.ui.areas);
          console.log(response.data);
        } else {
          toast.error(
            "Access denied: Only administrators can log in to this portal."
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black">
      <div className="w-full max-w-[480px] px-4">
        <div className="text-left mb-8">
          <h1 className="text-[32px] font-[600] text-black mb-[15px]">
            Admin Login
          </h1>
          <p className="text-[16px]">Sign in to your admin account</p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2 text-left">
            <label
              className="text-black font-[400] text-[14px]"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              id="email"
              type="email"
              placeholder="Enter your email"
              error={errors.email}
            />
          </div>
          <div className="space-y-2 text-left">
            <label
              className="text-black font-[400] text-[14px]"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-12"
                error={errors.password}
              />
              <div
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#8F8F8F" />
                ) : (
                  <Eye size={20} color="#8F8F8F" />
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleLogin()}
            isLoading={isLoading}
            className="w-full py-3 mt-2 text-[20px]"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;

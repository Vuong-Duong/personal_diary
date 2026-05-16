"use client";

import { API_ENDPOINTS, API_URL as BASE_API_URL } from "@/api/apiConfig";
import { setAccessToken } from "@/api/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { DecodedToken } from "@/proxy";
import { useAuth } from "@/providers/auth-provider";
import { showErrorToast } from "@/utils/popUpUtils";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

const API_BASE = BASE_API_URL ?? "/api";
const LOGIN_URL = `${API_BASE}${API_ENDPOINTS.AUTH.LOGIN}`;

const translations = {
  vi: {
    title: "Đăng nhập",
    email: "Email",
    emailPlaceholder: "Email hoặc tên đăng nhập",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    loginButton: "Đăng nhập",
    googleButton: "Đăng nhập với Google",

    contactPrefix: "Liên hệ ",
    contactSupport: "chăm sóc khách hàng",
    contactSuffix: " để đăng kí HR",
    noAccount: "Chưa có tài khoản?",

    registerLink: "Đăng ký ngay",
    loginSuccess: "Đăng nhập thành công!",
    loginFailed: "Đăng nhập thất bại",
    invalidCredentials: "Thông tin đăng nhập không chính xác. Vui lòng thử lại.",
    emailNotVerified:
      "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.",
    emailRequired: "Email là bắt buộc",
    passwordRequired: "Mật khẩu là bắt buộc",
    invalidEmailFormat: "Vui lòng nhập địa chỉ email hợp lệ",
    passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự",
    networkError: "Lỗi kết nối. Vui lòng kiểm tra kết nối của bạn.",
    unauthorizedRole: "Tài khoản của bạn không có quyền truy cập trang này.",
  },
};

export function useLoginForm(allowedRoles?: string[]) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const t = translations.vi;

  const handleAuthToken = async (access_token: string, emailHint?: string) => {
    const decoded: DecodedToken = jwtDecode(access_token);

    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(decoded.role)
    ) {
      throw new Error("UNAUTHORIZED_ROLE");
    }

    setAccessToken(access_token);

    const params = new URLSearchParams(window.location.search);
    const rawCallbackUrl = params.get("callbackUrl");
    const safeCallbackUrl = (() => {
      if (!rawCallbackUrl) return null;
      if (rawCallbackUrl.startsWith("/")) return rawCallbackUrl;
      try {
        const u = new URL(rawCallbackUrl);
        if (u.origin === window.location.origin) {
          return `${u.pathname}${u.search}${u.hash}`;
        }
      } catch {
        // ignore
      }
      return null;
    })();

    if (safeCallbackUrl) {
      router.replace(safeCallbackUrl);
    } else if (decoded.role === "admin") {
      router.replace("/adminPage")
    } else {
      router.replace("/");
    }

    await refreshUser();

    window.dispatchEvent(new CustomEvent("loginSuccess"));
    window.dispatchEvent(new CustomEvent("authChange"));

    toast({
      title: t.loginSuccess,
      description: `Welcome back${emailHint ? `, ${emailHint}` : ""}!`,
    });
  };

  const validateForm = () => {
    if (!formData.email) {
      setError(t.emailRequired);
      return false;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError(t.invalidEmailFormat || "Email không hợp lệ");
      return false;
    }

    if (!formData.password) {
      setError(t.passwordRequired);
      return false;
    }

    // Validate password length (minimum 6 characters)
    if (formData.password.length < 6) {
      setError(t.passwordTooShort || "Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post<LoginResponse>(LOGIN_URL, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { access_token } = response.data;
      await handleAuthToken(access_token, formData.email);
    } catch (error) {
      let msg = t.networkError;

      const err = error as any;

      if (err.message === "UNAUTHORIZED_ROLE") {
        // Use showErrorToast for unauthorized role
        showErrorToast(t.loginFailed, t.unauthorizedRole);
        setIsLoading(false);
        return; // Don't set error state to avoid red text in form
      } else if (err?.response?.status === 401) {
        // Check if it's email verification error
        const errorMessage = err?.response?.data?.message || "";
        const isUnverified =
          errorMessage.includes("Email not verified") ||
          errorMessage.includes("Email chưa được xác thực");

        if (isUnverified) {
          msg = t.emailNotVerified;
          router.push(
            `/verify-email?email=${encodeURIComponent(formData.email)}`
          );
        } else {
          msg = t.invalidCredentials;
        }
      }

      setError(msg);
      toast({ title: t.loginFailed, description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };



  return {
    formData,
    showPassword,
    error,
    isLoading,
    t,
    handleInputChange,
    handleSubmit,
    setShowPassword,
  };
}

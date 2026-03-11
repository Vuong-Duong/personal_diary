"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/popUpUtils";

interface RegisterFormData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
}

const messages = {
  title: "Tạo tài khoản",
  subtitle: "Đăng ký để bắt đầu",
  firstName: "Tên",
  firstNamePlaceholder: "Nhập tên của bạn",
  lastName: "Họ",
  lastNamePlaceholder: "Nhập họ của bạn",
  email: "Email",
  emailPlaceholder: "Nhập email của bạn",
  password: "Mật khẩu",
  passwordPlaceholder: "Nhập mật khẩu của bạn",
  confirmPassword: "Xác nhận mật khẩu",
  confirmPasswordPlaceholder: "Xác nhận mật khẩu của bạn",
  phone: "Số điện thoại (không bắt buộc)",
  phonePlaceholder: "Nhập số điện thoại của bạn",
  address: "Địa chỉ (không bắt buộc)",
  addressPlaceholder: "Nhập địa chỉ của bạn",
  registerButton: "Tạo tài khoản",
  haveAccount: "Đã có tài khoản?",
  loginLink: "Đăng nhập",
  requiredFields: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
  invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ!",
  invalidPhone: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!",
  passwordMismatch: "Mật khẩu xác nhận không khớp!",
  passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự",
  passwordTooLong: "Mật khẩu không được quá 50 ký tự",
  passwordComplexity: "Mật khẩu phải có ít nhất một số và một ký tự đặc biệt",
  registerSuccess: "Đăng ký thành công!",
  registerFailed: "Đăng ký thất bại",
  checkEmail: "Vui lòng kiểm tra email của bạn để xác nhận",
  emailSent: "Đã gửi email xác thực!",
  emailError: "Không thể gửi email xác thực",
};

type CheckEmailFn = (email: string) => Promise<boolean>;

const checkEmailExists: CheckEmailFn = async () => {
  try {
    // TODO: Replace bằng API kiểm tra email
    return false;
  } catch {
    return false;
  }
};

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    const { email, first_name, last_name, password, confirmPassword } = formData;

    if (!email || !first_name || !last_name || !password || !confirmPassword) {
      showErrorToast(messages.requiredFields);
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      showErrorToast(messages.invalidEmail);
      setIsLoading(false);
      return;
    }

    if (await checkEmailExists(email)) {
      showErrorToast("Email này đã được đăng ký!");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      showErrorToast(messages.passwordTooShort);
      setIsLoading(false);
      return;
    }

    if (password.length > 50) {
      showErrorToast(messages.passwordTooLong);
      setIsLoading(false);
      return;
    }

    const passwordComplexityRegex = /(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordComplexityRegex.test(password)) {
      showErrorToast(messages.passwordComplexity);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast(messages.passwordMismatch);
      setIsLoading(false);
      return;
    }

    try {
      const fullName = `${first_name} ${last_name}`;
      await register(fullName, email, password);
      showSuccessToast(messages.registerSuccess, messages.checkEmail);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      setIsSuccess(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : messages.registerFailed;
      showErrorToast(messages.registerFailed, msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    showConfirmPassword,
    message,
    isLoading,
    isSuccess,
    t: messages,
    handleInputChange,
    handleRegister,
    setShowPassword,
    setShowConfirmPassword,
  };
}
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Button, Input } from "@components/ui/index.js";
import { useLoginMutation } from "@features/auth/authAPI.js";
import { setCredentials } from "@features/auth/authSlice.js";
import { loginSchema } from "@utils/validators.js";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // Redirect to where user was trying to go, or feed
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const response = await login({
        email: data.email.includes("@") ? data.email : undefined,
        username: data.email.includes("@") ? undefined : data.email,
        password: data.password,
      }).unwrap();

      const { user, accessToken } = response.data;

      dispatch(setCredentials({ user, accessToken }));
      toast.success(`Welcome back, ${user.fullName || user.username}!`);
      navigate(from, { replace: true });
    } catch (error) {
      setServerError(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          {serverError}
        </div>
      )}

      {/* Form */}
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Input
          label="Email or Username"
          type="text"
          placeholder="Enter your email or username"
          error={errors.email?.message}
          autoComplete="username"
          autoFocus
          {...register("email")}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            error={errors.password?.message}
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register("password")}
          />

          <div className={styles.forgotLink}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} size="lg">
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span>OR</span>
        <span className={styles.dividerLine} />
      </div>

      {/* Register link */}
      <p className={styles.bottomLink}>
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;

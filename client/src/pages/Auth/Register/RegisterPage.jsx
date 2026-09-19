import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Button, Input } from "@components/ui/index.js";
import { useRegisterMutation } from "@features/auth/authAPI.js";
import { setCredentials } from "@features/auth/authSlice.js";
import { registerSchema } from "@utils/validators.js";
import styles from "./RegisterPage.module.css";

// ---- Password strength checker ----
const getPasswordStrength = (password) => {
  if (!password || password.length === 0) {
    return { score: 0, label: "", level: "" };
  }

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 1, label: "Weak", level: "weak" },
    { score: 2, label: "Fair", level: "fair" },
    { score: 3, label: "Good", level: "good" },
    { score: 5, label: "Strong", level: "strong" },
  ];

  const result = levels.find((l) => score <= l.score) || levels[3];
  return { score, ...result };
};

// ---- Password Strength Bar ----
const PasswordStrengthBar = ({ password }) => {
  const { score, label, level } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={styles.strengthBar}>
      <div className={styles.strengthTrack}>
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`${styles.strengthSegment} ${
              score >= segment ? `${styles.active} ${styles[level]}` : ""
            }`}
          />
        ))}
      </div>
      <span className={`${styles.strengthLabel} ${styles[level]}`}>
        {label}
      </span>
    </div>
  );
};

// ---- Register Page ----
const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // Watch password for strength bar
  const password = watch("password", "");

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const response = await register(data).unwrap();
      const { user, accessToken } = response.data;

      dispatch(setCredentials({ user, accessToken }));
      toast.success(`Welcome to SocialHub, ${user.username}!`);
      navigate("/");
    } catch (error) {
      setServerError(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>Create account</h2>
        <p className={styles.subtitle}>Join SocialHub today</p>
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
        {/* Full Name + Username row */}
        <div className={styles.nameRow}>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.fullName?.message}
            autoComplete="name"
            autoFocus
            {...registerField("fullName")}
          />
          <Input
            label="Username"
            type="text"
            placeholder="johndoe"
            error={errors.username?.message}
            autoComplete="username"
            {...registerField("username")}
          />
        </div>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          autoComplete="email"
          {...registerField("email")}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            error={errors.password?.message}
            autoComplete="new-password"
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
            {...registerField("password")}
          />
          <PasswordStrengthBar password={password} />
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} size="lg">
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        {/* Terms */}
        <p className={styles.terms}>
          By signing up, you agree to our <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>
        </p>
      </form>

      {/* Login link */}
      <p className={styles.bottomLink}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;

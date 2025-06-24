import { useState } from 'react';

export interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export const useRegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validation states
  const [nameValid, setNameValid] = useState<boolean | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-gray-400'
  });

  // Name validation
  const validateName = (name: string) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation and strength calculation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let score = 0;
    const feedback: string[] = [];

    if (minLength) score += 1;
    else feedback.push('At least 8 characters');

    if (hasUpperCase) score += 1;
    else feedback.push('One uppercase letter');

    if (hasLowerCase) score += 1;
    else feedback.push('One lowercase letter');

    if (hasNumbers) score += 1;
    else feedback.push('One number');

    if (hasSpecialChar) score += 1;
    else feedback.push('One special character');

    let color = 'text-red-500';
    if (score >= 4) color = 'text-green-500';
    else if (score >= 3) color = 'text-yellow-500';
    else if (score >= 2) color = 'text-orange-500';

    setPasswordStrength({ score, feedback, color });
    return score >= 3; // At least 3 criteria met
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword: string) => {
    return confirmPassword === password && confirmPassword.length > 0;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value) {
      setNameValid(validateName(value));
    } else {
      setNameValid(null);
    }
    setError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setEmailValid(validateEmail(value));
    } else {
      setEmailValid(null);
    }
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      setPasswordValid(validatePassword(value));
      // Re-validate confirm password when password changes
      if (confirmPassword) {
        setConfirmPasswordValid(validateConfirmPassword(confirmPassword));
      }
    } else {
      setPasswordValid(null);
      setPasswordStrength({ score: 0, feedback: [], color: 'text-gray-400' });
    }
    setError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value) {
      setConfirmPasswordValid(validateConfirmPassword(value));
    } else {
      setConfirmPasswordValid(null);
    }
    setError('');
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    setError('');
    setSuccess('');
    setNameValid(null);
    setEmailValid(null);
    setPasswordValid(null);
    setConfirmPasswordValid(null);
    setPasswordStrength({ score: 0, feedback: [], color: 'text-gray-400' });
  };

  const isFormValid = nameValid && emailValid && passwordValid && confirmPasswordValid && name && email && password && confirmPassword;

  return {
    name,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    isLoading,
    error,
    success,
    nameValid,
    emailValid,
    passwordValid,
    confirmPasswordValid,
    passwordStrength,
    setShowPassword,
    setShowConfirmPassword,
    setIsLoading,
    setError,
    setSuccess,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    validateName,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    resetForm,
    isFormValid,
  };
}; 
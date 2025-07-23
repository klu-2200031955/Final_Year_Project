/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Package, Eye, EyeOff, Phone, Mail, Lock, UserSquare } from 'lucide-react';

const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, error }) => (
  <div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
      />
    </div>
    {error && <p className="text-red-600 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

const PasswordField = ({ icon: Icon, name, placeholder, value, onChange, error, isVisible, onToggleVisibility }) => (
  <div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={isVisible ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
      />
      <button type="button" onClick={onToggleVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isVisible ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
      </button>
    </div>
    {error && <p className="text-red-600 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

const SignUp = ({
  onSignUp,
  onSwitchToLogin,
  pendingConfirmation,
  confirmationCode,
  setConfirmationCode,
  handleConfirmSignUp,
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        localStorage.setItem('signup_email', formData.email); // Save it during sign-up
        await onSignUp(formData);
      } catch (error) {
        setErrors({ submit: error.message || 'Sign up failed.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full">
            <Package className="h-8 w-8 text-white" />
          </div>
        </div>

        {pendingConfirmation ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4">Confirm Your Email</h2>
            <p className="text-gray-600 text-sm text-center mb-6">
              We've sent a verification code to <strong>{pendingConfirmation}</strong>.
            </p>
            <input
              type="text"
              placeholder="Enter verification code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleConfirmSignUp(confirmationCode)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Confirm
            </button>
            <p className="text-center text-sm text-gray-600 mt-8">
              Didn’t receive the code?{' '}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => onSignUp({ email: pendingConfirmation })}
              >
                Resend
              </span>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
              <p className="text-gray-500 mt-2">Join us to manage your inventory seamlessly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField icon={UserSquare} type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} error={errors.name} />
                <InputField icon={Mail} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} error={errors.email} />
                <InputField icon={Phone} type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} error={errors.phone} />
                <PasswordField icon={Lock} name="password" placeholder="Password" value={formData.password} onChange={handleChange} error={errors.password} isVisible={showPass} onToggleVisibility={() => setShowPass(!showPass)} />
                <PasswordField icon={Lock} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} isVisible={showConfirmPass} onToggleVisibility={() => setShowConfirmPass(!showConfirmPass)} />

                {errors.submit && <p className="text-sm text-red-600 text-center">{errors.submit}</p>}

                <button type="submit" disabled={loading} className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-600 mt-8">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:underline">
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;

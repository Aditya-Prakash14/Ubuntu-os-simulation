"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, type RegisterData } from '@/contexts/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Calendar,
  AlertCircle, 
  Loader2,
  Check,
  X
} from 'lucide-react'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  
  const { register, isLoading } = useAuth()

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return value.length < 2 ? 'Must be at least 2 characters' : ''
      case 'username':
        return value.length < 3 ? 'Must be at least 3 characters' : 
               !/^[a-zA-Z0-9_]+$/.test(value) ? 'Only letters, numbers, and underscores' : ''
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : ''
      case 'phoneNumber':
        return !/^\+?[\d\s\-\(\)]+$/.test(value) ? 'Invalid phone number format' : ''
      case 'password':
        return value.length < 6 ? 'Must be at least 6 characters' : 
               !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value) ? 'Must contain uppercase, lowercase, and number' : ''
      case 'confirmPassword':
        return value !== formData.password ? 'Passwords do not match' : ''
      case 'dateOfBirth':
        const age = new Date().getFullYear() - new Date(value).getFullYear()
        return age < 13 ? 'Must be at least 13 years old' : ''
      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    const fieldError = validateField(field, value)
    setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
    
    if (error) setError('')
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.username && 
                 !fieldErrors.firstName && !fieldErrors.lastName && !fieldErrors.username)
      case 2:
        return !!(formData.email && formData.phoneNumber && formData.dateOfBirth &&
                 !fieldErrors.email && !fieldErrors.phoneNumber && !fieldErrors.dateOfBirth)
      case 3:
        return !!(formData.password && formData.confirmPassword && formData.agreeToTerms &&
                 !fieldErrors.password && !fieldErrors.confirmPassword)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Final validation
    const errors: { [key: string]: string } = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'agreeToTerms') {
        const error = validateField(key, formData[key as keyof RegisterData] as string)
        if (error) errors[key] = error
      }
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Please fix the errors above')
      return
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    const result = await register(formData)
    if (!result.success) {
      setError(result.error || 'Registration failed')
    }
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Personal Information</h3>
        <p className="text-white/60 text-sm">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-white/80 text-xs font-medium">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="John"
              className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
                fieldErrors.firstName ? 'border-red-400' : ''
              }`}
            />
          </div>
          {fieldErrors.firstName && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <X className="w-3 h-3" />
              {fieldErrors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-white/80 text-xs font-medium">Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Doe"
              className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
                fieldErrors.lastName ? 'border-red-400' : ''
              }`}
            />
          </div>
          {fieldErrors.lastName && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <X className="w-3 h-3" />
              {fieldErrors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-white/80 text-xs font-medium">Username</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="johndoe"
            className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
              fieldErrors.username ? 'border-red-400' : formData.username && !fieldErrors.username ? 'border-green-400' : ''
            }`}
          />
          {formData.username && !fieldErrors.username && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
          )}
        </div>
        {fieldErrors.username && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <X className="w-3 h-3" />
            {fieldErrors.username}
          </p>
        )}
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Contact Information</h3>
        <p className="text-white/60 text-sm">How can we reach you?</p>
      </div>

      <div className="space-y-1">
        <label className="text-white/80 text-xs font-medium">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john@example.com"
            className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
              fieldErrors.email ? 'border-red-400' : formData.email && !fieldErrors.email ? 'border-green-400' : ''
            }`}
          />
          {formData.email && !fieldErrors.email && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
          )}
        </div>
        {fieldErrors.email && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <X className="w-3 h-3" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-white/80 text-xs font-medium">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
              fieldErrors.phoneNumber ? 'border-red-400' : formData.phoneNumber && !fieldErrors.phoneNumber ? 'border-green-400' : ''
            }`}
          />
          {formData.phoneNumber && !fieldErrors.phoneNumber && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
          )}
        </div>
        {fieldErrors.phoneNumber && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <X className="w-3 h-3" />
            {fieldErrors.phoneNumber}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-white/80 text-xs font-medium">Date of Birth</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
              fieldErrors.dateOfBirth ? 'border-red-400' : formData.dateOfBirth && !fieldErrors.dateOfBirth ? 'border-green-400' : ''
            }`}
          />
          {formData.dateOfBirth && !fieldErrors.dateOfBirth && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
          )}
        </div>
        {fieldErrors.dateOfBirth && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <X className="w-3 h-3" />
            {fieldErrors.dateOfBirth}
          </p>
        )}
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Security</h3>
        <p className="text-white/60 text-sm">Create a secure password</p>
      </div>

      <div className="space-y-1">
        <label className="text-white/80 text-xs font-medium">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create password"
            className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
              fieldErrors.password ? 'border-red-400' : formData.password && !fieldErrors.password ? 'border-green-400' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <X className="w-3 h-3" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-white/80 text-xs font-medium">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm password"
            className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-lg h-10 text-sm ${
              fieldErrors.confirmPassword ? 'border-red-400' : formData.confirmPassword && !fieldErrors.confirmPassword ? 'border-green-400' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <X className="w-3 h-3" />
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
            className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/20"
          />
          <span className="text-white/70 text-xs leading-relaxed">
            I agree to the{' '}
            <button type="button" className="text-blue-400 hover:text-blue-300 underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-blue-400 hover:text-blue-300 underline">
              Privacy Policy
            </button>
          </span>
        </label>
      </div>
    </motion.div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              step === currentStep
                ? 'bg-blue-500 text-white'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-white/60'
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-200 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl py-3"
          >
            Back
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isLoading || !isStepValid(3)}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        )}
      </div>

      {/* Switch to Login */}
      <div className="text-center">
        <span className="text-white/70 text-sm">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          disabled={isLoading}
        >
          Sign in
        </button>
      </div>
    </form>
  )
}

export default RegisterForm

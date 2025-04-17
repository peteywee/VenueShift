import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Lock, Unlock, User, Mail, EyeOff, Eye, Key, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Login form state
  const [loginCredentials, setLoginCredentials] = useState({
    username: '',
    password: '',
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  
  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle register form changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    
    // Check password strength if password field is changed
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }
    
    let strength = 0;
    let feedback = 'Weak password';
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Set feedback based on strength
    if (strength === 1) feedback = 'Very weak password';
    else if (strength === 2) feedback = 'Weak password';
    else if (strength === 3) feedback = 'Medium strength password';
    else if (strength === 4) feedback = 'Strong password';
    else if (strength === 5) feedback = 'Very strong password';
    
    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };
  
  // Handle login submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate login credentials
    if (!loginCredentials.username || !loginCredentials.password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Mock login success after 1 second
    setTimeout(() => {
      toast({
        title: 'Demo Login',
        description: 'In a real app, this would authenticate with the server',
      });
      setIsLoading(false);
      navigate('/demo-dashboard');
    }, 1000);
  };
  
  // Handle register submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate registration data
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Password and confirmation do not match',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    if (passwordStrength < 3) {
      toast({
        title: 'Weak Password',
        description: 'Please choose a stronger password',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Mock registration success after 1 second
    setTimeout(() => {
      toast({
        title: 'Demo Registration',
        description: 'Account created! In a real app, this would register a new user.',
      });
      setIsLoading(false);
      navigate('/demo-dashboard');
    }, 1000);
  };
  
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-8">
      <Button variant="ghost" className="absolute top-4 left-4 gap-2" onClick={() => navigate('/demo-dashboard')}>
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[480px] max-w-[95vw]">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Authentication Demo</h1>
          <p className="text-sm text-muted-foreground">
            This demonstrates the login and registration process
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <Card>
              <form onSubmit={handleLoginSubmit}>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <Input 
                        id="login-username" 
                        name="username"
                        placeholder="Enter your username"
                        className="pl-10"
                        value={loginCredentials.username}
                        onChange={handleLoginChange}
                        autoComplete="username"
                      />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Button variant="link" className="p-0 h-auto text-xs" type="button">
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input 
                        id="login-password" 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginCredentials.password}
                        onChange={handleLoginChange}
                        autoComplete="current-password"
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 
                          <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember-me"
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                    />
                    <Label htmlFor="remember-me" className="text-sm font-normal">
                      Remember me for 30 days
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4" />
                        <span>Login</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Register Form */}
          <TabsContent value="register">
            <Card>
              <form onSubmit={handleRegisterSubmit}>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your details to register a new account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <div className="relative">
                      <Input 
                        id="register-username" 
                        name="username"
                        placeholder="Choose a username"
                        className="pl-10"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        autoComplete="username"
                      />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email Address</Label>
                    <div className="relative">
                      <Input 
                        id="register-email" 
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        autoComplete="email"
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="register-password" 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        autoComplete="new-password"
                      />
                      <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 
                          <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {registerData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1.5 mt-1.5 mb-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div 
                              key={level}
                              className={cn(
                                "h-full flex-1 rounded-full transition-colors",
                                passwordStrength >= level 
                                  ? level <= 2 
                                    ? "bg-red-500" 
                                    : level <= 3 
                                      ? "bg-yellow-500" 
                                      : "bg-green-500"
                                  : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                        <p className={cn(
                          "text-xs",
                          passwordStrength <= 2 ? "text-red-500" : 
                          passwordStrength === 3 ? "text-yellow-500" : 
                          "text-green-500"
                        )}>
                          {passwordFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input 
                        id="register-confirm-password" 
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        autoComplete="new-password"
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      
                      {/* Password match indicator */}
                      {registerData.password && registerData.confirmPassword && (
                        registerData.password === registerData.confirmPassword ? (
                          <Check className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    By clicking Register, you agree to our{' '}
                    <Button variant="link" className="p-0 h-auto" type="button">
                      Terms of Service
                    </Button>{' '}
                    and{' '}
                    <Button variant="link" className="p-0 h-auto" type="button">
                      Privacy Policy
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        <span>Register</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Demo Account Credentials</p>
          <div className="mt-2 text-xs bg-muted p-2 rounded-md inline-block">
            <div><strong>Username:</strong> demo_user</div>
            <div><strong>Password:</strong> password123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
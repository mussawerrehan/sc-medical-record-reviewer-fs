import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Building, Shield } from 'lucide-react';
import axios from 'axios';

interface LoginScreenProps {
  onLogin: (tenant: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<'login' | 'tenant'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tenants = [
    { id: 'sunshine-medical', name: 'Sunshine Medical Center', location: 'Phoenix, AZ' },
    { id: 'riverside-health', name: 'Riverside Health System', location: 'Richmond, VA' },
    { id: 'metro-general', name: 'Metro General Hospital', location: 'Denver, CO' }
  ];

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      if (response.data.user) {
        setStep('tenant');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantSelection = () => {
    if (!selectedTenant) {
      setError('Please select a facility');
      return;
    }
    onLogin(selectedTenant);
  };

  if (step === 'tenant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Select Facility</CardTitle>
              <CardDescription>
                Choose the healthcare facility you want to access
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant">Healthcare Facility</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your facility..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      <div className="flex flex-col">
                        <span>{tenant.name}</span>
                        <span className="text-sm text-muted-foreground">{tenant.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button 
              onClick={handleTenantSelection} 
              className="w-full h-12"
              disabled={isLoading}
            >
              Continue to SmartCycleAI
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setStep('login')} 
              className="w-full h-12"
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">SmartCycleAI</CardTitle>
            <CardDescription>
              Medical Record Review System
              <br />
              Please sign in to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button 
            onClick={handleLogin} 
            className="w-full h-12"
            disabled={isLoading}
          >
            Sign In
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Demo credentials: demo / SmartCyclePass
          </div>

          <div className="pt-4 border-t text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              HIPAA Compliant & Secure
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
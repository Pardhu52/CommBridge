"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth"
import { auth } from "../../lib/firebase" // Corrected import path

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, KeyRound, Loader2, Mail, Phone } from "lucide-react"
import Link from "next/link"

// This is to safely attach Firebase objects to the window for the reCAPTCHA to work
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
    confirmationResult?: ConfirmationResult
  }
}

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // This effect sets up the invisible reCAPTCHA verifier required for phone authentication
  useEffect(() => {
    if (authMethod === 'phone' && step === 'credentials' && !window.recaptchaVerifier) {
       // Clear any previous verifier to prevent errors on re-render
      if (document.getElementById('recaptcha-container')?.innerHTML) {
          document.getElementById('recaptcha-container')!.innerHTML = '';
      }
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          'size': 'invisible',
          'callback': () => { console.log("reCAPTCHA solved") }
        });
        window.recaptchaVerifier.render().catch(err => console.error("Recaptcha render error:", err));
      } catch(e) {
         console.error("Error creating RecaptchaVerifier", e)
      }
    }
  }, [authMethod, step]);

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) return setError("Please enter both email and password.");
    
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard"; // Redirect to dashboard on successful login
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setError("Invalid email or password. Please try again.");
      } else {
        setError(`Failed to sign in: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!phoneNumber.trim().match(/^\+[1-9]\d{1,14}$/)) return setError("Please enter a valid phone number with country code (e.g., +919876543210).");
    
    setLoading(true); setError("");
    try {
      const verifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setStep("otp");
    } catch (err: any) {
       if (err.code === 'auth/too-many-requests') setError("Too many requests. Please try again later.");
       else setError(`Failed to send OTP. Please try again.`);
       console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return setError("Please enter the 6-digit OTP.");
    
    setLoading(true); setError("");
    try {
      const confirmationResult = window.confirmationResult!;
      await confirmationResult.confirm(otp);
      window.location.href = "/dashboard"; // Redirect to dashboard on successful login
    } catch (err: any) {
      setError(`Failed to verify OTP. Please check the code and try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'otp') {
      handleVerifyOTP();
    } else if (authMethod === 'email') {
      handleEmailSignIn();
    } else {
      handlePhoneSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{step === 'otp' ? 'Verify Your Number' : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {step === 'otp' ? `We sent a code to ${phoneNumber}` : 'Sign in to your CommBridge account'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 'credentials' ? (
                <Tabs value={authMethod} onValueChange={(value) => { setAuthMethod(value); setError(""); setStep("credentials"); }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Email</TabsTrigger>
                    <TabsTrigger value="phone"><Phone className="w-4 h-4 mr-2" /> Phone</TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="space-y-4 pt-4">
                    <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}/></div>
                    <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}/></div>
                  </TabsContent>
                  <TabsContent value="phone" className="space-y-4 pt-4">
                    <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={loading}/></div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-2"><Label htmlFor="otp">Verification Code</Label><Input id="otp" type="text" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} maxLength={6}/></div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                {loading ? 'Processing...' : (step === 'otp' ? 'Verify & Sign In' : 'Continue')}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


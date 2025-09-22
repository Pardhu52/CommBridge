"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { updateProfile, updatePassword } from "firebase/auth"
import { Skeleton } from "../../components/ui/skeleton"
import { Button } from "../../components/ui/button"
import { signOut } from "firebase/auth"
import { auth } from "../../lib/firebase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

export default function SettingsPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Basic password strength calculator: returns 0-100
  const calcStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    const lengthScore = Math.min(10, pwd.length) * 6; // up to 60
    score += lengthScore;
    if (/[a-z]/.test(pwd)) score += 10;
    if (/[A-Z]/.test(pwd)) score += 10;
    if (/[0-9]/.test(pwd)) score += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 10;
    return Math.min(100, score);
  };

  const strength = calcStrength(newPass);
  const strengthLabel = strength < 40 ? "Weak" : strength < 70 ? "Medium" : "Strong";
  const strengthColor = strength < 40 ? "bg-red-500" : strength < 70 ? "bg-yellow-500" : "bg-green-600";

  const handlePasswordUpdate = async () => {
    if (!newPass || newPass.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Please enter at least 6 characters.",
      });
      return;
    }
    if (newPass !== confirmPass) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Make sure both password fields are the same.",
      });
      return;
    }
    if (!auth.currentUser) {
      toast({ variant: "destructive", title: "Not signed in", description: "Please sign in again." });
      router.push("/login");
      return;
    }
    setPassLoading(true);
    try {
      await updatePassword(auth.currentUser, newPass);
      setNewPass("");
      setConfirmPass("");
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
    } catch (err: any) {
      if (err?.code === "auth/requires-recent-login") {
        toast({
          variant: "destructive",
          title: "Please sign in again",
          description: "For security reasons, reauthenticate to change your password.",
        });
        router.push("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Failed to update password",
          description: err?.message || "Try again later.",
        });
        console.error("Update password error", err);
      }
    } finally {
      setPassLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div className="p-6"><Skeleton className="h-10 w-40" /></div>;
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <section className="space-y-3">
              <h3 className="font-medium">Profile</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Name</Label><Input defaultValue={userData?.name || ""} onBlur={async (e) => { try { await updateProfile(auth.currentUser!, { displayName: e.target.value }); } catch {} }} /></div>
                <div className="space-y-1"><Label>Email</Label><Input value={userData?.email || auth.currentUser?.email || ""} readOnly /></div>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="font-medium">Password</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>New password</Label>
                  <Input value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" placeholder="••••••••" />
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Password strength</span>
                      <span className={strength < 40 ? 'text-red-600' : strength < 70 ? 'text-yellow-600' : 'text-green-600'}>{strengthLabel}</span>
                    </div>
                    <Progress value={strength} className="h-2" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Confirm password</Label>
                  <Input value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} type="password" placeholder="••••••••" />
                  {confirmPass && newPass !== confirmPass && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                  <div className="pt-3">
                    <Button onClick={handlePasswordUpdate} disabled={passLoading || !newPass || newPass !== confirmPass}>
                      {passLoading ? 'Updating…' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="font-medium">Session</h3>
              <Button variant="outline" onClick={handleLogout}>Log out</Button>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Building, MapPin, Users, ArrowRight, Loader2 } from "lucide-react"

export default function CommunitySetupPage() {
  const [step, setStep] = useState<"type" | "location" | "finding">("type")
  const [communityType, setCommunityType] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleCommunityTypeSubmit = () => {
    if (!communityType) return
    setStep("location")
  }

  const handleLocationSetup = () => {
    setStep("finding")
    setLoading(true)

    // Simulate community discovery process
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1000)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const communityTypes = [
    {
      id: "apartment",
      label: "Apartment/Building",
      description: "Connect with neighbors in your building",
      icon: Building,
    },
    {
      id: "street",
      label: "Street/Neighborhood",
      description: "Connect with people on your street",
      icon: MapPin,
    },
    {
      id: "office",
      label: "Office/Workplace",
      description: "Connect with colleagues in your office",
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {step === "type" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What type of community are you joining?</CardTitle>
              <CardDescription>This helps us find the right neighbors for you</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={communityType} onValueChange={setCommunityType} className="space-y-4">
                {communityTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={type.id} id={type.id} />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <type.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor={type.id} className="text-base font-medium cursor-pointer">
                          {type.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <Button onClick={handleCommunityTypeSubmit} className="w-full mt-6" disabled={!communityType}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "location" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Enable Location Access</CardTitle>
              <CardDescription>
                We need your location to find your community and verify you belong there
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">How we use your location:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Find others in your {communityType === "apartment" ? "building" : communityType}</li>
                  <li>• Verify you actually live/work there</li>
                  <li>• Create secure community boundaries</li>
                  <li>• Prevent outsiders from joining</li>
                </ul>
              </div>

              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Your exact location is never shared with other members. We only use it to group you with the right
                  community.
                </AlertDescription>
              </Alert>

              <Button onClick={handleLocationSetup} className="w-full">
                Enable Location & Find My Community
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "finding" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Finding Your Community</CardTitle>
              <CardDescription>
                We're analyzing your location and connecting you with verified neighbors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm">Analyzing your location...</span>
                </div>
                {progress > 30 && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm">Finding nearby communities...</span>
                  </div>
                )}
                {progress > 60 && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm">Verifying community boundaries...</span>
                  </div>
                )}
                {progress > 90 && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm">Setting up your profile...</span>
                  </div>
                )}
              </div>

              {progress === 100 && (
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>Community found! Redirecting to your dashboard...</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

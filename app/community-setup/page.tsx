    "use client"

    import { useState } from "react"
    import { useAuth } from "../../context/AuthContext" // Corrected import path
    import { db } from "../../lib/firebase" // Corrected import path
    import { doc, updateDoc, GeoPoint } from "firebase/firestore"
    import { Button } from "@/components/ui/button"
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
    import { Label } from "@/components/ui/label"
    import { Alert, AlertDescription } from "@/components/ui/alert"
    import { Progress } from "@/components/ui/progress"
    import { Building, MapPin, Users, ArrowRight, Loader2 } from "lucide-react"

    // --- NEW FUNCTION TO GET ADDRESS FROM COORDINATES ---
    async function getAddressFromCoordinates(latitude: number, longitude: number) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
          const addressComponents = data.results[0].address_components;
          const formattedAddress = data.results[0].formatted_address;

          // Helper function to extract address parts
          const getAddressComponent = (type: string) => {
            const component = addressComponents.find((c: any) => c.types.includes(type));
            return component ? component.long_name : '';
          };
          
          const address = {
            full: formattedAddress,
            street: getAddressComponent('route') || getAddressComponent('point_of_interest'),
            neighborhood: getAddressComponent('neighborhood') || getAddressComponent('sublocality'),
            city: getAddressComponent('locality') || getAddressComponent('administrative_area_level_2'),
            district: getAddressComponent('administrative_area_level_2'),
            state: getAddressComponent('administrative_area_level_1'),
            country: getAddressComponent('country'),
            postalCode: getAddressComponent('postal_code'),
          };

          return address;
        } else {
          console.error("Geocoding API error:", data.status);
          return null;
        }
      } catch (error) {
        console.error("Failed to fetch address:", error);
        return null;
      }
    }

    export default function CommunitySetupPage() {
      const { user } = useAuth();
      const [step, setStep] = useState<"type" | "location" | "finding">("type")
      const [communityType, setCommunityType] = useState("")
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState("")
      const [progress, setProgress] = useState(0)
      const [progressText, setProgressText] = useState("Analyzing your location...")

      const handleCommunityTypeSubmit = () => {
        if (!communityType) return;
        setStep("location");
      }

      const handleLocationSetup = () => {
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          return;
        }

        setLoading(true);
        setError("");

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            if (user) {
              try {
                // --- FETCH THE ADDRESS ---
                const addressDetails = await getAddressFromCoordinates(latitude, longitude);

                if (!addressDetails) {
                    setError("Could not determine your address from the location. Please try again.");
                    setLoading(false);
                    return;
                }

                // --- UPDATE FIRESTORE WITH NEW ADDRESS DATA ---
                const userDocRef = doc(db, "users", user.uid);
                await updateDoc(userDocRef, {
                  communityType: communityType,
                  location: new GeoPoint(latitude, longitude),
                  address: addressDetails, // Save the full address object
                  status: "pending_verification",
                });
                
                setStep("finding");
                simulateCommunityDiscovery();

              } catch (err) {
                console.error("Error updating document: ", err);
                setError("Could not save your location data. Please try again.");
                setLoading(false);
              }
            } else {
              setError("You are not logged in. Please log in and try again.");
              setLoading(false);
            }
          },
          (error) => {
            setError("Could not get your location. Please grant permission and try again.");
            setLoading(false);
          }
        );
      }

      const simulateCommunityDiscovery = () => {
        // ... (simulation logic remains the same)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 10;
            if (newProgress > 30) setProgressText("Finding nearby communities...");
            if (newProgress > 60) setProgressText("Verifying community boundaries...");
            if (newProgress > 90) setProgressText("Setting up your profile...");

            if (newProgress >= 100) {
              clearInterval(progressInterval);
              setProgressText("Community found! Redirecting...");
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 1000);
              return 100;
            }
            return newProgress;
          });
        }, 300);
      }
      
      const communityTypes = [
        { id: "apartment", label: "Apartment/Building", description: "Connect with neighbors in your building", icon: Building },
        { id: "street", label: "Street/Neighborhood", description: "Connect with people on your street", icon: MapPin },
        { id: "office", label: "Office/Workplace", description: "Connect with colleagues in your office", icon: Users },
      ];

      // JSX for rendering the page remains largely the same
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

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
                          <div><Label htmlFor={type.id} className="text-base font-medium cursor-pointer">{type.label}</Label><p className="text-sm text-muted-foreground">{type.description}</p></div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button onClick={handleCommunityTypeSubmit} className="w-full mt-6" disabled={!communityType}><ArrowRight className="w-4 h-4 mr-2" /> Continue</Button>
                </CardContent>
              </Card>
            )}

            {step === "location" && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Enable Location Access</CardTitle>
                  <CardDescription>We need your location to find your community and verify you belong there</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg"><h3 className="font-medium mb-2">How we use your location:</h3><ul className="text-sm text-muted-foreground space-y-1"><li>• Find others in your {communityType}</li><li>• Verify you actually live/work there</li><li>• Create secure community boundaries</li></ul></div>
                  <Alert><MapPin className="h-4 w-4" /><AlertDescription>Your exact location is never shared with other members. We only use it for verification.</AlertDescription></Alert>
                  <Button onClick={handleLocationSetup} className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                    {loading ? "Getting Location..." : "Enable Location & Find My Community"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "finding" && (
                <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Finding Your Community</CardTitle>
                    <CardDescription>We're analyzing your location and connecting you with verified neighbors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><div className="flex justify-between text-sm"><span>Progress</span><span>{progress}%</span></div><Progress value={progress} className="w-full" /></div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3"><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-sm">{progressText}</span></div>
                    </div>
                    {progress >= 100 && <Alert><Users className="h-4 w-4" /><AlertDescription>Redirecting to your dashboard...</AlertDescription></Alert>}
                </CardContent>
                </Card>
            )}
          </div>
        </div>
      )
    }


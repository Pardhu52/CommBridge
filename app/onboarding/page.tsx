"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // adjust import to your firebase config

export default function OnboardingPage() {
  const [communityType, setCommunityType] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function getLocationAndSave() {
    if (!communityType) {
      alert("Please select Street / Apartment / Office");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Not logged in");
        return;
      }

      // Get GPS
      const pos: GeolocationPosition = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Reverse Geocode using OpenStreetMap API
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();

      const streetName = data.address.road || data.address.neighbourhood || "Unknown Street";
      const buildingName = data.address.building || data.address.suburb || null;

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        phone: user.phoneNumber,
        communityType,
        location: {
          lat,
          lng,
          streetName,
          buildingName,
        },
        verified: false,
      });

      router.push("/home"); // redirect after onboarding
    } catch (err) {
      console.error(err);
      alert("Error getting location");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Join Your Community</h1>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          className={`p-3 rounded-xl border ${communityType==="apartment"?"bg-blue-500 text-white":""}`}
          onClick={() => setCommunityType("apartment")}
        >
          🏠 Apartment / Hostel
        </button>

        <button
          className={`p-3 rounded-xl border ${communityType==="street"?"bg-blue-500 text-white":""}`}
          onClick={() => setCommunityType("street")}
        >
          🛣️ Street
        </button>

        <button
          className={`p-3 rounded-xl border ${communityType==="office"?"bg-blue-500 text-white":""}`}
          onClick={() => setCommunityType("office")}
        >
          🏢 Office
        </button>
      </div>

      <button
        onClick={getLocationAndSave}
        disabled={loading}
        className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
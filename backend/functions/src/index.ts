    import { onDocumentWritten } from "firebase-functions/v2/firestore";
    import { onCall, HttpsError } from "firebase-functions/v2/https";
    import * as logger from "firebase-functions/logger";
    import * as admin from "firebase-admin";
    import { GeoPoint } from "firebase-admin/firestore";
    import { distanceBetween, geohashForLocation, geohashQueryBounds } from "geofire-common";

    admin.initializeApp();
    const db = admin.firestore();

    // --- FUNCTION 1: Find or Create Community ---
    export const findOrCreateCommunityForUser = onDocumentWritten({ document: "users/{userId}", region: "asia-south1" }, async (event) => {
        if (!event.data?.after.exists) { return; }
        const newData = event.data.after.data();
        const userId = event.params.userId;
        if (newData?.status !== "pending_verification" || !newData.location) { return; }
        logger.info(`User ${userId} has status 'pending_verification'. Starting community search.`);
        const { latitude, longitude } = newData.location as GeoPoint;
        const userLocation: [number, number] = [latitude, longitude];
        const searchRadiusInKm = 1;
        const bounds = geohashQueryBounds(userLocation, searchRadiusInKm * 1000);
        const promises = bounds.map(b => db.collection("communities").orderBy("geohash").startAt(b[0]).endAt(b[1]).get());
        const snapshots = await Promise.all(promises);
        const matchingCommunities: { id: string, data: admin.firestore.DocumentData }[] = [];
        snapshots.forEach(snap => {
            snap.docs.forEach(doc => {
                const communityData = doc.data();
                if (communityData.location) {
                    const communityLocation: [number, number] = [(communityData.location as GeoPoint).latitude, (communityData.location as GeoPoint).longitude];
                    if (distanceBetween(userLocation, communityLocation) <= searchRadiusInKm && communityData.type === newData.communityType) {
                        matchingCommunities.push({ id: doc.id, data: communityData });
                    }
                }
            });
        });
        const userDocRef = db.collection("users").doc(userId);
        if (matchingCommunities.length > 0) {
            const communityToJoin = matchingCommunities[0];
            logger.info(`User ${userId} is joining existing community ${communityToJoin.id}.`);
            await userDocRef.update({ status: "pending_approval", communityId: communityToJoin.id });
        } else {
            logger.info(`No communities found for user ${userId}. Creating a new one.`);
            const geohash = geohashForLocation(userLocation);
            const newCommunity = await db.collection("communities").add({
                name: newData.address.neighborhood || newData.address.street || "New Community",
                type: newData.communityType, location: new GeoPoint(latitude, longitude),
                geohash: geohash, createdAt: admin.firestore.FieldValue.serverTimestamp(), memberCount: 1,
            });
            await userDocRef.update({ status: "verified", communityId: newCommunity.id });
        }
    });

    // --- FUNCTION 2: Review User Application ---
    export const reviewUserApplication = onCall({ region: "asia-south1" }, async (request) => {
        if (!request.auth) { throw new HttpsError("unauthenticated", "You must be logged in."); }
        const { targetUserId, action } = request.data;
        if (!targetUserId || !action) { throw new HttpsError("invalid-argument", "Missing parameters."); }
        const verifierUid = request.auth.uid;
        const verifierDoc = await db.collection("users").doc(verifierUid).get();
        const targetUserDoc = await db.collection("users").doc(targetUserId).get();
        if (!verifierDoc.exists || !targetUserDoc.exists) { throw new HttpsError("not-found", "User not found."); }
        const verifierData = verifierDoc.data()!;
        const targetUserData = targetUserDoc.data()!;
        if (verifierData.status !== "verified" || verifierData.communityId !== targetUserData.communityId) { throw new HttpsError("permission-denied", "Permission denied."); }
        if (targetUserData.status !== "pending_approval") { throw new HttpsError("failed-precondition", "User is not pending approval."); }
        if (action === "approve") {
            await db.collection("users").doc(targetUserId).update({ status: "verified" });
            const communityDocRef = db.collection("communities").doc(verifierData.communityId);
            await communityDocRef.update({ memberCount: admin.firestore.FieldValue.increment(1) });
            return { success: true, message: "User approved." };
        } else if (action === "reject") {
            await db.collection("users").doc(targetUserId).update({ status: "rejected" });
            return { success: true, message: "User rejected." };
        } else { throw new HttpsError("invalid-argument", "Invalid action."); }
    });

    // --- FUNCTION 3: Securely Call the Gemini API ---
    export const callGeminiApiProxy = onCall({ region: "asia-south1", secrets: ["GOOGLE_MAPS_API_KEY"] }, async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "You must be logged in to use this feature.");
        }
        
        const { prompt, systemInstruction } = request.data;
        if (!prompt || !systemInstruction) {
            throw new HttpsError("invalid-argument", "A prompt and system instruction are required.");
        }

        // --- FIX: Correctly access the API key from the environment ---
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                logger.error("Gemini API Error Response:", await response.text());
                throw new HttpsError("internal", "The AI service failed to respond correctly.");
            }
            
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            return { success: true, response: text || "Sorry, I couldn't generate a response." };

        } catch (error) {
            logger.error("Error calling Gemini API:", error);
            throw new HttpsError("internal", "An unexpected error occurred while contacting the AI.");
        }
    });


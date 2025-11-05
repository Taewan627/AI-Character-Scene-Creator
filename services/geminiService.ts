
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";

// Utility to convert data URL to Base64 and get mime type
const dataUrlToBlob = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const base64 = parts[1];
    return { base64, mimeType };
};

export const generateSynthesizedImage = async (
    mainCharacterUrl: string,
    clothingReferenceUrl: string,
    subCharacterUrl: string | null,
    movieEra: string,
    timeOfDay: string,
    crowdOption: string,
    backgroundDescription: string,
    mainCharacterAction: string,
    cameraZoom: string,
    cameraAngle: string,
    colorGrade: string,
    filmEffect: string,
    mainCharacterHairstyle: string,
    cameraPrompt: string,
    aspectRatio: string,
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const mainCharBlob = dataUrlToBlob(mainCharacterUrl);
    const clothingRefBlob = dataUrlToBlob(clothingReferenceUrl);

    const imageParts: Part[] = [
        { inlineData: { data: mainCharBlob.base64, mimeType: mainCharBlob.mimeType } },
        { inlineData: { data: clothingRefBlob.base64, mimeType: clothingRefBlob.mimeType } },
    ];
    
    // --- Prompt Generation: Descriptive Shot List ---
    const sourceElements: string[] = [];
    const sceneComposition: string[] = [];
    const cinematography: string[] = [];

    // 1. Source Elements
    sourceElements.push("*   **Image 1 (The Person):** Use the person from this image. It is critical to preserve their face, skin, and body shape exactly as they appear.");
    sourceElements.push("*   **Image 2 (The Outfit):** Use the complete outfit from this image. This outfit must fully replace any clothing on the person from Image 1.");
    if (subCharacterUrl) {
        const subCharBlob = dataUrlToBlob(subCharacterUrl);
        imageParts.push({ inlineData: { data: subCharBlob.base64, mimeType: subCharBlob.mimeType } });
        sourceElements.push("*   **Image 3 (The Companion):** Use the person from this image as the companion character.");
    }
    
    // 2. Scene Composition
    const actionMap: { [key: string]: string } = {
        walking: 'The Person is walking forward.',
        running: 'The Person is running.',
        kneeling: 'The Person is kneeling on one knee.',
        sitting_ground: 'The Person is sitting on the ground.',
        fallen_down: 'The Person is on the ground, having fallen, with a pained expression.',
        sleeping_in_chair: 'The Person is asleep in a chair, with their head tilted back.',
        facing_sub: 'The Person is standing, turned to face The Companion.',
    };
    sceneComposition.push(`*   **Action:** ${actionMap[mainCharacterAction] || 'The Person is standing still, looking towards the camera.'}`);
    
    let settingDesc = "Default setting.";
    if (backgroundDescription.trim()) {
        settingDesc = backgroundDescription.trim();
    } else if (crowdOption === 'with_crowd') {
        settingDesc = "A location with a crowd of people in the distance.";
    } else if (crowdOption === 'without_crowd') {
        settingDesc = "An empty location with no other people visible.";
    }
    sceneComposition.push(`*   **Setting:** ${settingDesc}`);
    
    const hairstyleMap: { [key: string]: string } = {
        ponytail: 'a sleek ponytail', short_bob: 'a sharp short bob', long_straight: 'long, straight hair',
        braid: 'a single braid', bun: 'an elegant bun', pixie_cut: 'a stylish pixie cut',
        hime_cut: 'a hime cut', twin_tails: 'twin-tails', half_up: 'a half-up, half-down style'
    };
    const hairstyleDesc = hairstyleMap[mainCharacterHairstyle]
        ? `The Person's hair is styled as ${hairstyleMap[mainCharacterHairstyle]}, maintaining its original color.`
        : "The Person's hair is styled to be very long and voluminous (Goddess Hair), maintaining its original color.";
    sceneComposition.push(`*   **Character Details:** ${hairstyleDesc}`);
    
    sceneComposition.push("*   **Legwear:** The Person is barefoot, with no shoes or hosiery.");

    // 3. Cinematography
    let shotType: string;
    if (cameraPrompt.trim()) {
        shotType = cameraPrompt.trim();
    } else {
        const zoomMap: { [key: string]: string } = {
            full_body: 'Full body shot', upper_body: 'Upper body shot (waist up)', bust: 'Bust shot (shoulders up)',
            close_up: 'Close-up on face', extreme_close_up: 'Extreme close-up on face'
        };
        const angleMap: { [key: string]: string } = {
            high_angle: 'from a high angle', face_highlight: 'at eye-level, focused on face', low_angle: 'from a low angle'
        };
        shotType = `${zoomMap[cameraZoom] || 'Medium shot'}, filmed ${angleMap[cameraAngle] || 'at eye-level'}.`;
    }
    cinematography.push(`*   **Shot Type:** ${shotType}`);

    const styleElements = [];
    if (movieEra !== 'default') styleElements.push(`the aesthetic of a ${movieEra} film`);
    if (timeOfDay !== 'default') styleElements.push(`${timeOfDay}time lighting`);
    if (colorGrade === 'cool_blue') styleElements.push('a cool, cyan color grade');
    if (colorGrade === 'warm_sepia') styleElements.push('a warm, sepia color grade');
    if (filmEffect === 'vhs') styleElements.push('a subtle VHS effect');
    if (styleElements.length > 0) {
        cinematography.push(`*   **Visual Style:** The image has ${styleElements.join(', ')}.`);
    }

    const aspectRatioMap: { [key:string]: string } = { 'portrait': '9:16', 'landscape': '16:9' };
    cinematography.push(`*   **Aspect Ratio:** ${aspectRatioMap[aspectRatio] || '1:1'}.`);

    // Assemble the final prompt
    const prompt = `
This is a detailed shot list for creating a single, photorealistic image.

**1. Source Elements:**
${sourceElements.join('\n')}

**2. Scene Composition:**
${sceneComposition.join('\n')}

**3. Cinematography:**
${cinematography.join('\n')}

**Final Image Requirements:**
*   Produce a single, coherent, high-quality photorealistic image.
*   Do not include any text, watermarks, or collage-like artifacts.
    `.trim();

    const allParts = [...imageParts, { text: prompt }];

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: allParts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    const feedback = response.promptFeedback;
    if (feedback?.blockReason) {
        throw new Error(`Image generation was blocked. Reason: ${feedback.blockReason}. ${feedback.blockReasonMessage || ''}`);
    }
    if (response.candidates?.[0]?.finishReason && response.candidates[0].finishReason !== 'STOP') {
         throw new Error(`Image generation failed. Reason: ${response.candidates[0].finishReason}`);
    }

    throw new Error("Image generation failed or the response did not contain an image.");
};

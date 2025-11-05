# AI Character Scene Creator

**AI Character Scene Creator** is a web application that leverages Google's powerful Gemini 2.5 Flash Image model to composite multiple images into a single, highly-detailed scene based on the user's precise directorial instructions.

This tool goes beyond simple image generation. It empowers you to act like a movie director, giving you control over the character's clothing, hairstyle, actions, background, and even the cinematography to create your own unique visuals.


---

## ✨ Key Features

*   **Character & Clothing Synthesis**: Upload a main character image and a clothing reference image to seamlessly dress your character in a new outfit.
*   **Sub-Character Integration**: Optionally add a sub-character to the scene to create interactions and more dynamic compositions.
*   **Detailed Scene Direction**:
    *   **Character Control**: Specify various hairstyles and concrete actions like walking, sitting, or falling down.
    *   **Background Setting**: Provide a custom description for the background or choose from options like the presence or absence of a crowd.
    *   **Atmosphere & Mood**: Combine time of day (day/night), movie styles (from the 50s to the 2020s), color grading (cool/warm tones), and film effects (VHS) to set the perfect mood.
*   **Cinematic Camera Control**:
    *   **Camera Zoom**: Select from a range of zoom levels, from a full-body shot to an extreme close-up.
    *   **Camera Angle**: Specify camera angles like high-angle, low-angle, and more.
    *   **Custom Camera Prompts**: Describe unique and dynamic camera work in your own words to achieve complex, non-standard shots.
*   **User-Friendly Interface**:
    *   Intuitive image uploader with drag-and-drop support.
    *   Instantly download the generated image as a PNG or JPG.
    *   Click to view uploaded images in a larger modal view.

## 🛠️ Tech Stack

*   **AI Model**: Google Gemini 2.5 Flash Image
*   **Framework**: React, TypeScript
*   **API Client**: @google/genai
*   **Styling**: Tailwind CSS
*   **Execution Environment**: Runs directly in the browser via CDN (no build step required).

## 🚀 Getting Started

This project is configured to run directly from the browser without any build process.

### Prerequisites

*   **Google Gemini API Key**: You must have an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation and Running

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ai-character-scene-creator.git
    cd ai-character-scene-creator
    ```

2.  **Set up the API Key**:
    This application reads the Gemini API key from the `process.env.API_KEY` environment variable. You must set this variable in the environment where you are running the project (e.g., Vercel, Netlify, or your local development setup).

3.  **Run the application**:
    Use a local web server to serve the `index.html` file. You can use the `Live Server` extension in VS Code or Python's built-in server for convenience.

    *   **Using Python**:
        ```bash
        python -m http.server
        ```
    *   Open your browser and navigate to `http://localhost:8000` (or the port specified by your server).

## 📝 How to Use

1.  **Upload Images**:
    *   **Main Character**: Upload the image of the person who will be the protagonist of the scene.
    *   **Clothing Reference**: Upload an image of the outfit you want the main character to wear.
    *   **Sub Character**: (Optional) Upload an image of a second person to appear in the scene.

2.  **Configure Options**:
    *   Use the left-hand panel to fine-tune all the details: character's hairstyle, action, camera angle, movie style, and more.
    *   For more dynamic scenes, write a custom description of the camera work in the 'Camera Prompt' field.

3.  **Generate the Image**:
    *   Once you are happy with your settings, click the **'Synthesize Image'** button.
    *   Wait a moment while the AI generates the image (typically takes 10-20 seconds).

4.  **Review and Download**:
    *   The final image will appear in the right-hand panel.
    *   Click the **'Download PNG'** or **'Download JPG'** button to save your creation.

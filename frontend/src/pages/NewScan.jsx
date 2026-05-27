import { useState, useRef } from "react";

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function NewScan() {

  const [image, setImage] = useState(null);
  const [b64, setB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Upload image
  const handleUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {

      setB64(ev.target.result);
      setImage(ev.target.result);

      setResult(null);
      setError(null);

    };

    reader.readAsDataURL(file);
  };

  // Open camera
  const openCamera = async () => {

    try {

      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      setStream(mediaStream);

      setCameraOpen(true);

      setTimeout(() => {

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

      }, 100);

    } catch (err) {

      setError("Camera access denied");

    }
  };

  // Stop camera
  const stopCamera = () => {

    if (stream) {

      stream.getTracks().forEach(
        track => track.stop()
      );
    }

    setCameraOpen(false);
  };

  // Capture image
  const capturePhoto = () => {

    const video = videoRef.current;

    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const dataUrl =
      canvas.toDataURL("image/jpeg");

    setImage(dataUrl);
    setB64(dataUrl);

    stopCamera();
  };

  // Analyze skin
  const scanSkin = async () => {

    if (!b64) return;

    setLoading(true);
    setError(null);
const prompt = `
You are an expert AI dermatologist and skincare specialist.

Analyze this facial skin image carefully and generate a highly personalized skincare analysis.

Return ONLY valid parsable JSON object.

{
  "skin_type": "",
  "acne_level": "",
  "oiliness": "",
  "hydration": "",
  "sensitivity": "",
  "dark_circles": "",
  "texture": "",
  "confidence": 0,
  "summary": "",
  "recommendations": [],
  "seven_day_plan": {
    "Monday": {
      "Morning": "Gentle cleanser, hydrating serum, SPF",
      "Night": "Barrier repair cream and soothing moisturizer"
    },
    "Tuesday": {
      "Morning": "",
      "Night": ""
    },
    "Wednesday": {
      "Morning": "",
      "Night": ""
    },
    "Thursday": {
      "Morning": "",
      "Night": ""
    },
    "Friday": {
      "Morning": "",
      "Night": ""
    },
    "Saturday": {
      "Morning": "",
      "Night": ""
    },
    "Sunday": {
      "Morning": "",
      "Night": ""
    }
  }
}

Rules:
- Analyze real visible skin conditions from the image
- Detect acne, oiliness, hydration, texture, redness, sensitivity, pores, and dark circles
- Give dermatologist-style skincare advice
- Create a UNIQUE skincare routine for ALL 7 DAYS
- Every day MUST be different
- Include hydration days
- Include calming recovery days
- Include exfoliation days
- Include acne treatment days if acne exists
- Include skin barrier repair routines
- Do NOT repeat identical routines
- Use realistic skincare ingredients
- Keep routines practical and human-like
- Recommendations should match the detected skin condition
- Return JSON only
- Do not use markdown
`;
    try {

      const resp = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GROQ_KEY,
          },

          body: JSON.stringify({

            model:
              "meta-llama/llama-4-scout-17b-16e-instruct",

            max_tokens: 3000,

            messages: [
              {
                role: "user",

                content: [

                  {
                    type: "image_url",
                    image_url: { url: b64 }
                  },

                  {
                    type: "text",
                    text: prompt
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await resp.json();

      if (data.error)
        throw new Error(data.error.message);

      const raw =
        data.choices[0].message.content;

      const jsonMatch =
        raw.match(/\{[\s\S]*\}/);

      if (!jsonMatch)
        throw new Error("No JSON found");

      const parsed =
        JSON.parse(jsonMatch[0]);

      console.log(parsed);

      setResult(parsed);
      await fetch("http://localhost:8001/history/save", {

  method: "POST",

  headers: {
    "Content-Type": "application/json",
     
  },
  body: JSON.stringify({
    image: parsed.image_path,
    skin_type: parsed.skin_type,
    acne_level: parsed.acne_level,
    hydration: parsed.hydration,
    oiliness: parsed.oiliness,
    summary: parsed.summary,
    seven_day_plan:parsed.seven_day_plan,
    confidence: parsed.confidence,

    timestamp: new Date(),

    seven_day_plan: parsed.seven_day_plan,

    recommendations: parsed.recommendations,
  }),
});

    } catch (err) {

      setError(
        err.message || "Analysis failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#020617] text-white p-8">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">

          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent mb-4">
            AI Skin Scanner
          </h1>

          <p className="text-slate-400 text-lg">
            Advanced dermatology AI analysis powered by Groq Vision.
          </p>

        </div>

        {/* Upload / Camera */}
        {!image && !cameraOpen ? (

          <div className="grid md:grid-cols-2 gap-5">

            {/* Upload */}
            <label className="border-2 border-dashed border-slate-600 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all min-h-[280px]">

              <span className="text-6xl mb-5">
                📷
              </span>

              <p className="font-semibold text-white text-xl">
                Upload Photo
              </p>

              <p className="text-sm text-slate-400 mt-3 text-center">
                Clear selfie with good lighting works best
              </p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />

            </label>

            {/* Camera */}
            <button
              onClick={openCamera}
              className="border border-cyan-500/20 rounded-3xl p-10 flex flex-col items-center justify-center bg-cyan-500/5 hover:bg-cyan-500/10 transition-all min-h-[280px]"
            >

              <span className="text-6xl mb-5">
                🎥
              </span>

              <p className="font-semibold text-white text-xl">
                Open Camera
              </p>

              <p className="text-sm text-slate-400 mt-3 text-center">
                Capture live facial scan
              </p>

            </button>

          </div>

        ) : cameraOpen ? (

          <div className="space-y-5">

            <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[550px] object-cover"
              />

            </div>

            <div className="flex gap-4">

              <button
                onClick={capturePhoto}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 rounded-2xl transition-all"
              >
                Capture Photo
              </button>

              <button
                onClick={stopCamera}
                className="px-6 border border-slate-600 text-slate-300 rounded-2xl hover:bg-slate-800"
              >
                Cancel
              </button>

            </div>

          </div>

        ) : (

          <div className="space-y-6">

            {/* Preview */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-5">

              <img
                src={image}
                className="w-full max-h-[350px] object-cover rounded-2xl"
              />

              <div className="flex gap-3 mt-5">

                <button
                  onClick={scanSkin}
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-bold px-6 py-3 rounded-2xl transition-all"
                >
                  {loading
                    ? "Analyzing..."
                    : "Analyze Skin"}
                </button>

                <button
                  onClick={() => {

                    setImage(null);
                    setB64(null);
                    setResult(null);
                    setError(null);

                  }}
                  className="border border-slate-600 text-slate-300 hover:border-slate-400 px-5 py-3 rounded-2xl transition-all"
                >
                  Clear
                </button>

              </div>

            </div>

            {/* Loading */}
            {loading && (

              <div className="text-center py-10">

                <div className="inline-block w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />

                <p className="text-slate-400">
                  Analyzing your skin...
                </p>

              </div>
            )}

            {/* Error */}
            {error && (

              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-red-400">
                {error}
              </div>
            )}

            {/* Results */}
            {result && (

              <div className="space-y-6">

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                  {[
                    ["Skin Type", result.skin_type],
                    ["Acne", result.acne_level],
                    ["Oiliness", result.oiliness],
                    ["Hydration", result.hydration],
                  ].map(([l, v]) => (

                    <div
                      key={l}
                      className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4"
                    >

                      <p className="text-xs text-slate-400 mb-1">
                        {l}
                      </p>

                      <p className="font-semibold text-white">
                        {v}
                      </p>

                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-5">

                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                    AI Skin Summary
                  </p>

                  <p className="text-slate-300 leading-relaxed">
                    {result.summary}
                  </p>

                </div>

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (

                  <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">

                    <h2 className="text-2xl font-bold text-white mb-5">
                      AI Recommendations
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">

                      {result.recommendations.map((rec, i) => (

                        <div
                          key={i}
                          className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4"
                        >

                          <p className="text-slate-300 leading-relaxed">
                            {rec}
                          </p>

                        </div>
                      ))}

                    </div>

                  </div>
                )}

                {/* 7 Day Routine */}
                {result.seven_day_plan && (

                  <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">

                    <div className="flex items-center justify-between mb-5">

                      <h2 className="text-2xl font-bold text-white">
                        7 Day AI Routine
                      </h2>

                      <span className="text-xs bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20">
                        Personalized
                      </span>

                    </div>

                    <div className="grid md:grid-cols-2 gap-4">

                      {Object.entries(result.seven_day_plan).map(
                        ([day, routine]) => (

                          <div
                            key={day}
                            className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5"
                          >

                            <h3 className="text-lg font-bold text-cyan-300 mb-4">
                              {day}
                            </h3>

                            <div className="space-y-4">

                              <div>

                                <p className="text-sm text-yellow-300 font-semibold mb-2">
                                  Morning
                                </p>

                                <p className="text-slate-300 text-sm leading-relaxed">
                                  {routine.Morning}
                                </p>

                              </div>

                              <div>

                                <p className="text-sm text-purple-300 font-semibold mb-2">
                                  Night
                                </p>

                                <p className="text-slate-300 text-sm leading-relaxed">
                                  {routine.Night}
                                </p>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

      <canvas ref={canvasRef} className="hidden" />

    </div>
  );
}
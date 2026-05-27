import { useState, useEffect, useRef } from 'react';
import { Camera, RotateCw, X, AlertTriangle, Loader2, RefreshCw, FlipHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CameraCapture({ isOpen, onClose, onCapture, isAnalyzing }) {
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [tempPreview, setTempPreview] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check if multiple cameras are available
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        if (videoDevices.length > 1) {
          setHasMultipleCameras(true);
        }
      })
      .catch(err => console.warn("Error enumerating devices:", err));
  }, []);

  // Initialize and update camera stream
  useEffect(() => {
    if (!isOpen || tempPreview) return;

    let active = true;
    setIsLoading(true);
    setError(null);

    const startStream = async () => {
      try {
        // Stop any existing stream
        stopCameraStream();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Webcam access is not supported by your browser context.");
        }

        // Production-ready constraint fallback setup
        let stream;
        const strictConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1085 },
            height: { ideal: 1085 },
            aspectRatio: 1
          },
          audio: false
        };

        try {
          stream = await navigator.mediaDevices.getUserMedia(strictConstraints);
        } catch (strictErr) {
          console.warn("Strict webcam constraints failed, applying fallback configuration:", strictErr);
          const fallbackConstraints = {
            video: { facingMode: facingMode },
            audio: false
          };
          stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        }
        
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Force immediate play
          try {
            await videoRef.current.play();
            setIsLoading(false);
          } catch (playErr) {
            console.warn("Immediate play blocked, binding to loadedmetadata:", playErr);
            videoRef.current.onloadedmetadata = async () => {
              if (videoRef.current && active) {
                try {
                  await videoRef.current.play();
                  setIsLoading(false);
                } catch (metaPlayErr) {
                  console.error("Webcam video play failed completely:", metaPlayErr);
                  setError("Live camera display failed to render. Please reload or check permission parameters.");
                  setIsLoading(false);
                }
              }
            };
          }
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (!active) return;
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Webcam permissions blocked. Please check your browser URL site settings and allow camera access.");
        } else {
          setError(err.message || "Failed to initialize camera interface.");
        }
        setIsLoading(false);
      }
    };

    startStream();

    return () => {
      active = false;
    };
  }, [isOpen, facingMode, tempPreview]);

  const handleClose = () => {
    stopCameraStream();
    setTempPreview(null);
    setCapturedBlob(null);
    onClose();
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || isLoading || error) return;

    // Trigger flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const sourceX = (video.videoWidth - size) / 2;
    const sourceY = (video.videoHeight - size) / 2;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sourceX, sourceY, size, size, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.drawImage(video, sourceX, sourceY, size, size, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        setTempPreview(previewUrl);
        setCapturedBlob(blob);
        stopCameraStream();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleRetake = () => {
    if (tempPreview) {
      URL.revokeObjectURL(tempPreview);
    }
    setTempPreview(null);
    setCapturedBlob(null);
    setIsLoading(true);
  };

  const handleUsePhoto = () => {
    if (capturedBlob && tempPreview) {
      const file = new File([capturedBlob], "aura-scan.jpg", { type: "image/jpeg" });
      onCapture(file, tempPreview);
      onClose();
    }
  };

  // Clean unmount track stopping
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden rounded-[30px] bg-slate-900 border border-slate-800 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 p-5 bg-slate-950/40">
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <Camera className="h-5 w-5 text-cyan-400" />
                Live Dermal Scanner
              </span>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Hardware Feed Calibration</p>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Viewfinder Area */}
          <div className="relative aspect-square w-full overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5">
            
            {/* Viewfinder Target Grid */}
            {!error && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-x-0 top-1/3 border-b border-white/5" />
                <div className="absolute inset-x-0 top-2/3 border-b border-white/5" />
                <div className="absolute inset-y-0 left-1/3 border-r border-white/5" />
                <div className="absolute inset-y-0 left-2/3 border-r border-white/5" />
              </div>
            )}

            {/* Neon target focal overlay */}
            {!tempPreview && !error && !isLoading && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="relative w-56 h-56 border border-cyan-500/20 rounded-full animate-pulse">
                  {/* Bracket edges */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl" />
                  
                  {/* Subtarget center dot */}
                  <div className="absolute inset-0 m-auto w-4 h-4 border border-cyan-400/40 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Cyberpunk sweep laser */}
            {!tempPreview && !isLoading && !error && (
              <div className="absolute inset-x-0 z-10 pointer-events-none h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-laser neon-glow-cyan" />
            )}

            {/* Flash screen trigger */}
            <AnimatePresence>
              {isFlashing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 bg-white"
                />
              )}
            </AnimatePresence>

            {/* Video preview element */}
            {!tempPreview && (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            )}

            {/* Capture Screen freeze preview */}
            {tempPreview && (
              <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                <img 
                  src={tempPreview} 
                  alt="Captured skin log" 
                  className="w-full h-full object-cover"
                />
                
                {/* Diagnostics analysis overlay scanning grid */}
                <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[0.5px] border border-cyan-500/20 z-10 pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] font-mono text-cyan-400 bg-slate-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse font-semibold">
                    Specimen Captured
                  </div>
                </div>
              </div>
            )}

            {/* Hardware initial load feed */}
            {isLoading && !tempPreview && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Initializing camera sensor...</p>
              </div>
            )}

            {/* Hardware failure / Permissions blocked */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20 p-8 text-center">
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full mb-4">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h4 className="font-heading font-extrabold text-white text-sm uppercase tracking-widest mb-1.5">Sensor Offline</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6 font-medium">
                  {error}
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    setFacingMode('user');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-1.5 mx-auto uppercase tracking-wider shadow-lg shadow-cyan-400/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Connection
                </button>
              </div>
            )}
          </div>

          {/* Action Footer controls */}
          <div className="bg-slate-950/40 p-6 flex flex-col items-center gap-3">
            {!tempPreview ? (
              <div className="flex items-center justify-between w-full max-w-[260px]">
                {/* Camera Toggle */}
                <button
                  onClick={toggleCamera}
                  disabled={!hasMultipleCameras || isLoading || error}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-95"
                  title="Switch Camera Orientation"
                >
                  <RotateCw className="h-4.5 w-4.5" />
                </button>

                {/* Main Shutter trigger */}
                <button
                  onClick={capturePhoto}
                  disabled={isLoading || error}
                  className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-white/10 bg-transparent hover:border-cyan-400 transition-all duration-300 active:scale-90 disabled:opacity-20"
                >
                  <span className="h-13 w-13 rounded-full bg-white hover:bg-slate-100 transition-colors block shadow-lg shadow-white/10" />
                </button>

                {/* Filler spacer to balance row */}
                <div className="w-10.5" />
              </div>
            ) : (
              /* Verification controls */
              <div className="flex gap-4 w-full">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all active:scale-[0.98] uppercase tracking-wider"
                >
                  Discard
                </button>
                <button
                  onClick={handleUsePhoto}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all active:scale-[0.98] uppercase tracking-wider shadow-lg shadow-cyan-400/20"
                >
                  Analyze Specimen
                </button>
              </div>
            )}
            
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2 text-center">
              {!tempPreview ? "Center dermal index zone inside viewfinder" : "Verify focal accuracy before compiling index"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

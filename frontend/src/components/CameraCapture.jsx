import { useRef, useState, useCallback } from 'react';

const CameraCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            setError("Camera access denied or not found.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            setIsStreaming(false);
        }
    };

    const captureImage = useCallback(() => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            onCapture(dataUrl);
            stopCamera();
        }
    }, [onCapture]);

    return (
        <div className="glass-card p-6 flex flex-col items-center gap-4">
            {error && <p className="text-danger">{error}</p>}

            <div className="relative w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden mb-4">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <button onClick={startCamera} className="premium-btn btn-primary">
                            Start Camera
                        </button>
                    </div>
                )}
            </div>

            {isStreaming && (
                <div className="flex gap-4">
                    <button onClick={captureImage} className="premium-btn btn-primary">
                        Capture Photo
                    </button>
                    <button onClick={stopCamera} className="premium-btn btn-secondary">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default CameraCapture;

// components/CameraCapture.tsx
import { useState, useRef } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { TbCaptureFilled } from "react-icons/tb";
import { Button, Modal, Text } from "rizzui";

export default function CameraCapture({
  onCapture,
  onClose,
  showCamera,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
  showCamera: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext("2d");
    context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg",
        });
        onCapture(file);
        stopCamera();
        onClose();
      }
    }, "image/jpeg");
  };

  return (
    <Modal isOpen={showCamera} onClose={onClose} containerClassName="p-8">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full rounded ${!stream ? "hidden" : ""}`}
        />
        {!stream ? (
          <div className="flex flex-col gap-4 items-center justify-center w-full h-56 bg-gray-100 rounded shadow">
            <TbCaptureFilled className="size-10" />
            <Text>Start the Camera to Capture</Text>
          </div>
        ) : null}
        <div className="flex justify-center gap-4 mt-4">
          {!stream ? (
            <Button variant="solid" onClick={startCamera}>
              Start Camera
            </Button>
          ) : (
            <>
              <Button
                variant="solid"
                onClick={capturePhoto}
                className="flex items-center gap-2"
              >
                Capture
                <FaCheckCircle />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

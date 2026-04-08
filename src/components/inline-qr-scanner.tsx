"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScanStatus =
  | { kind: "idle"; message: string }
  | { kind: "starting"; message: string }
  | { kind: "active"; message: string }
  | { kind: "unsupported"; message: string }
  | { kind: "error"; message: string };

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

function isNavigableResult(result: string): boolean {
  try {
    const url = new URL(result, window.location.href);
    const sameOrigin = url.origin === window.location.origin;
    const allowedPath =
      url.pathname === "/" ||
      url.pathname === "/done" ||
      url.pathname === "/hunt" ||
      url.pathname.startsWith("/hunt/");

    return sameOrigin && allowedPath;
  } catch {
    return false;
  }
}

export function InlineQrScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const frameRef = useRef<number | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showAvailabilityPopup, setShowAvailabilityPopup] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    kind: "idle",
    message:
      "Open the camera here if you want to scan the next QR without leaving the page.",
  });

  const supported = useMemo(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const hasCameraAccess =
      typeof navigator.mediaDevices?.getUserMedia === "function";
    const hasBarcodeDetector = typeof window.BarcodeDetector === "function";

    return Boolean(
      window.isSecureContext && hasCameraAccess && hasBarcodeDetector,
    );
  }, []);

  const availabilityMessage = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!window.isSecureContext) {
      return `This page is not running in a secure context. The in-page scanner works on https:// pages and on localhost, but not on plain http://${window.location.host}.`;
    }

    if (typeof navigator.mediaDevices?.getUserMedia !== "function") {
      return "This browser does not expose camera access for in-page scanning.";
    }

    if (typeof window.BarcodeDetector !== "function") {
      return "This browser can open the camera, but it does not expose BarcodeDetector for automatic QR scanning.";
    }

    return null;
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (scannerOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!scannerOpen && dialog.open) {
      dialog.close();
    }
  }, [scannerOpen]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!scannerOpen) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }

      return;
    }

    if (!supported) {
      setScanStatus({
        kind: "unsupported",
        message:
          "This browser does not expose the in-page QR scanner APIs. The phone camera app can still scan the printed QR codes normally.",
      });
      return;
    }

    let cancelled = false;

    async function startScanner() {
      setShowAvailabilityPopup(false);
      setScanStatus({
        kind: "starting",
        message: "Opening the rear camera...",
      });

      try {
        const BarcodeDetectorCtor = window.BarcodeDetector;
        if (!BarcodeDetectorCtor) {
          setScanStatus({
            kind: "unsupported",
            message:
              "This browser does not expose the in-page QR scanner APIs. The phone camera app can still scan the printed QR codes normally.",
          });
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
        });

        if (cancelled) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        detectorRef.current = new BarcodeDetectorCtor({
          formats: ["qr_code"],
        });

        setScanStatus({
          kind: "active",
          message:
            "Camera is live. Hold the QR inside the frame and we will open it automatically.",
        });

        const scanFrame = async () => {
          if (cancelled || !videoRef.current || !detectorRef.current) {
            return;
          }

          if (
            videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
          ) {
            try {
              const barcodes = await detectorRef.current.detect(
                videoRef.current,
              );
              const match = barcodes.find(
                (barcode) =>
                  barcode.rawValue && isNavigableResult(barcode.rawValue),
              );

              if (match?.rawValue) {
                setScanStatus({
                  kind: "active",
                  message: "QR found. Opening the next clue...",
                });

                for (const track of stream.getTracks()) {
                  track.stop();
                }

                window.location.assign(match.rawValue);
                return;
              }
            } catch {
              setScanStatus({
                kind: "error",
                message:
                  "The camera opened, but QR detection failed on this device. You can still use the phone camera app as a fallback.",
              });
              return;
            }
          }

          frameRef.current = requestAnimationFrame(scanFrame);
        };

        frameRef.current = requestAnimationFrame(scanFrame);
      } catch (error) {
        const denied =
          error instanceof DOMException &&
          (error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError");

        setScanStatus({
          kind: "error",
          message: denied
            ? "Camera permission was denied. Allow camera access in the browser and try again."
            : "Could not open the camera. On mobile this usually needs HTTPS and a supported browser.",
        });
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }
    };
  }, [scannerOpen, supported]);

  return (
    <section className="scanner-card">
      <div className="scanner-copy">
        <p className="eyebrow">Ready?</p>
        <h3>Scan the QR</h3>
      </div>

      <div className="button-group">
        <button
          className="button button-primary"
          onClick={() => {
            if (!supported) {
              setShowAvailabilityPopup(true);
              return;
            }

            setScannerOpen(true);
          }}
          type="button"
        >
          {supported ? "Open Camera Scanner" : "Why Scanner Is Unavailable"}
        </button>
      </div>

      {showAvailabilityPopup && availabilityMessage ? (
        <div aria-live="polite" className="scanner-popup" role="alert">
          <p>{availabilityMessage}</p>
          <button
            className="button button-secondary"
            onClick={() => setShowAvailabilityPopup(false)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <dialog
        aria-label="QR scanner"
        className="scanner-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setScannerOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setScannerOpen(false);
          }
        }}
        onClose={() => {
          setScannerOpen(false);
          setShowAvailabilityPopup(false);
        }}
        ref={dialogRef}
      >
        <div className="scanner-dialog-panel">
          <div className="scanner-dialog-header">
            <div>
              <p className="eyebrow">Scanner</p>
              <h3>Scan the hidden QR</h3>
            </div>
            <button
              aria-label="Close scanner"
              className="scanner-close"
              onClick={() => setScannerOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>

          <p className="scanner-status-text">{scanStatus.message}</p>
          {availabilityMessage ? (
            <p className="scanner-warning">{availabilityMessage}</p>
          ) : null}

          <div className="scanner-frame scanner-frame-dialog">
            <video
              ref={videoRef}
              autoPlay
              className="scanner-video"
              muted
              playsInline
            />
            <div className="scanner-target" />
          </div>

          <p className="scanner-help">
            Hold the QR inside the frame and keep the phone steady for a moment.
          </p>
        </div>
      </dialog>
    </section>
  );
}

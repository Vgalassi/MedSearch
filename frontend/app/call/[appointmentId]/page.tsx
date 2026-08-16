"use client";

import { CALL_WS_URL } from "@/components/appConfig";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SignalMessage =
  | { type: "start-call"; initiator: boolean }
  | {
      type: "offer";
      appointmentId: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "answer";
      appointmentId: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "ice-candidate";
      appointmentId: string;
      candidate: RTCIceCandidateInit;
    }
  | { type: "participant-left" }
  | { type: "error"; message: string };

function getAppointmentsHref(role: string | undefined) {
  return role === "DOCTOR" ? "/medic/appointments" : "/patient/appointments";
}

export default function VideoCallPage() {
  const params = useParams<{ appointmentId: string }>();
  const appointmentId = params?.appointmentId;
  const router = useRouter();
  const { user, loading } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState("Preparando chamada...");
  const [error, setError] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!appointmentId) {
      setError("Consulta não encontrada.");
      return;
    }

    if (!user?.profileId || !["DOCTOR", "PATIENT"].includes(user.role)) {
      setError("Entre como médico ou paciente para acessar a videochamada.");
      return;
    }

    let closed = false;

    async function startCall() {
      try {
        setStatus("Solicitando camera e microfone...");

        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (closed) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnectionRef.current = peerConnection;
        localStream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, localStream));

        peerConnection.ontrack = (event) => {
          const [remoteStream] = event.streams;

          if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            setRemoteConnected(true);
            setStatus("Chamada em andamento");
          }
        };

        peerConnection.onicecandidate = (event) => {
          if (!event.candidate || websocketRef.current?.readyState !== WebSocket.OPEN) {
            return;
          }

          websocketRef.current.send(
            JSON.stringify({
              type: "ice-candidate",
              appointmentId,
              candidate: event.candidate.toJSON(),
            }),
          );
        };

        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === "connected") {
            setStatus("Chamada em andamento");
            setRemoteConnected(true);
          }

          if (
            peerConnection.connectionState === "failed" ||
            peerConnection.connectionState === "disconnected"
          ) {
            setStatus("Conexao instavel. Tentando manter a chamada...");
          }
        };

        const websocket = new WebSocket(CALL_WS_URL);
        websocketRef.current = websocket;

        websocket.onopen = () => {
          setStatus("Aguardando o outro participante...");
          websocket.send(
            JSON.stringify({
              type: "join-room",
              appointmentId,
            }),
          );
        };

        websocket.onmessage = async (event) => {
          const message = JSON.parse(event.data) as SignalMessage;

          if (message.type === "error") {
            setError(message.message);
            return;
          }

          if (message.type === "participant-left") {
            setRemoteConnected(false);
            setStatus("O outro participante saiu da chamada.");
            return;
          }

          if (message.type === "start-call" && message.initiator) {
            setStatus("Conectando chamada...");
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            websocket.send(
              JSON.stringify({
                type: "offer",
                appointmentId,
                sdp: offer,
              }),
            );
            return;
          }

          if (message.type === "offer") {
            setStatus("Respondendo chamada...");
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(message.sdp),
            );
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            websocket.send(
              JSON.stringify({
                type: "answer",
                appointmentId,
                sdp: answer,
              }),
            );
            return;
          }

          if (message.type === "answer") {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(message.sdp),
            );
            return;
          }

          if (message.type === "ice-candidate") {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(message.candidate),
            );
          }
        };

        websocket.onerror = () => {
          setError("Não foi possível conectar ao servidor de videochamadas.");
        };

        websocket.onclose = () => {
          if (!closed) {
            setStatus("Conexao da chamada encerrada.");
          }
        };
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível iniciar a videochamada.",
        );
      }
    }

    startCall();

    return () => {
      closed = true;
      websocketRef.current?.close();
      peerConnectionRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [appointmentId, loading, user]);

  function toggleMicrophone() {
    const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
    const nextEnabled = !micEnabled;

    audioTracks.forEach((track) => {
      track.enabled = nextEnabled;
    });

    setMicEnabled(nextEnabled);
  }

  function toggleCamera() {
    const videoTracks = localStreamRef.current?.getVideoTracks() ?? [];
    const nextEnabled = !cameraEnabled;

    videoTracks.forEach((track) => {
      track.enabled = nextEnabled;
    });

    setCameraEnabled(nextEnabled);
  }

  function hangUp() {
    websocketRef.current?.close();
    peerConnectionRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    router.push(getAppointmentsHref(user?.role));
  }

  const appointmentsHref = getAppointmentsHref(user?.role);

  return (
    <main className="page-shell bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-5 py-4 shadow-lg shadow-black/20 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-200">
              Videochamada
            </p>
            <h1 className="mt-2 text-2xl font-bold">Consulta online</h1>
            <p className="mt-2 text-sm text-slate-300">{status}</p>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            href={appointmentsHref}
          >
            Voltar para consultas
          </Link>
        </section>

        {error && (
          <p className="rounded-md border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        )}

        <section className="grid min-h-[58vh] gap-4 lg:grid-cols-[1fr_320px]">
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-900">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full min-h-[420px] w-full bg-slate-900 object-cover max-h-40"
            />

            {!remoteConnected && (
              <div className="absolute inset-0 grid place-items-center bg-slate-900">
                <div className="text-center">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal-500 text-2xl font-bold text-slate-950">
                    M
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-200">
                    Aguardando participante
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="aspect-video w-full bg-slate-900 object-cover"
              />
              <div className="border-t border-white/10 px-4 py-3">
                <p className="text-sm font-semibold">Você</p>
                <p className="mt-1 text-xs text-slate-400">
                  {cameraEnabled ? "Camera ligada" : "Camera desligada"} ·{" "}
                  {micEnabled ? "Microfone ligado" : "Microfone desligado"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-slate-200">Controles</p>
              <div className="mt-4 grid gap-3">
                <button
                  className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                  onClick={toggleMicrophone}
                  type="button"
                >
                  {micEnabled ? "Desligar microfone" : "Ligar microfone"}
                </button>
                <button
                  className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                  onClick={toggleCamera}
                  type="button"
                >
                  {cameraEnabled ? "Desligar camera" : "Ligar camera"}
                </button>
                <button
                  className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                  onClick={hangUp}
                  type="button"
                >
                  Encerrar chamada
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

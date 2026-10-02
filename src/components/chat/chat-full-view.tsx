"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  User,
  Plus,
  Check,
  CheckCheck,
  RefreshCw,
  FileText,
  ShieldCheck,
  Building2,
  GraduationCap,
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  File as FileIcon,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { requestMediaAccess, getBestAudioMimeType, getAudioExtension, isSecureContext, type MediaAccessError } from "@/lib/media-devices";

type ChatUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string | null;
};

type Conversation = {
  id: string;
  otherUser: ChatUser;
  lastMessageAt: string;
  lastMessage?: {
    id: string;
    content: string;
    attachmentUrl?: string | null;
    senderId: string;
    read: boolean;
    createdAt: string;
  } | null;
  unreadCount: number;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string | null;
  content: string;
  attachmentUrl?: string | null;
  read: boolean;
  createdAt: string;
};

export function ChatFullView() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Call state (Audio & Video calls)
  const [activeCall, setActiveCall] = useState<{
    type: "AUDIO" | "VIDEO";
    user: ChatUser;
    status: "CALLING" | "CONNECTED";
    muted: boolean;
    videoOff: boolean;
    duration: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"conversations" | "new_chat">("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recorder state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = session?.user?.id;

  // Modal bonito de aviso/erro
  const [modalInfo, setModalInfo] = useState<{
    title: string;
    message: string;
    type: "error" | "warning" | "success";
  } | null>(null);

  const showModal = useCallback(
    (title: string, message: string, type: "error" | "warning" | "success" = "error") => {
      setModalInfo({ title, message, type });
    },
    []
  );

  // Video call camera stream
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [callMediaStream, setCallMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!activeCall) {
      if (callMediaStream) {
        callMediaStream.getTracks().forEach((t) => t.stop());
        setCallMediaStream(null);
      }
      return;
    }

    let isCancelled = false;
    const needVideo = activeCall.type === "VIDEO";

    (async () => {
      try {
        // Verificar contexto seguro antes de pedir permissão
        if (!isSecureContext()) {
          showModal(
            "Contexto Não Seguro",
            "O acesso ao microfone e câmara requer HTTPS ou localhost.",
            "warning"
          );
          return;
        }
        const stream = await requestMediaAccess({ audio: true, video: needVideo });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setCallMediaStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (isCancelled) return;
        const e = err as MediaAccessError;
        showModal(
          e.title ?? "Acesso à Câmara e Microfone",
          `${e.message ?? "Não foi possível aceder aos dispositivos."}\n\n${e.instruction ?? ""}`,
          "warning"
        );
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [activeCall?.type, showModal]);

  useEffect(() => {
    if (!callMediaStream) return;
    callMediaStream.getAudioTracks().forEach((track) => {
      track.enabled = !activeCall?.muted;
    });
    callMediaStream.getVideoTracks().forEach((track) => {
      track.enabled = !activeCall?.videoOff;
    });
  }, [activeCall?.muted, activeCall?.videoOff, callMediaStream]);

  // Call timer simulation
  useEffect(() => {
    if (!activeCall) return;
    const timer = setInterval(() => {
      setActiveCall((prev) => {
        if (!prev) return null;
        if (prev.status === "CALLING" && prev.duration >= 3) {
          return { ...prev, status: "CONNECTED", duration: prev.duration + 1 };
        }
        return { ...prev, duration: prev.duration + 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall]);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error("Erro ao carregar conversas:", e);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const fetchMessages = useCallback(
    async (convId: string, silent = false) => {
      if (!convId || convId.startsWith("temp-")) return;
      if (!silent) setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          fetchConversations();
        }
      } catch (e) {
        console.error("Erro ao buscar mensagens:", e);
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [fetchConversations]
  );

  useEffect(() => {
    if (!activeConversation) return;

    fetchMessages(activeConversation.id, false);
    const interval = setInterval(() => {
      fetchMessages(activeConversation.id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConversation, fetchMessages]);

  useEffect(() => {
    if (activeConversation && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation, messages]);

  const fetchUsers = useCallback(async (q: string) => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/chat/users?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data.users || []);
      }
    } catch (e) {
      console.error("Erro ao buscar contactos:", e);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "new_chat") {
      fetchUsers(searchQuery);
    }
  }, [activeTab, searchQuery, fetchUsers]);

  // Iniciar conversa instantaneamente com o utilizador seleccionado
  async function selectUserAndStartChat(targetUser: ChatUser) {
    // 1. IMEDIATAMENTE (0ms) definir a conversa activa e mostrar a caixa de texto
    const tempConv: Conversation = {
      id: `temp-${targetUser.id}`,
      otherUser: targetUser,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      lastMessage: null,
    };
    setActiveConversation(tempConv);
    setMessages([]);
    setActiveTab("conversations");

    // 2. Em segundo plano, obter/criar a conversa real na base de dados
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: targetUser.id }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        const realConv = data.conversation;
        setActiveConversation(realConv);
        setConversations((prev) => {
          if (prev.some((c) => c.id === realConv.id)) {
            return prev.map((c) => (c.id === realConv.id ? realConv : c));
          }
          return [realConv, ...prev];
        });
        fetchMessages(realConv.id, false);
      } else if (!res.ok) {
        console.error("Erro ao iniciar conversa:", data.error);
        showModal("Erro ao Iniciar Conversa", data.error || "Não foi possível abrir este canal de comunicação.", "error");
      }
    } catch (e: any) {
      console.error("Erro ao sincronizar conversa com o servidor:", e);
      showModal("Erro de Conexão", "Falha de rede ao tentar iniciar a conversa.", "error");
    }
  }

  async function startConversation(targetUserId: string) {
    const knownUser = availableUsers.find((u) => u.id === targetUserId);
    if (knownUser) {
      return selectUserAndStartChat(knownUser);
    }

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setActiveConversation(data.conversation);
          setConversations((prev) => {
            if (prev.some((c) => c.id === data.conversation.id)) {
              return prev.map((c) => (c.id === data.conversation.id ? data.conversation : c));
            }
            return [data.conversation, ...prev];
          });
          fetchMessages(data.conversation.id, false);
        }
        setActiveTab("conversations");
      }
    } catch (e) {
      console.error("Erro ao iniciar conversa:", e);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    setAttachmentName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "chat");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload.");

      setAttachmentUrl(data.url);
    } catch (err: any) {
      showModal("Erro no Anexo", err.message || "Erro ao carregar anexo.", "error");
      setAttachmentName(null);
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSendMessage(
    e?: React.FormEvent,
    customContent?: string,
    customAttachment?: string
  ) {
    if (e) e.preventDefault();
    if (!activeConversation) return;

    const contentToSend = (customContent !== undefined ? customContent : newMessageText).trim();
    const attachToSend = customAttachment !== undefined ? customAttachment : attachmentUrl;

    if (!contentToSend && !attachToSend) return;

    setSending(true);

    try {
      let convId = activeConversation.id;

      if (convId.startsWith("temp-")) {
        const createRes = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: activeConversation.otherUser.id }),
        });

        const createData = await createRes.json();

        if (!createRes.ok || (!createData.conversationId && !createData.conversation?.id)) {
          throw new Error(createData.error || "Não foi possível iniciar conversa com este utilizador.");
        }

        const realId = createData.conversationId || createData.conversation?.id;
        convId = realId;
        if (createData.conversation) {
          setActiveConversation(createData.conversation);
          setConversations((prev) => {
            if (prev.some((c) => c.id === realId)) {
              return prev.map((c) => (c.id === realId ? createData.conversation : c));
            }
            return [createData.conversation, ...prev];
          });
        }
      }

      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          content: contentToSend,
          attachmentUrl: attachToSend,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao entregar mensagem ao destinatário.");
      }

      setMessages((prev) => [...prev, data.message]);
      fetchConversations();

      // Limpar formulário APENAS após sucesso confirmado!
      if (customContent === undefined) setNewMessageText("");
      if (customAttachment === undefined) {
        setAttachmentUrl(null);
        setAttachmentName(null);
      }
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      showModal("Falha no Envio", err.message || "Não foi possível enviar a mensagem.", "error");
    } finally {
      setSending(false);
    }
  }

  // Funções para Gravação de Áudio — compatível com Chrome, Firefox, Safari, Edge, iOS
  const startRecording = async () => {
    try {
      // Verificar se o browser suporta MediaRecorder
      if (typeof MediaRecorder === "undefined") {
        showModal("Gravação Indisponível", "O seu navegador não suporta gravação de áudio. Utilize o Chrome, Firefox ou Safari actualizado.", "warning");
        return;
      }

      // Verificar contexto seguro (HTTPS ou localhost)
      if (!isSecureContext()) {
        showModal(
          "Contexto Não Seguro",
          "O acesso ao microfone requer uma ligação segura (HTTPS) ou localhost.",
          "warning"
        );
        return;
      }

      // requestMediaAccess trata todos os browsers (incluindo prefixos legados)
      const stream = await requestMediaAccess({ audio: true });

      // Detectar melhor formato: Safari prefere audio/mp4, Chrome/Firefox preferem audio/webm
      const mimeType = getBestAudioMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const e = err as MediaAccessError;
      showModal(
        e.title ?? "Acesso ao Microfone",
        `${e.message ?? "Não foi possível aceder ao microfone."}\n\n${e.instruction ?? ""}`,
        "warning"
      );
    }
  };

  const stopRecordingAndSend = async () => {
    if (!mediaRecorderRef.current) return;

    const mediaRecorder = mediaRecorderRef.current;
    const mimeType = mediaRecorder.mimeType || getBestAudioMimeType();
    const ext = getAudioExtension(mimeType);

    const audioPromise = new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        resolve(audioBlob);
      };
    });

    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);

    try {
      setUploadingAttachment(true);
      const audioBlob = await audioPromise;
      if (audioBlob.size === 0) return;

      const file = new window.File([audioBlob], `audio_${Date.now()}.${ext}`, { type: mimeType });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "chat");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar mensagem de áudio.");

      await handleSendMessage(undefined, "", data.url);
    } catch (err: any) {
      showModal("Erro no Áudio", err.message || "Erro ao processar mensagem de áudio.", "error");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  function startCall(type: "AUDIO" | "VIDEO") {
    if (!activeConversation) return;
    setActiveCall({
      type,
      user: activeConversation.otherUser,
      status: "CALLING",
      muted: false,
      videoOff: false,
      duration: 0,
    });
  }

  function renderAttachmentContent(url: string) {
    const isImage = url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
    const isAudio = url.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i);
    const isVideo = url.match(/\.(mp4|mov|avi|mkv)$/i);
    const isPdf = url.match(/\.pdf$/i);

    if (isImage) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-video w-64 rounded-xl overflow-hidden border border-black/10 hover:opacity-90 transition mt-2"
        >
          <Image src={url} alt="Imagem enviada" fill className="object-cover" />
        </a>
      );
    }

    if (isAudio) {
      return (
        <div className="mt-2 p-2 rounded-xl bg-black/5 dark:bg-white/10 max-w-xs">
          <audio controls src={url} className="w-full h-9 rounded-lg" />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border border-black/10 max-w-sm">
          <video controls src={url} className="w-full h-44 object-cover" />
        </div>
      );
    }

    const fileName = url.split("/").pop() || "Ficheiro anexo";
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-3 rounded-xl border border-black/10 bg-black/5 dark:bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-black/10 transition"
      >
        {isPdf ? (
          <FileText className="h-6 w-6 text-rose-500 shrink-0" />
        ) : (
          <FileIcon className="h-6 w-6 text-blue-500 shrink-0" />
        )}
        <span className="truncate max-w-[200px]">{fileName}</span>
        <Download className="h-4 w-4 shrink-0 opacity-70" />
      </a>
    );
  }

  function renderRoleBadge(role: string) {
    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <ShieldCheck className="h-3.5 w-3.5" /> Suporte
        </span>
      );
    }
    if (role === "SELLER") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Building2 className="h-3.5 w-3.5" /> Profissional
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <GraduationCap className="h-3.5 w-3.5" /> Membro
      </span>
    );
  }

  function formatCallTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="relative flex h-[75vh] w-full rounded-3xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] shadow-xl overflow-hidden select-none">
      {/* OVERLAY DE CHAMADA (ÁUDIO / VÍDEO) */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#0A192F] border border-mesclar-gold/40 p-6 text-center text-white shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-mesclar-gold shadow-lg bg-mesclar-black flex items-center justify-center">
                  {activeCall.user.photoUrl ? (
                    <Image src={activeCall.user.photoUrl} alt={activeCall.user.name} fill className="object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-mesclar-gold" />
                  )}
                </div>
                {activeCall.status === "CALLING" && (
                  <span className="absolute -inset-2 rounded-full border border-mesclar-gold animate-ping opacity-75" />
                )}
              </div>

              <h3 className="text-base font-bold text-white">{activeCall.user.name}</h3>
              <p className="text-xs text-mesclar-gold font-medium mt-1">
                {activeCall.status === "CALLING"
                  ? `A chamar para ${activeCall.type === "VIDEO" ? "Videochamada" : "Chamada de Voz"}...`
                  : `${activeCall.type === "VIDEO" ? "Videochamada" : "Chamada de Voz"} em curso`}
              </p>
              <p className="text-sm font-mono text-gray-300 mt-2 font-bold">
                {formatCallTime(activeCall.duration)}
              </p>

              {activeCall.type === "VIDEO" && (
                <div className="relative mt-4 h-44 w-full rounded-2xl bg-black border border-mesclar-gold/30 overflow-hidden flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  {activeCall.videoOff && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
                      <VideoOff className="h-6 w-6 text-rose-500" />
                      <span>Câmara Desligada</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveCall((prev) => (prev ? { ...prev, muted: !prev.muted } : null))}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                    activeCall.muted ? "bg-rose-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title={activeCall.muted ? "Ativar Microfone" : "Silenciar Microfone"}
                >
                  {activeCall.muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                {activeCall.type === "VIDEO" && (
                  <button
                    type="button"
                    onClick={() => setActiveCall((prev) => (prev ? { ...prev, videoOff: !prev.videoOff } : null))}
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                      activeCall.videoOff ? "bg-rose-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title={activeCall.videoOff ? "Ligar Câmara" : "Desligar Câmara"}
                  >
                    {activeCall.videoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCall(null)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition shadow-lg"
                  title="Terminar Chamada"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL LATERAL ESQUERDO: LISTA DE CONVERSAS */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 border-r border-mesclar-border dark:border-[#1e3a5f] flex flex-col bg-slate-50/50 dark:bg-[#071324]">
        <div className="p-4 border-b border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-mesclar-black dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-mesclar-gold" />
              Chat Interno
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "conversations" ? "new_chat" : "conversations")}
              className="rounded-xl bg-mesclar-gold px-3 py-1.5 text-xs font-bold text-mesclar-black hover:bg-mesclar-gold-dark transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              {activeTab === "conversations" ? "Nova Conversa" : "Ver Conversas"}
            </button>
          </div>
        </div>

        {activeTab === "conversations" ? (
          <div className="flex-1 overflow-y-auto divide-y divide-mesclar-border/60 dark:divide-[#1e3a5f]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-mesclar-muted dark:text-slate-400">
                <MessageSquare className="mx-auto h-10 w-10 text-mesclar-gold/50 mb-2" />
                <p className="font-bold text-mesclar-black dark:text-white">Sem conversas activas</p>
                <p className="mt-1">Clique em "Nova Conversa" para contactar o suporte ou um profissional.</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeConversation?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversation(c)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition ${
                      isActive
                        ? "bg-mesclar-cream/30 dark:bg-[#0E223F] border-l-4 border-mesclar-gold"
                        : "hover:bg-slate-100 dark:hover:bg-[#0E223F]/50"
                    }`}
                  >
                    <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-mesclar-cream dark:bg-[#0E223F] border border-mesclar-gold/30 flex items-center justify-center">
                      {c.otherUser.photoUrl ? (
                        <Image src={c.otherUser.photoUrl} alt={c.otherUser.name} fill className="object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-mesclar-gold-dark" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-mesclar-black dark:text-white truncate">
                          {c.otherUser.name}
                        </h4>
                        <span className="text-[10px] text-mesclar-muted dark:text-slate-400">
                          {new Date(c.lastMessageAt).toLocaleDateString([], { day: "2-digit", month: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-mesclar-muted dark:text-slate-400 truncate max-w-[190px]">
                          {c.lastMessage ? c.lastMessage.content || "Anexo enviado" : "Conversa iniciada"}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-mesclar-gold text-xs font-extrabold text-mesclar-black px-1.5 shadow-xs">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1 p-3 space-y-3 min-h-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-mesclar-muted" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] pl-9 pr-3 py-2 text-xs text-mesclar-black dark:text-white focus:border-mesclar-gold focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {loadingUsers ? (
                <div className="py-8 text-center text-xs text-mesclar-muted">
                  <RefreshCw className="mx-auto h-5 w-5 animate-spin text-mesclar-gold mb-1" />
                  A procurar...
                </div>
              ) : (
                availableUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => selectUserAndStartChat(u)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#0E223F] cursor-pointer transition border border-transparent hover:border-mesclar-border dark:hover:border-[#1e3a5f]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden bg-mesclar-cream dark:bg-[#071324] flex items-center justify-center border border-mesclar-gold/30">
                        {u.photoUrl ? (
                          <Image src={u.photoUrl} alt={u.name} fill className="object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-mesclar-gold-dark" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-mesclar-black dark:text-white truncate">{u.name}</h5>
                        <p className="text-[10px] text-mesclar-muted dark:text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div>{renderRoleBadge(u.role)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* PAINEL DIREITO: CONVERSA PRINCIPAL */}
      <div className="hidden md:flex flex-col flex-1 bg-white dark:bg-[#0A192F]">
        {activeConversation ? (
          <>
            {/* CABEÇALHO */}
            <div className="flex items-center justify-between p-4 border-b border-mesclar-border dark:border-[#1e3a5f] bg-slate-50/70 dark:bg-[#071324]">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-mesclar-cream dark:bg-[#0E223F] border border-mesclar-gold/40 flex items-center justify-center">
                  {activeConversation.otherUser.photoUrl ? (
                    <Image src={activeConversation.otherUser.photoUrl} alt={activeConversation.otherUser.name} fill className="object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-mesclar-gold-dark" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-mesclar-black dark:text-white">
                    {activeConversation.otherUser.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {renderRoleBadge(activeConversation.otherUser.role)}
                    <span className="text-[11px] text-mesclar-muted dark:text-slate-400">
                      {activeConversation.otherUser.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTROLES DE CHAMADA AUDIO E VIDEO */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startCall("AUDIO")}
                  className="rounded-2xl p-2.5 bg-slate-100 dark:bg-[#0E223F] text-mesclar-gold hover:bg-mesclar-gold hover:text-mesclar-black transition shadow-xs"
                  title="Iniciar Chamada de Voz"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => startCall("VIDEO")}
                  className="rounded-2xl p-2.5 bg-slate-100 dark:bg-[#0E223F] text-mesclar-gold hover:bg-mesclar-gold hover:text-mesclar-black transition shadow-xs"
                  title="Iniciar Videochamada"
                >
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* MENSAGENS */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-[#071324]">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-16 text-mesclar-muted">
                  <RefreshCw className="h-6 w-6 animate-spin text-mesclar-gold mb-2" />
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-xs text-mesclar-muted">
                  Nenhuma mensagem ainda. Escreva uma mensagem abaixo!
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUserId;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? "bg-mesclar-black dark:bg-mesclar-gold text-white dark:text-mesclar-black rounded-br-none"
                            : "bg-white dark:bg-[#0E223F] text-mesclar-black dark:text-white border border-mesclar-border dark:border-[#1e3a5f] rounded-bl-none"
                        }`}
                      >
                        {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}

                        {m.attachmentUrl && renderAttachmentContent(m.attachmentUrl)}

                        <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${isMe ? "text-white/60 dark:text-black/60" : "text-mesclar-muted dark:text-slate-400"}`}>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {isMe && (m.read ? <CheckCheck className="h-3.5 w-3.5 text-mesclar-gold dark:text-emerald-700" /> : <Check className="h-3.5 w-3.5" />)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FORMULÁRIO DE ENVIO */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#0A192F] border-t border-mesclar-border dark:border-[#1e3a5f] space-y-2">
              {attachmentUrl && (
                <div className="flex items-center justify-between rounded-xl bg-mesclar-cream/40 dark:bg-[#0E223F] p-2 text-xs border border-mesclar-gold/30">
                  <span className="truncate text-xs font-medium text-mesclar-black dark:text-white max-w-[300px]">
                    Anexo pronto: {attachmentName || attachmentUrl.split("/").pop()}
                  </span>
                  <button type="button" onClick={() => { setAttachmentUrl(null); setAttachmentName(null); }} className="text-rose-600 font-bold">
                    Remover
                  </button>
                </div>
              )}

              {isRecording ? (
                <div className="flex items-center justify-between gap-3 w-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </span>
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      A gravar áudio ({formatCallTime(recordingTime)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                      title="Cancelar Gravação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={stopRecordingAndSend}
                      disabled={uploadingAttachment}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
                      title="Concluir e Enviar Áudio"
                    >
                      {uploadingAttachment ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar" onChange={handleFileUpload} className="hidden" />
                  
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAttachment} className="rounded-2xl p-2.5 text-mesclar-muted dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0E223F] transition" title="Anexar Ficheiro, Imagem, PDF, Vídeo ou Áudio">
                    {uploadingAttachment ? <RefreshCw className="h-5 w-5 animate-spin text-mesclar-gold" /> : <Paperclip className="h-5 w-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={startRecording}
                    className="rounded-2xl p-2.5 text-mesclar-muted dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0E223F] transition hover:text-rose-500"
                    title="Gravar Áudio"
                  >
                    <Mic className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    placeholder="Escreva a sua mensagem..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#071324] px-4 py-2.5 text-xs text-mesclar-black dark:text-white focus:border-mesclar-gold focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!newMessageText.trim() && !attachmentUrl)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mesclar-gold text-mesclar-black font-bold shadow-sm hover:bg-mesclar-gold-dark transition disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-mesclar-muted dark:text-slate-400">
            <MessageSquare className="h-16 w-16 text-mesclar-gold/40 mb-3 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-mesclar-black dark:text-white">Nenhuma conversa selecionada</h3>
            <p className="mt-1 text-xs max-w-sm">
              Selecione uma conversa na lista lateral ou inicie um novo diálogo com a equipa de suporte ou profissionais.
            </p>
          </div>
        )}
      </div>

      {/* MODAL BONITO DE AVISO / ERRO */}
      {modalInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-[#0E223F] border border-mesclar-gold/40 p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mesclar-cream dark:bg-[#071324] border border-mesclar-gold/40 text-mesclar-gold">
              {modalInfo.type === "error" ? (
                <XCircle className="h-7 w-7 text-rose-500" />
              ) : modalInfo.type === "warning" ? (
                <AlertTriangle className="h-7 w-7 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              )}
            </div>

            <h3 className="text-base font-extrabold text-mesclar-black dark:text-white">
              {modalInfo.title}
            </h3>
            <p className="mt-2 text-xs text-mesclar-muted dark:text-slate-300 leading-relaxed">
              {modalInfo.message}
            </p>

            <button
              type="button"
              onClick={() => setModalInfo(null)}
              className="mt-6 w-full rounded-2xl bg-mesclar-gold py-2.5 text-xs font-bold text-mesclar-black shadow-md hover:bg-mesclar-gold-dark transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

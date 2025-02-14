"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const SYSTEM_PROMPT =
  "You are a professional health consultation assistant with knowledge of medicine and health management. Your task is to provide users with scientific, professional health advice based on their input, but do not provide medical diagnoses. Please answer users' questions clearly and professionally while maintaining a friendly and patient tone.";

// 获取 Web Speech API
const getSpeechRecognition = () => {
  if (typeof window !== "undefined") {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }
  return null;
};

export default function HealthConsultantChat(): React.JSX.Element {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "assistant" }[]>([]);
  const [message, setMessage] = useState("");
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null); // 用 ref 存储 recognition

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const sideNavWidth = 300;
  const isSideNavVisible = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 初始化 SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // 防止重复触发
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        console.log("🎤 Speech recognition started");
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 Speech recognition ended");
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("📢 Speech recognized:", transcript);
        setMessage(transcript);
        handleSend(transcript); // 直接发送语音转换的文本
      };

      recognitionRef.current.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
        setIsListening(false);
      };
    } else {
      console.warn("⚠️ Speech Recognition API is not supported in this browser.");
    }
  }, []);

  // 发送消息
  const handleSend = async (msg?: string) => {
    const text = msg || message;
    if (!text.trim()) return;

    const userMessage = { text, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("https://ollama.peakxel.net/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: `${SYSTEM_PROMPT}\n\nUser query: ${text}`,
          stream: false,
        }),
      });

      const data = await response.json();
      const assistantMessage = {
        text: data.response || "Sorry, I am unable to answer that question.",
        sender: "assistant",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }
  };

  // 语音输入
  const handleVoiceRecordStart = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    if (isListening) {
      console.warn("Speech recognition is already running.");
      return;
    }

    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleVoiceRecordStop = () => {
    if (!recognitionRef.current) return;

    setIsListening(false);
    recognitionRef.current.stop();
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh" p={2} sx={{ bgcolor: "#f4f4f4" }}>
      <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
        Health Consultation Assistant
      </Typography>

      <Box flexGrow={1} mb={2} sx={{ overflowY: "auto", px: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection={msg.sender === "user" ? "row-reverse" : "row"}
            alignItems="center"
            mb={2}
          >
            <Avatar
              src={msg.sender === "user" ? "/assets/user.png" : "/assets/health-bot.png"}
              alt={msg.sender === "user" ? "User" : "Assistant"}
              sx={{ width: 40, height: 40, mx: 1 }}
            />
            <Box sx={{ bgcolor: msg.sender === "user" ? "#cce5ff" : "#e0e0e0", p: 2, borderRadius: 2 }}>
              {msg.text}
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: isSideNavVisible ? `${sideNavWidth}px` : 0,
          width: isSideNavVisible ? `calc(100% - ${sideNavWidth}px)` : "100%",
          bgcolor: "white",
          boxShadow: "0 -1px 5px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          padding: "8px",
        }}
      >
        <IconButton onClick={() => setIsVoiceInput(!isVoiceInput)}>
          {isVoiceInput ? <KeyboardIcon /> : <MicIcon />}
        </IconButton>

        {isVoiceInput ? (
          <Button fullWidth variant="outlined" onMouseDown={handleVoiceRecordStart} onMouseUp={handleVoiceRecordStop}>
            {isListening ? "Listening..." : "Hold to Speak"}
          </Button>
        ) : (
          <TextField fullWidth variant="outlined" value={message} onChange={(e) => setMessage(e.target.value)} />
        )}

        {!isVoiceInput && <Button onClick={() => handleSend()}>Send</Button>}
      </Box>
    </Box>
  );
}

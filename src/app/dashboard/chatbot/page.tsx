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
      // get latest sensor data
      const sensorRes = await fetch("http://localhost:3001/api/latest-sensor");
      const sensorData = await sensorRes.json();
  
      // integrate data to Prompt
      const sensorPrompt = `
You are a professional health assistant. You have access to real-time sensor data from the user:

- UV index: ${sensorData.uv_data?.[0]}
- Temperature: ${sensorData.bmp280_data?.[0]} °C
- Step count: ${sensorData.mpu6050_data?.[0]}
- Heart rate: ${sensorData.max3010_data?.[0]} bpm
- SpO2: ${sensorData.max3010_data?.[1]} %

Use this data to provide personalized health advice **only if it's relevant to the user's question**.

Your goal is to provide concise, helpful suggestions based on the user's query and sensor data, **without unnecessary repetition**.

Only mention the sensor values if they are important to the specific question. Do not always follow a fixed structure.

User's question: ${text}
`;
  
      // send to LLM
      const response = await fetch("https://ollama.peakxel.net/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-r1:8b",
          prompt: sensorPrompt,
          stream: true,
        }),
      });
  

      if (!response.body) {
        throw new Error("No response body received.");
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";
      let insideThinkBlock = false;
  
      const thinkingFrames = ["Thinking.", "Thinking.", "Thinking..", "Thinking..", "Thinking...", "Thinking..."]; 
      let thinkingIndex = 0;
  
      let interval: NodeJS.Timeout | null = setInterval(() => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
  
          if (lastMessage.sender === "assistant" && insideThinkBlock) {
            lastMessage.text = thinkingFrames[thinkingIndex % thinkingFrames.length];
          }
  
          thinkingIndex++;
          return [...updatedMessages];
        });
      }, 500);
  
      setMessages((prev) => [...prev, { text: "Thinking...", sender: "assistant" }]);
  
      const readStream = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
  
          buffer += decoder.decode(value, { stream: true });
  
          const parts = buffer.split("\n");
          buffer = parts.pop() || "";
  
          for (const part of parts) {
            try {
              if (part.trim()) {
                const jsonChunk = JSON.parse(part);
                if (jsonChunk.response) {
                  let newText = jsonChunk.response;
  
                  if (newText.includes("<think>")) {
                    insideThinkBlock = true;
                    setMessages((prev) => {
                      const updatedMessages = [...prev];
                      const lastMessage = updatedMessages[updatedMessages.length - 1];
  
                      if (lastMessage.sender === "assistant") {
                        lastMessage.text = "Thinking...";
                      }
  
                      return [...updatedMessages];
                    });
                  }
                  if (newText.includes("</think>")) {
                    insideThinkBlock = false;
                    newText = newText.replace(/<\/?think>/g, "");
                  }
  
                  if (!insideThinkBlock) {
                    accumulatedText += newText;
  
                    if (interval) {
                      clearInterval(interval);
                      interval = null;
                    }
  
                    setMessages((prev) => {
                      const updatedMessages = [...prev];
                      const lastMessage = updatedMessages[updatedMessages.length - 1];
  
                      if (lastMessage.sender === "assistant") {
                        lastMessage.text = accumulatedText;
                      } else {
                        updatedMessages.push({ text: accumulatedText, sender: "assistant" });
                      }
  
                      return [...updatedMessages];
                    });
                  }
                }
              }
            } catch (error) {
              console.warn("Error parsing JSON chunk:", error);
            }
          }
        }
      };
  
      await readStream();
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

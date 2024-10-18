"use client";

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { CompaniesFilters } from '@/components/dashboard/integrations/integrations-filters';

export default function ConsultationsPage(): React.JSX.Element {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ user: string; response: string }[]>([]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    try {
      // Send the message to the Ollama server at the generate endpoint
      const response = await fetch('http://192.168.2.45:11434/api/generate', {
        //这个IP如果不是在我服务器上部署这个网站的话，是需要改的，因为API在内网，未对外网开放
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',  // Specify the model
          prompt: userInput,  // Send user input as the prompt
          stream: false,      // Set stream to false as per the updated request
        }),
      });

      const data = await response.json();

      // Update the chat history with the new message and response
      setChatHistory([...chatHistory, { user: userInput, response: data.response }]);
      setUserInput('');  // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Header Section */}
      <Stack direction="row" spacing={3} justifyContent="space-between">
        <Typography variant="h4">Consultations</Typography>
        <Button
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
        >
          Add
        </Button>
      </Stack>

      {/* Filters Section */}
      <CompaniesFilters />

      {/* Chatbox Section */}
      <Stack spacing={2}>
        <Typography variant="h6">Chat with Consultant</Typography>
        <Paper elevation={3} sx={{ p: 2, minHeight: 300 }}>
          {/* Chat History */}
          <Stack spacing={2}>
            {chatHistory.map((chat, index) => (
              <Box key={index}>
                <Typography variant="body1">
                  <strong>User:</strong> {chat.user}
                </Typography>
                <Typography variant="body1">
                  <strong>Consultant:</strong> {chat.response}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Input Section */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Your Message"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <Button variant="contained" onClick={handleSendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
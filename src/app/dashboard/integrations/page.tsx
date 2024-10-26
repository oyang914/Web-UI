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

    // Add the user's message to the chat history with an empty response
    setChatHistory([...chatHistory, { user: userInput, response: '' }]);
    const currentIndex = chatHistory.length;
    setUserInput(''); // Clear the input field

    try {
      // Send the message to the backend server at the /api endpoint
      const response = await fetch('http://localhost:3001/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: userInput,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        console.error('Error sending message:', response.statusText);
        return;
      }

      // Prepare to read the streamed response
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let accumulatedResponse = '';
      let buffer = '';

      const readChunk = async () => {
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (readerDone) {
            done = true;
            break;
          }
          if (value) {
            const chunk = decoder.decode(value);
            buffer += chunk;

            // Split buffer into lines (each line is a JSON object)
            let lines = buffer.split('\n');
            buffer = lines.pop(); // The last line may be incomplete

            for (let line of lines) {
              line = line.trim();
              if (!line) continue;
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  accumulatedResponse += data.response + ' ';
                  // Update the chat history with the new data
                  setChatHistory((prevChatHistory) => {
                    const updatedChatHistory = [...prevChatHistory];
                    updatedChatHistory[currentIndex].response = accumulatedResponse.trim();
                    return updatedChatHistory;
                  });
                }
              } catch (err) {
                console.error('Error parsing JSON:', err);
              }
            }
          }
        }
      };

      readChunk().catch((err) => {
        console.error('Error reading stream:', err);
      });
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

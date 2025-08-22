import React from 'react';
import { YouTubeTranscriptProcessor } from './YouTubeTranscriptProcessor';

export function YouTubeTranscriptExample() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">YouTube Transcript Processor</h1>
        <p className="text-muted-foreground">
          Extract and process YouTube video transcripts for learning content
        </p>
      </div>
      
      <YouTubeTranscriptProcessor />
    </div>
  );
}

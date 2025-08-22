import React, { useState } from 'react';
import { useYouTubeTranscript } from '../hooks/useYouTubeTranscript';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Loader2, Download, Search, Play, FileText } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function YouTubeTranscriptProcessor() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingOptions, setProcessingOptions] = useState({
    includeSummary: true,
    includeKeyPoints: true,
    includeQuestions: true,
    maxSummaryLength: 200,
    keyPointsCount: 5,
    questionsCount: 3
  });

  const {
    transcript,
    isLoading,
    error,
    processVideo,
    exportTranscript,
    clearTranscript,
    searchInTranscript,
    searchResults
  } = useYouTubeTranscript();

  const handleProcessVideo = async () => {
    if (!youtubeUrl.trim()) return;
    await processVideo(youtubeUrl, processingOptions);
  };

  const handleSearch = () => {
    searchInTranscript(searchTerm);
  };

  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            YouTube Transcript Processor
          </CardTitle>
          <CardDescription>
            Extract and process transcripts from YouTube videos for learning content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-2">
            <label htmlFor="youtube-url" className="text-sm font-medium">
              YouTube URL
            </label>
            <div className="flex gap-2">
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleProcessVideo} 
                disabled={isLoading || !youtubeUrl.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isLoading ? 'Processing...' : 'Process'}
              </Button>
            </div>
          </div>

          {/* Processing Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Processing Options</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.includeSummary}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      includeSummary: e.target.checked
                    }))}
                  />
                  Include Summary
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.includeKeyPoints}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      includeKeyPoints: e.target.checked
                    }))}
                  />
                  Include Key Points
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.includeQuestions}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      includeQuestions: e.target.checked
                    }))}
                  />
                  Include Questions
                </label>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {transcript && (
        <div className="space-y-6">
          {/* Export Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportTranscript('markdown')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export as Markdown
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportTranscript('json')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export as JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportTranscript('text')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export as Text
                </Button>
                <Button
                  variant="outline"
                  onClick={clearTranscript}
                  className="ml-auto"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {transcript.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{transcript.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Points */}
          {transcript.keyPoints && transcript.keyPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {transcript.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          {transcript.questions && transcript.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Questions for Review</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {transcript.questions.map((question, index) => (
                    <li key={index} className="text-sm">
                      {question}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Search for specific terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
                  Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Found {searchResults.length} results:
                  </p>
                  {searchResults.map((segment, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {formatTimestamp(segment.start)}
                        </Badge>
                      </div>
                      <p className="text-sm">{segment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full Transcript */}
          <Card>
            <CardHeader>
              <CardTitle>Full Transcript</CardTitle>
              <CardDescription>
                {transcript.segments.length} segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {transcript.segments.map((segment, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 hover:bg-muted rounded">
                    <Badge variant="outline" className="mt-1 flex-shrink-0">
                      {formatTimestamp(segment.start)}
                    </Badge>
                    <span className="text-sm">{segment.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

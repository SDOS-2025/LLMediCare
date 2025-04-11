import React, { useEffect, useState, useRef } from 'react';

/**
 * RocketChatWidget - A component to embed Rocket.Chat using iframe
 * 
 * @param {Object} props
 * @param {string} props.serverUrl - The URL of your Rocket.Chat server
 * @param {Object} props.options - Additional options for configuring the chat
 * @param {string} props.options.channel - Channel name (optional)
 * @param {string} props.options.theme - Theme: 'light' or 'dark' (optional)
 * @param {boolean} props.options.showAgentInfo - Show agent information (optional)
 * @param {boolean} props.options.showDepartment - Show department selection (optional)
 */

export default function RocketChatWidget ({ 
  serverUrl,
  options = {
    channel: '',
    theme: 'light',
    showAgentInfo: true,
    showDepartment: false
  }
}){
  const iframeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Build the Rocket.Chat Livechat URL with parameters
  const buildLivechatUrl = () => {
    if (!serverUrl) {
      console.error('Rocket.Chat server URL is required');
      return '';
    }

    // Ensure the URL ends with a slash
    const baseUrl = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;
    
    // Create the URL for the Livechat iframe
    const livechatUrl = new URL(`${baseUrl}livechat`);
    
    // Add options as query parameters
    if (options.channel) {
      livechatUrl.searchParams.append('channel', options.channel);
    }
    
    if (options.theme) {
      livechatUrl.searchParams.append('theme', options.theme);
    }
    
    livechatUrl.searchParams.append('showAgentInfo', options.showAgentInfo ? '1' : '0');
    livechatUrl.searchParams.append('showDepartment', options.showDepartment ? '1' : '0');
    
    return livechatUrl.toString();
  };

  // Handle communication with the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Verify the message is from the Rocket.Chat server
      if (event.origin === new URL(serverUrl).origin) {
        // Handle any messages from the Rocket.Chat iframe
        console.log('Message from Rocket.Chat:', event.data);
        
        // You can implement custom handlers here for specific Rocket.Chat events
        if (event.data && event.data.type === 'livechat-ready') {
          setIsLoaded(true);
        }
      }
    };

    // Add the event listener for messages from the iframe
    window.addEventListener('message', handleMessage);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [serverUrl]);

  // Handle iframe loading
  const handleIframeLoad = () => {
    console.log('Rocket.Chat iframe loaded');
    setIsLoaded(true);
  };

  return (
    <div className="rocket-chat-container">
      {!isLoaded && (
        <div className="rocket-chat-loading">
          <p>Loading Rocket.Chat...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={buildLivechatUrl()}
        width="100%"
        height="500px"
        frameBorder="0"
        style={{ 
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          display: isLoaded ? 'block' : 'none'
        }}
        title="Rocket.Chat Livechat"
        allow="microphone; camera; autoplay; display-capture; fullscreen"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};
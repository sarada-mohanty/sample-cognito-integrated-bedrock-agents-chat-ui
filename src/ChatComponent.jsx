import useSpeechToText from './js/useSpeechToText';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from "react-markdown"
import rehypeRaw from 'rehype-raw'
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import Avatar from "@cloudscape-design/chat-components/avatar";
import LoadingBar from "@cloudscape-design/chat-components/loading-bar";
import LiveRegion from "@cloudscape-design/components/live-region";
import Box from "@cloudscape-design/components/box";
import {
  Container,
  Form,
  FormField,
  PromptInput,
  Button,
  Modal,
  SpaceBetween,
  TopNavigation
} from "@cloudscape-design/components";
import PropTypes from 'prop-types';
import * as AWSAuth from '@aws-amplify/auth';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import './ChatComponent.css';

/**
 * Main chat interface component that handles message interaction with Bedrock agent
 * @param {Object} props - Component properties
 * @param {Object} props.user - Current authenticated user information
 * @param {Function} props.onLogout - Callback handler for logout action
 * @param {Function} props.onConfigEditorClick - Callback for configuration editor
 * @returns {JSX.Element} The chat interface
 */
const ChatComponent = ({ user, onLogout, onConfigEditorClick }) => {
  // AWS Bedrock client instance for agent communication
  const [bedrockClient, setBedrockClient] = useState(null);
  // AWS Lambda client for Strands agent communication
  const [lambdaClient, setLambdaClient] = useState(null);
  // Array of chat messages in the conversation
  const [messages, setMessages] = useState([]);
  // Current message being composed by the user
  const [newMessage, setNewMessage] = useState('');
  // Unique identifier for the current chat session
  const [sessionId, setSessionId] = useState(null);
  // Reference to automatically scroll to latest messages
  const messagesEndRef = useRef(null);
  // Tracks when the AI agent is processing a response
  const [isAgentResponding, setIsAgentResponding] = useState(false);
  // Controls visibility of the clear conversation modal
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  // Name of the AI agent for display purposes
  const [agentName, setAgentName] = useState({ value: 'Agent' });
  // Tracks completed tasks and their explanation
  const [tasksCompleted, setTasksCompleted] = useState({ count: 0, latestRationale: '' });
  // Flag to determine if using Strands Agent
  const [isStrandsAgent, setIsStrandsAgent] = useState(false);


  /**
  * Scrolls the chat window to the most recent message
  * Uses smooth scrolling behavior for better user experience
  */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
 * Shows the modal for confirming conversation clearing
 */
  const handleClearData = () => {
    setShowClearDataModal(true);
  };

  /**
  Lines added for Speech to Text functionality
   */
  const { transcript, isListening, startListening, stopListening, speechRecognitionSupported } = useSpeechToText();
  console.log('Speech Recognition Supported', speechRecognitionSupported);
  useEffect(() => {
    if (transcript) {
      setNewMessage(transcript.trim());
      scrollToBottom();
    }
  }, [transcript]);


  /**
   * Handles the confirmation action for clearing conversation data
   */
  /**
   * Handles the confirmation action for clearing conversation data
   * Clears all local storage and reloads the application
   */
  const confirmClearData = () => {
    // Clear all stored data from localStorage
    localStorage.clear();
    // Reload the application to reset state
    window.location.reload();
  };

  /**
   * Creates a new chat session with a unique identifier
   * Clears existing messages and initializes storage for the new session
   * Uses timestamp as session identifier
   */
  const createNewSession = useCallback(() => {
    // Generate new session ID using current timestamp
    const newSessionId = `agentcore-session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
    // Update session state
    setSessionId(newSessionId);
    // Clear existing messages
    setMessages([]);
    // Store session information in localStorage
    localStorage.setItem('lastSessionId', newSessionId);
    localStorage.setItem(`messages_${newSessionId}`, JSON.stringify([]));
    console.log('New session created:', newSessionId);
  }, []);

  /**
   * Retrieves messages for a specific chat session from localStorage
   * @param {string} sessionId - The identifier of the session to fetch messages for
   * @returns {Array} Array of messages for the session, or empty array if none found
   */
  const fetchMessagesForSession = useCallback((sessionId) => {
    const storedMessages = localStorage.getItem(`messages_${sessionId}`);
    return storedMessages ? JSON.parse(storedMessages) : [];
  }, []);

  /**
   * Persists messages to localStorage for a specific session
   * Merges new messages with existing ones before storing
   * @param {string} sessionId - The identifier of the session to store messages for
   * @param {Array} newMessages - New messages to add to storage
   */
  const storeMessages = useCallback((sessionId, newMessages) => {
    // Retrieve existing messages for the session
    const currentMessages = fetchMessagesForSession(sessionId);
    // Merge existing and new messages
    const updatedMessages = [...currentMessages, ...newMessages];
    // Save updated message list to localStorage
    localStorage.setItem(`messages_${sessionId}`, JSON.stringify(updatedMessages));
  }, [fetchMessagesForSession]);

  /**
   * Attempts to load the last active chat session
   * Creates a new session if no existing session is found
   * Restores messages from localStorage for existing sessions
   */
  const loadExistingSession = useCallback(() => {
    // Try to get the ID of the last active session
    const lastSessionId = localStorage.getItem('lastSessionId');
    if (lastSessionId) {
      // If found, restore the session and its messages
      setSessionId(lastSessionId);
      const loadedMessages = fetchMessagesForSession(lastSessionId);
      setMessages(loadedMessages);
    } else {
      // If no existing session, create a new one
      createNewSession();
    }
  }, [createNewSession, fetchMessagesForSession]);

  /**
   * Effect hook to initialize AWS Bedrock client and fetch credentials
   * Sets up the connection to AWS Bedrock service using stored configuration
   */
  useEffect(() => {
    /**
     * Fetches AWS credentials and initializes Bedrock client
     * Retrieves configuration from localStorage and establishes AWS session
     */
    const fetchCredentials = async () => {
      try {
        // Get configuration from localStorage
        const appConfig = JSON.parse(localStorage.getItem('appConfig'));
        const bedrockConfig = appConfig.bedrock;
        const strandsConfig = appConfig.strands;
        
        // Check if Strands Agent is enabled
        setIsStrandsAgent(strandsConfig && strandsConfig.enabled);
        
        // Fetch AWS authentication session
        const session = await AWSAuth.fetchAuthSession();
        
        // Initialize Bedrock client if needed
        if (!strandsConfig?.enabled) {
          const newBedrockClient = new BedrockAgentRuntimeClient({
            region: bedrockConfig.region,
            credentials: session.credentials
          });
          setBedrockClient(newBedrockClient);
          if (bedrockConfig.agentName && bedrockConfig.agentName.trim()) {
            setAgentName({ value: bedrockConfig.agentName });
          }
        } 
        // Initialize Lambda client for Strands Agent
        else if (strandsConfig && strandsConfig.enabled) {
          const newLambdaClient = new LambdaClient({
            region: strandsConfig.region,
            credentials: session.credentials
          });
          setLambdaClient(newLambdaClient);
          if (strandsConfig.agentName && strandsConfig.agentName.trim()) {
            setAgentName({ value: strandsConfig.agentName });
          }
        }
      } catch (error) {
        console.error('Error fetching credentials:', error);
      }
    };

    fetchCredentials();
  }, []);

  useEffect(() => {
    if ((bedrockClient || lambdaClient) && !sessionId) {
      loadExistingSession();
    }
  }, [bedrockClient, lambdaClient, sessionId, loadExistingSession]);

  /**
   * Effect hook to scroll to latest messages
   * Triggered whenever messages array is updated
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handles the submission of new messages to the chat
   * Sends message to Bedrock agent or Strands agent and processes response
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Only proceed if we have a message and active session
    if (newMessage.trim() && sessionId) {
      const appConfig = JSON.parse(localStorage.getItem('appConfig'));
      
      // Clear input field
      setNewMessage('');
      // Create message object with user information
      const userMessage = { text: newMessage, sender: user.username };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsAgentResponding(true); // Set to true when starting to wait for response

      try {
        let agentMessage;
        
        // Handle Bedrock Agent
        if (!isStrandsAgent && bedrockClient) {
          const bedrockConfig = appConfig.bedrock;
          const sessionAttributes = {
            aws_session: await AWSAuth.fetchAuthSession()
          };

          const command = new InvokeAgentCommand({
            agentId: bedrockConfig.agentId,
            agentAliasId: bedrockConfig.agentAliasId,
            sessionId: sessionId,
            endSession: false,
            enableTrace: true,
            inputText: newMessage,
            promptSessionAttributes: sessionAttributes
          });

          let completion = "";
          const response = await bedrockClient.send(command);

          if (response.completion === undefined) {
            throw new Error("Completion is undefined");
          }

          for await (const chunkEvent of response.completion) {
            if (chunkEvent.trace) {
              console.log("Trace: ", chunkEvent.trace);
              tasksCompleted.count++;
              if (typeof (chunkEvent.trace.trace.failureTrace) !== 'undefined') {
                throw new Error(chunkEvent.trace.trace.failureTrace.failureReason);
              }

              if (chunkEvent.trace.trace.orchestrationTrace.rationale) {
                tasksCompleted.latestRationale = chunkEvent.trace.trace.orchestrationTrace.rationale.text;
                scrollToBottom();
              }
              setTasksCompleted({ ...tasksCompleted });

            } else if (chunkEvent.chunk) {
              const chunk = chunkEvent.chunk;
              const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
              completion += decodedResponse;
            }
          }

          console.log('Full completion:', completion);
          agentMessage = { text: completion, sender: agentName.value };
        } 
        // Handle Strands Agent
        else if (isStrandsAgent && lambdaClient) {
          const strandsConfig = appConfig.strands;
          
          // Prepare payload for Lambda function
          const payload = {
            query: newMessage
          };
          
          // Extract Lambda function name from ARN
          const lambdaArn = strandsConfig.lambdaArn;
          
          const command = new InvokeCommand({
            FunctionName: lambdaArn,
            Payload: JSON.stringify(payload),
            InvocationType: 'RequestResponse'
          });
          
          const response = await lambdaClient.send(command);
          
          // Process Lambda response
          const responseBody = new TextDecoder().decode(response.Payload);
          const parsedResponse = JSON.parse(responseBody);
          
          console.log('Lambda response:', parsedResponse);
          
          // Extract the response text from the Lambda result
          let responseText;
          if (parsedResponse.body) {
            const body = JSON.parse(parsedResponse.body);
            responseText = body.response;
          } else if (parsedResponse.response) {
            responseText = parsedResponse.response;
          } else {
            responseText = "Sorry, I couldn't process your request.";
          }
          
          agentMessage = { text: responseText, sender: agentName.value };
        } else {
          throw new Error("No agent client available");
        }

        setMessages(prevMessages => [...prevMessages, agentMessage]);
        // Store the new messages
        storeMessages(sessionId, [userMessage, agentMessage]);

      } catch (err) {
        console.error('Error invoking agent:', err);

        let errReason = "**"+String(err).toString()+"**";

        const errorMessage = { text: `An error occurred while processing your request:\n${errReason}`, sender: 'agent' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        storeMessages(sessionId, [userMessage, errorMessage]);
      } finally {
        setIsAgentResponding(false); // Set to false when response is received
        setTasksCompleted({ count: 0, latestRationale: '' });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await AWSAuth.signOut();
      onLogout();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    // <ContentLayout
    //   defaultPadding
    //   header={
    <div className="chat-component">
      <Container stretch>
        <div className="chat-container">
          <TopNavigation
            identity={{
              href: "#",
              title: `Chat with ${agentName.value}`,
            }}
            utilities={
              [
                //This is the button to start a new conversation
                {
                  type: "button",
                  iconName: "add-plus",
                  title: "Start a new conversation",
                  ariaLabel: "Start a new conversation",
                  disableUtilityCollapse: true,
                  onClick: () => createNewSession()
                },
                //This is the settings handler
                {
                  type: "menu-dropdown",
                  iconName: "settings",
                  ariaLabel: "Settings",
                  title: "Settings",
                  disableUtilityCollapse: true,
                  onItemClick: ({ detail }) => {
                    switch (detail.id) {
                      case "edit-settings":
                        onConfigEditorClick();
                        break;
                      case "clear-settings":
                        handleClearData();
                        break;
                    }
                  },
                  items: [
                    {
                      id: "clear-settings",
                      type: "button",
                      iconName: "remove",
                      text: "Clear settings and local storage",
                    },
                    {
                      id: "edit-settings",
                      text: "Edit Settings",
                      iconName: "edit",
                      type: "icon-button",
                    }
                  ]
                },
                //This is the user session menu options
                {
                  type: "menu-dropdown",
                  text: user.username,
                  iconName: "user-profile",
                  title: user.username,
                  ariaLabel: "User",
                  disableUtilityCollapse: true,
                  onItemClick: ({ detail }) => {
                    switch (detail.id) {
                      case "logout":
                        handleLogout();
                        break;
                    }
                  },
                  items: [
                    {
                      id: "logout",
                      text: "Logout",
                      iconName: "exit",
                      type: "icon-button",
                    }
                  ]
                }
              ]
            }
          />
          {/* <div className="chat-header">
                <div className="header-buttons">
                </div>
              </div> */}
          <div className="messages-container scrollable">
            {messages.map((message, index) => (
              <div key={index}>
                <ChatBubble
                  ariaLabel={`${message.sender} message`}
                  type={message.sender === user.username ? "outgoing" : "incoming"}
                  avatar={
                    <Avatar
                      ariaLabel={message.sender}
                      tooltipText={message.sender}
                      color={message.sender === user.username ? "default" : "gen-ai"}
                      initials={message.sender.substring(0, 2).toUpperCase()}
                    />
                  }
                >
                  {message.text.split('\n').map((line, i) => (
                    <ReactMarkdown
                      key={'md-rendering' + i}
                      rehypePlugins={[rehypeRaw]} // Enables HTML parsing
                    >
                      {line}
                    </ReactMarkdown>
                  ))}
                </ChatBubble>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isAgentResponding && (
              <LiveRegion>
                <Box
                  margin={{ bottom: "xs", left: "l" }}
                  color="text-body-secondary"
                >
                  {!isStrandsAgent && tasksCompleted.count > 0 && (
                    <div>
                      {agentName.value} is working on your request | Tasks completed ({tasksCompleted.count})
                      <br />
                      <i>{tasksCompleted.latestRationale}</i>
                    </div>
                  )}
                  {isStrandsAgent && (
                    <div>
                      {agentName.value} is processing your request...
                    </div>
                  )}
                  <LoadingBar variant="gen-ai" />
                </Box>
              </LiveRegion>
            )}
          </div>
          <form onSubmit={handleSubmit} className="message-form">
            <Form
            >
              <FormField stretch>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    title={isListening ? "Stop Listening" : "Start Listening"}
                    className="mic-button"
                    hidden={!speechRecognitionSupported}
                  >
                    {isListening ? (
                      <svg xmlns="http://www.w3.org/2000/svg" height="28" width="28" fill="red" viewBox="0 0 24 24">
                        <path d="M12 14q-1.25 0-2.125-.875T9 11V5q0-1.25.875-2.125T12 2q1.25 0 2.125.875T15 5v6q0 1.25-.875 2.125T12 14Zm-1 7v-3.1q-2.875-.35-4.437-2.35Q5 13.55 5 11h2q0 2.075 1.463 3.538Q9.925 16 12 16q2.075 0 3.538-1.462Q17 13.075 17 11h2q0 2.55-1.563 4.55-1.562 2-4.437 2.35V21Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" height="28" width="28" fill="black" viewBox="0 0 24 24">
                        <path d="M12 14q-1.25 0-2.125-.875T9 11V5q0-1.25.875-2.125T12 2q1.25 0 2.125.875T15 5v6q0 1.25-.875 2.125T12 14Zm-1 7v-3.1q-2.875-.35-4.437-2.35Q5 13.55 5 11h2q0 2.075 1.463 3.538Q9.925 16 12 16q2.075 0 3.538-1.462Q17 13.075 17 11h2q0 2.55-1.563 4.55-1.562 2-4.437 2.35V21Z" />
                      </svg>
                    )}
                  </button>
                  <div style={{ flex: 1 }}>
                    <PromptInput
                      type='text'
                      value={newMessage}
                      onChange={({ detail }) => setNewMessage(detail.value)}
                      placeholder='Type your question here...'
                      actionButtonAriaLabel="Send message"
                      actionButtonIconName="send"
                    />
                  </div>
                </div>

              </FormField>
            </Form>

          </form>
          {/* Clear Data Confirmation Modal */}

          <Modal
            onDismiss={() => setShowClearDataModal(false)}
            visible={showClearDataModal}
            header="Confirm clearing data"
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="link" onClick={() => setShowClearDataModal(false)}>Cancel</Button>
                  <Button variant="primary" onClick={confirmClearData}>Ok</Button>
                </SpaceBetween>
              </Box>
            }
          >
            <strong>This action cannot be undone.</strong> Configuration for this application will be deleted along with the chat history with {agentName.value}. Do you want to continue?
          </Modal>
        </div>
      </Container>

    </div>
    //   }
    // >

    // </ContentLayout>  
  );
};

ChatComponent.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  onConfigEditorClick: PropTypes.func.isRequired
};

export default ChatComponent;

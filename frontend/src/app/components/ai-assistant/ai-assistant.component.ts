import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  attachments?: ChatAttachment[];
  suggestions?: string[];
  isTyping?: boolean;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'medical-record';
  url: string;
  size?: number;
}

export interface AICapability {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'medical' | 'administrative' | 'compliance' | 'analysis';
  examples: string[];
}

export interface ConversationContext {
  caseId?: string;
  patientId?: string;
  facilityId?: string;
  userId: string;
  sessionId: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss']
})
export class AIAssistantComponent implements OnInit, OnDestroy, AfterViewChecked {
  
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  
  // Chat state
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  isConnected = false;
  typingIndicator = false;
  
  // UI state
  showCapabilities = true;
  showHistory = false;
  sidebarCollapsed = false;
  
  // Conversation context
  context: ConversationContext = {
    userId: 'current-user',
    sessionId: this.generateSessionId()
  };
  
  // AI capabilities
  capabilities: AICapability[] = [
    {
      id: 'medical-coding',
      title: 'Medical Coding Assistance',
      description: 'Help with ICD-10, CPT, and DRG coding questions',
      icon: 'medical-code',
      category: 'medical',
      examples: [
        'What is the ICD-10 code for acute myocardial infarction?',
        'Help me code this procedure note',
        'Suggest appropriate DRG for this case'
      ]
    },
    {
      id: 'clinical-documentation',
      title: 'Clinical Documentation',
      description: 'Assist with clinical documentation improvement',
      icon: 'documentation',
      category: 'medical',
      examples: [
        'Review this discharge summary for completeness',
        'Suggest clinical queries for this case',
        'Help improve documentation specificity'
      ]
    },
    {
      id: 'compliance-check',
      title: 'Compliance Analysis',
      description: 'Analyze cases for compliance and regulatory requirements',
      icon: 'compliance',
      category: 'compliance',
      examples: [
        'Check this case for compliance issues',
        'Review coding accuracy',
        'Identify potential audit risks'
      ]
    },
    {
      id: 'financial-analysis',
      title: 'Financial Impact Analysis',
      description: 'Analyze financial implications and reimbursement optimization',
      icon: 'analytics',
      category: 'analysis',
      examples: [
        'Calculate DRG optimization potential',
        'Analyze case mix impact',
        'Review reimbursement opportunities'
      ]
    },
    {
      id: 'workflow-automation',
      title: 'Workflow Assistance',
      description: 'Help with administrative tasks and workflow optimization',
      icon: 'automation',
      category: 'administrative',
      examples: [
        'Create case summary',
        'Generate query templates',
        'Schedule follow-up tasks'
      ]
    },
    {
      id: 'education',
      title: 'Medical Education',
      description: 'Provide educational content and training materials',
      icon: 'education',
      category: 'medical',
      examples: [
        'Explain medical terminology',
        'Provide coding guidelines',
        'Share best practices'
      ]
    }
  ];
  
  // Quick actions
  quickActions = [
    'Analyze current case',
    'Check coding accuracy',
    'Generate documentation query',
    'Review compliance',
    'Calculate financial impact',
    'Create case summary'
  ];
  
  // Conversation history
  conversationHistory: { title: string; timestamp: Date; messageCount: number }[] = [];
  
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor() {
    this.initializeWelcomeMessage();
    this.loadConversationHistory();
  }

  ngOnInit() {
    this.connectToAI();
    this.loadContextFromRoute();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.disconnectFromAI();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private initializeWelcomeMessage() {
    const welcomeMessage: ChatMessage = {
      id: this.generateMessageId(),
      content: `Hello! I'm your AI Assistant for SmartCycle AI. I can help you with:

• Medical coding and documentation
• Compliance analysis and audit preparation  
• Clinical decision support
• Financial impact analysis
• Workflow optimization
• Educational resources

How can I assist you today?`,
      type: 'assistant',
      timestamp: new Date(),
      suggestions: [
        'Show me capabilities',
        'Analyze a case',
        'Help with coding',
        'Check compliance'
      ]
    };
    
    this.messages = [welcomeMessage];
  }

  private loadConversationHistory() {
    // In a real app, this would load from backend
    this.conversationHistory = [
      {
        title: 'DRG Coding Analysis - Case #12345',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        messageCount: 15
      },
      {
        title: 'Compliance Review Session',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        messageCount: 8
      },
      {
        title: 'Clinical Documentation Query',
        timestamp: new Date(Date.now() - 259200000), // 3 days ago
        messageCount: 12
      }
    ];
  }

  private connectToAI() {
    // Simulate connection to AI service
    setTimeout(() => {
      this.isConnected = true;
      this.addSystemMessage('Connected to AI Assistant');
    }, 1000);
  }

  private disconnectFromAI() {
    this.isConnected = false;
  }

  private loadContextFromRoute() {
    // In a real app, this would extract context from route parameters
    // For now, we'll use default context
  }

  // Message handling
  async sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      content: this.currentMessage.trim(),
      type: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.currentMessage = '';
    this.shouldScrollToBottom = true;
    this.isLoading = true;
    this.showTypingIndicator();

    try {
      // Simulate AI response
      const response = await this.getAIResponse(userMessage.content);
      this.hideTypingIndicator();
      this.addAssistantMessage(response);
    } catch (error) {
      this.hideTypingIndicator();
      this.addAssistantMessage('I apologize, but I encountered an error processing your request. Please try again.');
    }

    this.isLoading = false;
  }

  private async getAIResponse(userInput: string): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Simple response logic for demo purposes
    const input = userInput.toLowerCase();
    
    if (input.includes('code') || input.includes('icd') || input.includes('cpt')) {
      return this.getMedicalCodingResponse(input);
    } else if (input.includes('compliance') || input.includes('audit')) {
      return this.getComplianceResponse(input);
    } else if (input.includes('documentation') || input.includes('query')) {
      return this.getDocumentationResponse(input);
    } else if (input.includes('financial') || input.includes('drg') || input.includes('reimbursement')) {
      return this.getFinancialResponse(input);
    } else if (input.includes('help') || input.includes('capabilities')) {
      return this.getCapabilitiesResponse();
    } else {
      return this.getGeneralResponse(input);
    }
  }

  private getMedicalCodingResponse(input: string): string {
    return `I can help you with medical coding! Here are some key points:

• **ICD-10-CM**: Used for diagnosis coding with over 70,000 codes
• **CPT**: Current Procedural Terminology for procedures and services  
• **HCPCS**: Healthcare Common Procedure Coding System for supplies and services
• **DRG**: Diagnosis Related Groups for inpatient reimbursement

For specific coding questions, please provide:
- Patient diagnosis or procedure details
- Clinical documentation excerpts
- Specific coding scenario

Would you like me to help with a specific case or coding question?`;
  }

  private getComplianceResponse(input: string): string {
    return `Compliance analysis is crucial for healthcare organizations. I can help with:

• **Documentation Requirements**: Ensuring all required elements are present
• **Coding Accuracy**: Verifying codes match clinical documentation  
• **Regulatory Compliance**: CMS guidelines, Joint Commission standards
• **Audit Preparation**: Identifying potential risk areas
• **Quality Measures**: HEDIS, Core Measures, Hospital Compare

Common compliance areas to review:
- Medical necessity documentation
- Principal diagnosis selection
- Procedure coding accuracy
- Discharge disposition appropriateness

What specific compliance area would you like me to analyze?`;
  }

  private getDocumentationResponse(input: string): string {
    return `Clinical documentation improvement is essential for accurate coding and compliance:

• **Specificity**: Use precise medical terminology and avoid vague terms
• **Completeness**: Include all relevant clinical information
• **Clarity**: Write clear, unambiguous documentation
• **Timeliness**: Document care in real-time when possible

Key documentation elements:
- Present on Admission (POA) indicators
- Clinical significance of findings
- Treatment decisions and rationale
- Patient response to treatment

Would you like me to review specific documentation or suggest improvements for a case?`;
  }

  private getFinancialResponse(input: string): string {
    return `Financial impact analysis helps optimize reimbursement and identify opportunities:

• **DRG Optimization**: Ensure appropriate DRG assignment
• **Case Mix Index**: Monitor complexity and reimbursement impact
• **Denial Management**: Reduce claim denials through proper documentation
• **Revenue Cycle**: Improve coding accuracy and billing processes

Financial metrics to monitor:
- Case Mix Index trends
- Coding accuracy rates  
- Denial rates by DRG
- Average length of stay
- Readmission rates

What financial aspect would you like me to analyze for your cases?`;
  }

  private getCapabilitiesResponse(): string {
    return `Here are my key capabilities:

🏥 **Medical Coding**: ICD-10, CPT, HCPCS, DRG assistance
📋 **Documentation**: Clinical documentation improvement guidance  
✅ **Compliance**: Regulatory requirement analysis and audit prep
💰 **Financial**: DRG optimization and revenue cycle analysis
⚙️ **Workflow**: Process automation and efficiency improvements
📚 **Education**: Medical terminology and coding guidelines

I can also:
- Analyze uploaded medical records
- Generate clinical queries
- Create case summaries
- Provide real-time coding assistance
- Suggest documentation improvements

What would you like to explore?`;
  }

  private getGeneralResponse(input: string): string {
    return `I understand you're asking about "${input}". I'm here to help with healthcare-related questions including:

- Medical coding and billing
- Clinical documentation
- Compliance and regulatory requirements
- Financial analysis and optimization
- Workflow improvements

Could you provide more specific details about what you'd like assistance with? I can give more targeted guidance with additional context.`;
  }

  private addAssistantMessage(content: string, suggestions?: string[]) {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      content,
      type: 'assistant',
      timestamp: new Date(),
      suggestions
    };

    this.messages.push(message);
    this.shouldScrollToBottom = true;
  }

  private addSystemMessage(content: string) {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      content,
      type: 'system',
      timestamp: new Date()
    };

    this.messages.push(message);
    this.shouldScrollToBottom = true;
  }

  private showTypingIndicator() {
    this.typingIndicator = true;
    const typingMessage: ChatMessage = {
      id: 'typing-indicator',
      content: '',
      type: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };
    this.messages.push(typingMessage);
    this.shouldScrollToBottom = true;
  }

  private hideTypingIndicator() {
    this.typingIndicator = false;
    this.messages = this.messages.filter(m => m.id !== 'typing-indicator');
  }

  // UI interactions
  onCapabilityClick(capability: AICapability) {
    this.currentMessage = capability.examples[0];
    this.sendMessage();
  }

  onQuickActionClick(action: string) {
    this.currentMessage = action;
    this.sendMessage();
  }

  onSuggestionClick(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // File handling
  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    // Handle file uploads for analysis
    console.log('Files selected:', files);
  }

  // Conversation management
  newConversation() {
    this.messages = [];
    this.context.sessionId = this.generateSessionId();
    this.initializeWelcomeMessage();
    this.showCapabilities = true;
  }

  loadConversation(conversation: any) {
    // Load previous conversation
    console.log('Loading conversation:', conversation);
  }

  exportConversation() {
    // Export conversation as text or PDF
    const conversation = this.messages
      .filter(m => m.type !== 'system')
      .map(m => `${m.type.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private generateSessionId(): string {
    return 'session-' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.log('Scroll error:', err);
    }
  }

  // Getters for template
  get filteredCapabilities() {
    return this.capabilities;
  }

  get hasMessages() {
    return this.messages.length > 1; // More than just welcome message
  }

  get canSend() {
    return this.currentMessage.trim().length > 0 && !this.isLoading && this.isConnected;
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleCapabilities() {
    this.showCapabilities = !this.showCapabilities;
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  trackMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  formatMessageContent(content: string): string {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/•/g, '&bull;');
  }
} 
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface QueryTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  placeholders: string[];
}

interface GeneratedQuery {
  id: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  recipient: string;
  status: 'draft' | 'sent' | 'responded';
  createdAt: Date;
}

@Component({
  selector: 'app-query-generator',
  templateUrl: './query-generator.component.html',
  styleUrls: ['./query-generator.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatCheckboxModule
  ]
})
export class QueryGeneratorComponent implements OnInit {
  @Input() caseData: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<GeneratedQuery>();

  // Component state
  activeTab = 0;
  isGenerating = false;
  currentQuery: Partial<GeneratedQuery> = {};

  // Form data
  selectedTemplate: QueryTemplate | null = null;
  queryContent = '';
  queryPriority: 'high' | 'medium' | 'low' = 'medium';
  queryCategory = '';
  recipient = '';
  additionalContext = '';

  // Predefined templates
  queryTemplates: QueryTemplate[] = [
    {
      id: 'documentation-clarification',
      name: 'Documentation Clarification',
      category: 'Documentation',
      template: `Dear {{recipient}},

We are conducting a Clinical Documentation Improvement review for {{patientName}} ({{patientId}}) admitted on {{admissionDate}}.

To ensure accurate coding and reimbursement, we need clarification on the following:

{{specificQuestions}}

Your response will help us determine the most appropriate DRG assignment and ensure compliant documentation.

Please respond within {{timeframe}} business days.

Best regards,
{{yourName}}
CDI Specialist`,
      placeholders: ['recipient', 'patientName', 'patientId', 'admissionDate', 'specificQuestions', 'timeframe', 'yourName']
    },
    {
      id: 'severity-clarification',
      name: 'Severity/Complexity Clarification',
      category: 'Clinical',
      template: `Dear {{recipient}},

We are reviewing the documentation for {{patientName}} ({{patientId}}) and need clarification regarding the severity/complexity of the condition(s) documented.

Current documentation indicates: {{currentDocumentation}}

To support optimal DRG assignment, please clarify:
• {{specificClinicalQuestions}}

This information will help ensure accurate reflection of the patient's condition and appropriate reimbursement.

Please respond by {{dueDate}}.

Thank you,
{{yourName}}`,
      placeholders: ['recipient', 'patientName', 'patientId', 'currentDocumentation', 'specificClinicalQuestions', 'dueDate', 'yourName']
    },
    {
      id: 'mcc-clarification',
      name: 'MCC/CC Clarification',
      category: 'Coding',
      template: `Dear {{recipient}},

During our CDI review of {{patientName}} ({{patientId}}), we identified potential Major Complicating Conditions (MCC) or Complicating Conditions (CC) that may impact DRG assignment.

Current conditions documented:
{{currentConditions}}

Please clarify if the following conditions were present and clinically significant:
{{potentialConditions}}

Supporting documentation of these conditions could result in a higher-weighted DRG.

Response needed by {{deadline}}.

Best regards,
{{yourName}}`,
      placeholders: ['recipient', 'patientName', 'patientId', 'currentConditions', 'potentialConditions', 'deadline', 'yourName']
    }
  ];

  // Recipients
  recipients = [
    'Attending Physician',
    'Primary Care Provider',
    'Consulting Physician',
    'Nursing Staff',
    'Case Manager',
    'Documentation Specialist'
  ];

  // Categories
  categories = [
    'Documentation',
    'Clinical',
    'Coding',
    'Compliance',
    'Billing',
    'Quality'
  ];

  // Recent queries
  recentQueries: GeneratedQuery[] = [
    {
      id: '1',
      content: 'Clarification needed for sepsis documentation...',
      priority: 'high',
      category: 'Clinical',
      recipient: 'Dr. Smith',
      status: 'sent',
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: '2',
      content: 'MCC documentation for heart failure...',
      priority: 'medium',
      category: 'Coding',
      recipient: 'Dr. Johnson',
      status: 'responded',
      createdAt: new Date(Date.now() - 172800000) // 2 days ago
    }
  ];

  ngOnInit() {
    this.initializeFromCase();
  }

  initializeFromCase() {
    if (this.caseData) {
      this.queryContent = `Patient: ${this.caseData.patientName || 'N/A'}\nCase ID: ${this.caseData.id || 'N/A'}\n\n`;
    }
  }

  selectTemplate(template: QueryTemplate) {
    this.selectedTemplate = template;
    this.queryCategory = template.category;
    this.populateTemplateContent(template);
  }

  populateTemplateContent(template: QueryTemplate) {
    let content = template.template;
    
    // Replace placeholders with case data if available
    if (this.caseData) {
      content = content
        .replace(/{{patientName}}/g, this.caseData.patientName || '[Patient Name]')
        .replace(/{{patientId}}/g, this.caseData.id || '[Patient ID]')
        .replace(/{{admissionDate}}/g, this.formatDate(this.caseData.admissionDate) || '[Admission Date]')
        .replace(/{{yourName}}/g, 'CDI Specialist');
    }
    
    // Mark remaining placeholders for user input
    content = content.replace(/{{(\w+)}}/g, '[Please specify $1]');
    
    this.queryContent = content;
  }

  generateAIQuery() {
    this.isGenerating = true;
    
    // Simulate AI generation
    setTimeout(() => {
      const aiSuggestion = this.generateAISuggestion();
      this.queryContent = aiSuggestion;
      this.isGenerating = false;
    }, 2000);
  }

  generateAISuggestion(): string {
    const context = this.caseData ? 
      `Patient: ${this.caseData.patientName}\nDiagnosis: ${this.caseData.primaryDiagnosis || 'N/A'}\nCurrent DRG: ${this.caseData.currentDrg || 'N/A'}` : 
      'No case context available';

    return `Based on the current case documentation, I recommend the following query:

Dear Provider,

We are conducting a Clinical Documentation Improvement review for the above patient and need clarification to ensure accurate coding and optimal reimbursement.

Current Documentation Review:
${context}

Specific Questions:
1. Can you clarify the severity and clinical significance of the documented conditions?
2. Were there any complications or comorbidities that affected the patient's treatment?
3. Please provide additional documentation supporting the primary diagnosis.

Your timely response will help ensure accurate DRG assignment and compliant documentation.

Please respond within 48 hours.

Thank you for your attention to this matter.

Best regards,
CDI Team`;
  }

  sendQuery() {
    if (!this.queryContent.trim()) return;

    const query: GeneratedQuery = {
      id: Date.now().toString(),
      content: this.queryContent,
      priority: this.queryPriority,
      category: this.queryCategory,
      recipient: this.recipient,
      status: 'sent',
      createdAt: new Date()
    };

    this.recentQueries.unshift(query);
    this.onSend.emit(query);
    this.resetForm();
  }

  saveDraft() {
    const query: GeneratedQuery = {
      id: Date.now().toString(),
      content: this.queryContent,
      priority: this.queryPriority,
      category: this.queryCategory,
      recipient: this.recipient,
      status: 'draft',
      createdAt: new Date()
    };

    this.recentQueries.unshift(query);
    // In a real app, this would save to backend
    console.log('Draft saved:', query);
  }

  resetForm() {
    this.queryContent = '';
    this.selectedTemplate = null;
    this.queryCategory = '';
    this.recipient = '';
    this.additionalContext = '';
    this.initializeFromCase();
  }

  closeGenerator() {
    this.onClose.emit();
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent': return 'send';
      case 'responded': return 'check_circle';
      case 'draft': return 'edit';
      default: return 'help';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }
} 
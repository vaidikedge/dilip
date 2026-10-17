export interface LeadPayload {
  leadId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  capacityKw: number;
  priority: string;
  source?: string;
  creatorName?: string;
  projectTitle?: string;
  ownerCommand?: string;
  taskCode?: string;
  title?: string;
  message?: string;
  authorName?: string;
  authorLabel?: string;
}

// ----------------------------------------------------------------------
// 1. OWNER / SYSTEM CREATES LEAD -> Only notify explicitly assigned staff
// ----------------------------------------------------------------------
export function handleOwnerLeadCreation(
  lead: LeadPayload, 
  allUsers: any[], 
  assignedIdsForStep1And2: string[] = [], // Explicit assignment list by Super Admin / Template
  userStepMap?: Record<string, number> // Map of userId -> stepNumber (1 or 2)
) {
  // Guard: Ensure assignedIdsForStep1And2 is strictly an array of string IDs
  const explicitStaffIds: string[] = Array.isArray(assignedIdsForStep1And2)
    ? assignedIdsForStep1And2.filter((id) => typeof id === 'string')
    : [];

  // Target ONLY Owners, Super Admins, and staff explicitly assigned to Step 1 & 2
  const targetUsers = (allUsers || []).filter(u => 
    u && (u.role === 'owner' || u.role === 'Super Admin' || explicitStaffIds.includes(u.id))
  );

  const directives: any[] = [];
  targetUsers.forEach(user => {
    const isOwner = user.role === 'owner' || user.role === 'Super Admin';
    const notifId = `notif-${Date.now()}-${user.id}-${Math.random().toString(36).substr(2, 5)}`;
    const stepNum = userStepMap?.[user.id] || 1;
    const defaultMsg = isOwner
      ? `New Lead Created: ${lead.customerName || 'Client'} (${lead.capacityKw || 3}kW Solar). Dispatched to Task 1 & Task 2 assigned staff.`
      : `New Project Assigned: ${lead.customerName || 'Client'} (${lead.capacityKw || 3}kW Solar). Action required for Task Step #${stepNum}.`;
    
    directives.push({
      id: notifId,
      itemType: 'TASK_ASSIGNED',
      leadId: lead.leadId,
      taskId: lead.leadId,
      taskCode: lead.taskCode || `WF-${(lead.customerName || 'LEAD').substring(0, 4).toUpperCase()}`,
      targetUserId: user.id,
      targetUserName: user.name,
      taskStep: stepNum, 
      projectDetails: {
        leadId: lead.leadId,
        customerName: lead.customerName,
        customerPhone: lead.customerPhone,
        customerAddress: lead.customerAddress,
        capacityKw: lead.capacityKw || 3,
        priority: lead.priority || 'High',
        taskStep: stepNum,
      },
      message: lead.message || defaultMsg,
      title: lead.title || "New Project Assigned",
      projectTitle: lead.projectTitle || `⚡ New Project Assigned: ${lead.customerName || 'Client'} (${lead.capacityKw || 3}kW Solar)`,
      customerName: lead.customerName || '',
      customerPhone: lead.customerPhone || '',
      customerAddress: lead.customerAddress || '',
      capacityKw: lead.capacityKw || 3,
      priority: lead.priority || 'High',
      ownerCommand: lead.ownerCommand || defaultMsg,
      status: 'not started',
      assignedBy: lead.creatorName || 'Dilip Kumar (Owner)',
      assignedAt: new Date().toISOString(),
      isOwnerInitiated: true,
      isRead: false,
      eventType: 'lead_creation'
    });
  });

  return { directivesToDeliver: directives };
}

// ----------------------------------------------------------------------
// 2. TASK STATUS UPDATE -> Strictly notify explicitly assigned staff for next steps (N2-N6)
// ----------------------------------------------------------------------
export function handleTaskStatusUpdate(
  actualClickedStep: number, 
  leadId: string, 
  arg3: any, 
  arg4?: any, 
  arg5: string[] | any = [],
  arg6?: Record<string, number>
) {
  // Gracefully handles both signatures:
  // (actualClickedStep, leadId, leadPayload, allUsers, assignedIdsForNextSteps, userStepMap)
  // (actualClickedStep, leadId, allUsers, leadPayload, assignedIdsForNextSteps, userStepMap)
  let allUsers: any[] = [];
  let leadPayload: any = {};
  let assignedIdsForNextSteps: string[] = [];
  let userStepMap: Record<string, number> | undefined = undefined;

  if (Array.isArray(arg3)) {
    allUsers = arg3;
    if (arg4 && typeof arg4 === 'object' && !Array.isArray(arg4)) {
      leadPayload = arg4;
    }
    if (Array.isArray(arg5)) {
      assignedIdsForNextSteps = arg5.filter((id: any) => typeof id === 'string');
    }
    if (arg6 && typeof arg6 === 'object' && !Array.isArray(arg6)) {
      userStepMap = arg6;
    }
  } else {
    leadPayload = arg3 || {};
    allUsers = Array.isArray(arg4) ? arg4 : [];
    if (Array.isArray(arg5)) {
      assignedIdsForNextSteps = arg5.filter((id: any) => typeof id === 'string');
    }
    if (arg6 && typeof arg6 === 'object' && !Array.isArray(arg6)) {
      userStepMap = arg6;
    }
  }

  // Only target Owners, Super Admins, OR users explicitly assigned to the next steps
  const targetUsers = (allUsers || []).filter(u => 
    u && (u.role === 'owner' || u.role === 'Super Admin' || assignedIdsForNextSteps.includes(u.id))
  );

  const directives: any[] = [];
  targetUsers.forEach(user => {
    const isOwner = user.role === 'owner' || user.role === 'Super Admin';
    const notifId = `notif-${Date.now()}-${user.id}-${Math.random().toString(36).substr(2, 5)}`;
    const targetStep = userStepMap?.[user.id] || (actualClickedStep + 1);
    const defaultMsg = isOwner
      ? `Task #${actualClickedStep} status updated. Handover dispatched to Task #${targetStep} assigned staff.`
      : `Task #${actualClickedStep} completed. Action required for Task Step #${targetStep}: ${leadPayload?.customerName || leadId}`;

    directives.push({
      id: notifId,
      itemType: 'TASK_UPDATED',
      leadId: leadId,
      taskId: leadId,
      taskCode: leadPayload?.taskCode || `WF-${(leadPayload?.customerName || 'LEAD').substring(0, 4).toUpperCase()}`,
      targetUserId: user.id,
      targetUserName: user.name,
      taskStep: targetStep,
      projectDetails: leadPayload,
      message: leadPayload?.message || defaultMsg,
      title: leadPayload?.title || `Task ${actualClickedStep} Status Updated`,
      projectTitle: leadPayload?.projectTitle || `Task ${actualClickedStep} Completed: ${leadPayload?.customerName || leadId}`,
      customerName: leadPayload?.customerName || '',
      customerPhone: leadPayload?.customerPhone || '',
      customerAddress: leadPayload?.customerAddress || '',
      capacityKw: leadPayload?.capacityKw || 3,
      priority: leadPayload?.priority || 'High',
      ownerCommand: leadPayload?.ownerCommand || defaultMsg,
      status: leadPayload?.status || 'in progress',
      assignedBy: leadPayload?.authorLabel || leadPayload?.authorName || 'Dilip Kumar (Owner)',
      assignedAt: new Date().toISOString(),
      isOwnerInitiated: false,
      isRead: false,
      eventType: 'status_update'
    });
  });

  return { directivesToDeliver: directives };
}

// ----------------------------------------------------------------------
// 3. STEP & TASK AUTHORIZATION HELPERS (N7 RULE)
// ----------------------------------------------------------------------

/**
 * Resolves current active flow step numbers according to strict N1-N6 cascade:
 * N1: Lead creation -> Task 1 & 2
 * N2: Task 1 update -> Task 2 & 3
 * N3: Task 2 update -> Task 3 & 4
 * N4: Task 3 update -> Task 4 & 5
 * N5: Task 4 update -> Task 5 & 6
 * N6: Task 5 update -> Task 6 & 7
 * General: Task K update -> Task K+1 & Task K+2
 */
export function resolveActiveFlowStepNumbers(
  workflow?: { currentActiveFlowStepNumbers?: number[]; steps?: Array<{ stepNumber: number; status: string }> } | null,
  workflowSteps?: Array<{ stepNumber: number; status: string }>
): number[] {
  if (workflow?.currentActiveFlowStepNumbers && workflow.currentActiveFlowStepNumbers.length > 0) {
    return workflow.currentActiveFlowStepNumbers;
  }
  const steps = workflow?.steps || workflowSteps;
  if (!steps || steps.length === 0) return [1, 2];

  // Find the highest step number that has been updated (status !== 'not started')
  const updatedSteps = steps
    .filter((s) => s.status && s.status !== 'not started')
    .map((s) => s.stepNumber)
    .sort((a, b) => b - a);

  if (updatedSteps.length === 0) {
    return [1, 2];
  }

  const highestUpdated = updatedSteps[0];
  const total = steps.length;
  const nextSteps: number[] = [];
  if (highestUpdated + 1 <= total) nextSteps.push(highestUpdated + 1);
  if (highestUpdated + 2 <= total) nextSteps.push(highestUpdated + 2);
  return nextSteps.length > 0 ? nextSteps : [total];
}

/**
 * Checks whether currentUser is authorized to update a specific flowchart step.
 * RULE N7: Only the users of the task currently receiving project detail and notification
 * (activeFlowStepNumbers) have the power to update status.
 */
export function isStepAuthorizedForUser(
  stepNumber: number,
  currentUser: any,
  activeLeadId?: string,
  activeDirectives: any[] = [],
  workflowSteps?: Array<{ stepNumber: number; status: string; assignedUserIds?: string[] }>,
  isTemplate?: boolean,
  activeFlowStepNumbers?: number[]
): boolean {
  if (isTemplate) return false;
  if (!currentUser) return false;

  // 1. Owner & Super Admin supremacy
  if (currentUser.role === 'owner' || currentUser.role === 'Super Admin') return true;

  // 2. Staff user MUST be explicitly in assignedUserIds for this specific step
  const stepObj = workflowSteps?.find((s) => s.stepNumber === stepNumber);
  const isDirectlyAssignedToStep = Array.isArray(stepObj?.assignedUserIds) && stepObj.assignedUserIds.includes(currentUser.id);

  if (!isDirectlyAssignedToStep) {
    return false;
  }

  // 3. RULE N7: Must be in current active flow step numbers!
  // "jiss task k paas project detail or notification jaegi usi task k user k paas power hogi status update kerne ki"
  const activeNums = (activeFlowStepNumbers && activeFlowStepNumbers.length > 0)
    ? activeFlowStepNumbers
    : resolveActiveFlowStepNumbers(null, workflowSteps);

  return activeNums.includes(stepNumber);
}

export function isUserAuthorizedToUpdateTaskStatus(
  currentUser: any,
  stepOrTask: any,
  leadWorkflowsOrDirectives?: any,
  usersOrDirectives?: any,
  ownerDirectives?: any,
  isTemplate?: boolean
): boolean {
  if (isTemplate || stepOrTask?.isTemplate || stepOrTask?.isWorkflowTemplate) {
    return false;
  }
  if (!currentUser) return false;
  if (currentUser.role === 'owner' || currentUser.role === 'Super Admin') return true;

  let allDirectives: any[] = [];
  if (Array.isArray(ownerDirectives) && ownerDirectives.length > 0) {
    allDirectives = ownerDirectives;
  } else if (Array.isArray(usersOrDirectives) && usersOrDirectives[0]?.targetUserId) {
    allDirectives = usersOrDirectives;
  } else if (Array.isArray(leadWorkflowsOrDirectives) && leadWorkflowsOrDirectives[0]?.targetUserId) {
    allDirectives = leadWorkflowsOrDirectives;
  }

  const leadWorkflows: any[] =
    Array.isArray(leadWorkflowsOrDirectives) && leadWorkflowsOrDirectives[0]?.steps
      ? leadWorkflowsOrDirectives
      : leadWorkflowsOrDirectives?.steps
      ? [leadWorkflowsOrDirectives]
      : [];

  let stepNumber = 1;
  let activeLeadId: string | undefined = undefined;

  if (typeof stepOrTask === 'number') {
    stepNumber = stepOrTask;
  } else if (stepOrTask && typeof stepOrTask.stepNumber === 'number') {
    stepNumber = stepOrTask.stepNumber;
    activeLeadId = stepOrTask.leadId || stepOrTask.taskId;
  } else if (stepOrTask) {
    activeLeadId = stepOrTask.id || stepOrTask.leadId || stepOrTask.workflowId;
    if (stepOrTask.flowStep) {
      stepNumber = Number(stepOrTask.flowStep) || 1;
    }
  }

  if (!activeLeadId && leadWorkflowsOrDirectives) {
    activeLeadId = leadWorkflowsOrDirectives.leadId || leadWorkflowsOrDirectives.taskId || leadWorkflowsOrDirectives.id;
  }

  const matchingWorkflow =
    leadWorkflows.find(
      (wf: any) =>
        (activeLeadId && (wf.id === activeLeadId || wf.taskId === activeLeadId || wf.leadId === activeLeadId)) ||
        (stepOrTask?.customerPhone && wf.customerPhone === stepOrTask.customerPhone)
    ) || (leadWorkflows.length === 1 ? leadWorkflows[0] : undefined);

  const workflowSteps =
    matchingWorkflow?.steps ||
    (stepOrTask && typeof stepOrTask.stepNumber === 'number' && Array.isArray(stepOrTask.assignedUserIds) ? [stepOrTask] : undefined);

  const activeFlowStepNumbers = resolveActiveFlowStepNumbers(matchingWorkflow, workflowSteps);

  // If checking a generic task (not a specific step):
  if (stepOrTask && typeof stepOrTask.stepNumber !== 'number') {
    if (workflowSteps && workflowSteps.length > 0) {
      return workflowSteps.some((st: any) =>
        activeFlowStepNumbers.includes(st.stepNumber) &&
        Array.isArray(st.assignedUserIds) &&
        st.assignedUserIds.includes(currentUser.id)
      );
    }
  }

  return isStepAuthorizedForUser(
    stepNumber,
    currentUser,
    activeLeadId,
    allDirectives,
    workflowSteps,
    isTemplate,
    activeFlowStepNumbers
  );
}

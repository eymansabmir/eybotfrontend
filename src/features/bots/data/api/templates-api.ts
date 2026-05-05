import { NodeType } from "@/features/nodes/node-types.constants";

export const templatesApi = {
  getTemplateById: async (id: string) => {
    switch (id) {
      case "lead-gen":
        return {
          nodes: [
            { id: "start", type: NodeType.START, label: "Start Flow", position: { x: 500, y: 0 }, data: {}, branches: [{ key: "default", label: "Default" }] },
            { id: "greet", type: NodeType.SEND_TEXT, label: "Greeting", position: { x: 500, y: 250 }, data: { message: "👋 Hello there! Welcome to our automated assistant. We'd love to learn more about your needs." }, branches: [{ key: "default", label: "Default" }] },
            { 
              id: "interest", 
              type: NodeType.SEND_BUTTONS, 
              label: "Check Interest", 
              position: { x: 500, y: 500 }, 
              data: { 
                body: "Are you interested in our premium services?", 
                buttons: [
                  { id: "yes", title: "Yes, tell me more" },
                  { id: "no", title: "Just browsing" }
                ],
                interaction: { mode: "input", input: { type: "choice", variableName: "is_interested", variableScope: "session" } }
              }, 
              branches: [
                { key: "yes", label: "Interested" },
                { key: "no", label: "Not Interested" }
              ] 
            },
            { id: "get-name", type: NodeType.ASK_QUESTION, label: "Ask Name", position: { x: 300, y: 800 }, data: { message: "Great choice! First, could you tell me your full name?", variableName: "full_name", variableScope: "contact", inputType: "text", timeoutSeconds: 3600 }, branches: [{ key: "default", label: "Success" }] },
            { id: "get-email", type: NodeType.ASK_QUESTION, label: "Ask Email", position: { x: 300, y: 1100 }, data: { message: "Thanks {{full_name}}! What's the best email to reach you at?", variableName: "email", variableScope: "contact", inputType: "email", timeoutSeconds: 3600 }, branches: [{ key: "default", label: "Success" }] },
            { id: "thanks-lead", type: NodeType.SEND_TEXT, label: "Confirmation", position: { x: 300, y: 1400 }, data: { message: "Perfect! One of our experts will contact you at {{email}} within 24 hours. Have a great day!" }, branches: [{ key: "default", label: "Default" }] },
            { id: "bye-casual", type: NodeType.SEND_TEXT, label: "Casual Exit", position: { x: 700, y: 800 }, data: { message: "No problem at all! Feel free to reach out whenever you're ready. Enjoy your visit!" }, branches: [{ key: "default", label: "Default" }] },
            { id: "end", type: NodeType.END, label: "Finish", position: { x: 500, y: 1700 }, data: {}, branches: [] },
          ],
          edges: [
            { id: "e1", source: "start", target: "greet", sourceHandle: "default" },
            { id: "e2", source: "greet", target: "interest", sourceHandle: "default" },
            { id: "e3", source: "interest", target: "get-name", sourceHandle: "yes" },
            { id: "e4", source: "interest", target: "bye-casual", sourceHandle: "no" },
            { id: "e5", source: "get-name", target: "get-email", sourceHandle: "default" },
            { id: "e6", source: "get-email", target: "thanks-lead", sourceHandle: "default" },
            { id: "e7", source: "thanks-lead", target: "end", sourceHandle: "default" },
            { id: "e8", source: "bye-casual", target: "end", sourceHandle: "default" },
          ],
        };
      case "support-routing":
        return {
          nodes: [
            { id: "start", type: NodeType.START, label: "Start", position: { x: 600, y: 0 }, data: {}, branches: [{ key: "default", label: "Default" }] },
            { id: "intro", type: NodeType.SEND_TEXT, label: "Support Intro", position: { x: 600, y: 250 }, data: { message: "Welcome to Help Center. I'm your support bot. Let's get you to the right place." }, branches: [{ key: "default", label: "Default" }] },
            { 
              id: "routing", 
              type: NodeType.SEND_BUTTONS, 
              label: "Route Request", 
              position: { x: 600, y: 500 }, 
              data: { 
                body: "Which department do you need to reach?", 
                buttons: [
                  { id: "tech", title: "Technical Issue" },
                  { id: "billing", title: "Billing & Plans" },
                  { id: "other", title: "Something Else" }
                ],
                interaction: { mode: "input", input: { type: "choice", variableName: "support_type", variableScope: "session" } }
              }, 
              branches: [
                { key: "tech", label: "Tech" },
                { key: "billing", label: "Billing" },
                { key: "other", label: "Other" }
              ] 
            },
            { id: "tech-msg", type: NodeType.SEND_TEXT, label: "Tech Path", position: { x: 200, y: 800 }, data: { message: "I'm connecting you to our engineering team. Please describe your issue briefly below." }, branches: [{ key: "default", label: "Default" }] },
            { id: "billing-msg", type: NodeType.SEND_TEXT, label: "Billing Path", position: { x: 600, y: 800 }, data: { message: "Our billing specialists are ready to help. What's on your mind?" }, branches: [{ key: "default", label: "Default" }] },
            { id: "other-msg", type: NodeType.SEND_TEXT, label: "Other Path", position: { x: 1000, y: 800 }, data: { message: "Sure thing. Give me a moment to find the right agent for you." }, branches: [{ key: "default", label: "Default" }] },
            { id: "desc-issue", type: NodeType.ASK_QUESTION, label: "Collect Issue", position: { x: 600, y: 1100 }, data: { message: "Please type your message here:", variableName: "issue_desc", variableScope: "session", inputType: "text", timeoutSeconds: 3600 }, branches: [{ key: "default", label: "Success" }] },
            { id: "done", type: NodeType.SEND_TEXT, label: "Success", position: { x: 600, y: 1400 }, data: { message: "Thanks! A representative will be with you shortly. Your ticket ID is #{{session_id}}." }, branches: [{ key: "default", label: "Default" }] },
            { id: "end", type: NodeType.END, label: "End", position: { x: 600, y: 1700 }, data: {}, branches: [] },
          ],
          edges: [
            { id: "e1", source: "start", target: "intro", sourceHandle: "default" },
            { id: "e2", source: "intro", target: "routing", sourceHandle: "default" },
            { id: "e3", source: "routing", target: "tech-msg", sourceHandle: "tech" },
            { id: "e4", source: "routing", target: "billing-msg", sourceHandle: "billing" },
            { id: "e5", source: "routing", target: "other-msg", sourceHandle: "other" },
            { id: "e6", source: "tech-msg", target: "desc-issue", sourceHandle: "default" },
            { id: "e7", source: "billing-msg", target: "desc-issue", sourceHandle: "default" },
            { id: "e8", source: "other-msg", target: "desc-issue", sourceHandle: "default" },
            { id: "e9", source: "desc-issue", target: "done", sourceHandle: "default" },
            { id: "e10", source: "done", target: "end", sourceHandle: "default" },
          ],
        };
      default:
        return {
          nodes: [
            { id: "start", type: NodeType.START, label: "Start", position: { x: 250, y: 0 }, data: {}, branches: [{ key: "default", label: "Default" }] },
            { id: "hello", type: NodeType.SEND_TEXT, label: "Hello", position: { x: 250, y: 300 }, data: { message: "Hello! This is a simple template." }, branches: [{ key: "default", label: "Default" }] },
            { id: "end", type: NodeType.END, label: "End", position: { x: 250, y: 600 }, data: {}, branches: [] },
          ],
          edges: [
            { id: "e1", source: "start", target: "hello", sourceHandle: "default" },
            { id: "e2", source: "hello", target: "end", sourceHandle: "default" },
          ],
        };
    }
  },
};

// Supabase Edge Function (Deno runtime) — the app's only backend.
//
// This is the trust boundary: it is the single place the Anthropic API key is
// read (server-side, from an encrypted secret) and the only thing that talks to
// Claude. The browser never sees the key. Routes are prefixed with the function
// slug `make-server-45e67790` because Supabase passes the full path through.
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import Anthropic from "npm:@anthropic-ai/sdk";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-45e67790/health", (c) => {
  return c.json({ status: "ok" });
});

// Generate documents endpoint — the core of the service.
// Receives the full intake form and returns four generated advisory documents.
app.post("/make-server-45e67790/generate-documents", async (c) => {
  try {
    const formData = await c.req.json();

    // The Anthropic key is read here and ONLY here, from a Supabase secret.
    // It is never bundled into the client, logged, or returned.
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'ANTHROPIC_API_KEY is not set on the server' }, 500);
    }

    const anthropic = new Anthropic({ apiKey });

    // Fan-out: each document is an independent Claude call, so run all four
    // concurrently. Wall-clock latency is the slowest single call, not the sum.
    const [riskProfile, goalsBrief, planningAgenda, draftIPS] = await Promise.all([
      generateDocument(anthropic, 'risk-profile', formData),
      generateDocument(anthropic, 'goals-brief', formData),
      generateDocument(anthropic, 'planning-agenda', formData),
      generateDocument(anthropic, 'draft-ips', formData),
    ]);

    return c.json({
      riskProfile,
      goalsBrief,
      planningAgenda,
      draftIPS,
    });
  } catch (error) {
    console.log('Error generating documents:', error);
    return c.json({ error: 'Failed to generate documents: ' + (error as Error).message }, 500);
  }
});

// Generates one document. The only thing that varies per document type is the
// prompt; the model, system instruction, and token budget are shared below.
// Each prompt interpolates the client profile and enumerates the exact sections
// the document must contain, and asks for Markdown so it renders and exports cleanly.
async function generateDocument(
  anthropic: Anthropic,
  docType: string,
  formData: any
): Promise<string> {
  const prompts = {
    'risk-profile': `Generate a concise Client Risk Profile document based on the following client information:

Client Name: ${formData.basicInfo.clientName}
Age: ${formData.basicInfo.age}
Employment: ${formData.basicInfo.employmentStatus || 'Not specified'}
Annual Income: $${parseInt(formData.financial.annualIncome).toLocaleString()}
Total Assets: $${parseInt(formData.financial.totalAssets).toLocaleString()}
Investment Experience: ${formData.financial.investmentExperience || 'Not specified'}

Risk Assessment Results:
- Risk Profile: ${formData.risk.riskProfile}
- Risk Score: ${formData.risk.riskScore?.toFixed(2)} / 4.0
- Market Decline Response: ${formData.risk.marketDecline}
- Investment Goal: ${formData.risk.investmentGoal}
- Time Horizon: ${formData.risk.timeHorizon}
- Risk Tolerance: ${formData.risk.riskTolerance}

Create a professional risk profile document with:
1. Executive summary
2. Detailed risk assessment findings
3. Recommended asset allocation based on the ${formData.risk.riskProfile} profile
4. Next steps

Format in markdown.`,

    'goals-brief': `Generate a concise Financial Goals Brief based on:

Client: ${formData.basicInfo.clientName}
Current Age: ${formData.basicInfo.age}

Retirement Goals:
- Target Retirement Age: ${formData.goals.retirementAge || 'Not specified'}
- Desired Annual Retirement Income: ${formData.goals.retirementIncome ? '$' + parseInt(formData.goals.retirementIncome).toLocaleString() : 'Not specified'}

Additional Goals:
${formData.goals.goals?.map((g: any, i: number) => `
Goal ${i + 1}: ${g.description}
- Target Amount: ${g.targetAmount ? '$' + parseInt(g.targetAmount).toLocaleString() : 'Not specified'}
- Timeframe: ${g.timeframe || 'Not specified'}
- Priority: ${g.priority || 'Not specified'}
`).join('\n') || 'No additional goals specified'}

Create a professional goals brief with:
1. Retirement planning analysis
2. Each goal detailed with actionable strategies
3. Strategic recommendations for achieving goals
4. Priority ranking considerations

Format in markdown.`,

    'planning-agenda': `Create a concise Client Planning Meeting Agenda for:

Client: ${formData.basicInfo.clientName}
Financial Profile:
- Annual Income: $${parseInt(formData.financial.annualIncome).toLocaleString()}
- Total Assets: $${parseInt(formData.financial.totalAssets).toLocaleString()}
- Risk Profile: ${formData.risk.riskProfile}

Goals Summary:
${formData.goals.retirementAge ? `- Retirement at age ${formData.goals.retirementAge}` : ''}
${formData.goals.goals?.map((g: any) => `- ${g.description}`).join('\n')}

Create a detailed 90-minute meeting agenda with:
1. Meeting objectives
2. Timed agenda items with specific discussion points
3. Documents needed
4. Action items and next steps

Format in markdown.`,

    'draft-ips': `Generate a concise Draft Investment Policy Statement (IPS) for:

Client Profile:
- Name: ${formData.basicInfo.clientName}
- Age: ${formData.basicInfo.age}
- Employment: ${formData.basicInfo.employmentStatus || 'Not specified'}
- Marital Status: ${formData.basicInfo.maritalStatus || 'Not specified'}

Financial Situation:
- Annual Income: $${parseInt(formData.financial.annualIncome).toLocaleString()}
- Total Assets: $${parseInt(formData.financial.totalAssets).toLocaleString()}
- Investment Experience: ${formData.financial.investmentExperience || 'Not specified'}

Risk Profile: ${formData.risk.riskProfile} (Score: ${formData.risk.riskScore?.toFixed(2)}/4.0)

Goals:
${formData.goals.retirementAge ? `- Retirement at age ${formData.goals.retirementAge}` : ''}
${formData.goals.goals?.map((g: any) => `- ${g.description} (${g.timeframe})`).join('\n')}

Create a professional IPS with standard sections:
1. Purpose & Scope
2. Client Profile
3. Financial Situation
4. Investment Objectives
5. Risk Tolerance
6. Strategic Asset Allocation (with specific percentages for ${formData.risk.riskProfile} profile)
7. Rebalancing Policy
8. Investment Selection Criteria
9. Performance Benchmarks
10. Reporting & Review schedule
11. Signature section

Format in markdown.`,
  };

  const message = await anthropic.messages.create({
    // Haiku: the task is templated drafting from structured data, not open-ended
    // reasoning. It's the fastest/cheapest tier — which matters at 4 calls each run.
    model: 'claude-haiku-4-5-20251001',
    // 1200 is a hard ceiling well above the ~350-word target, so nothing truncates.
    // Lowering it from 4000 (plus the brevity system prompt) cut output cost ~80%.
    max_tokens: 1200,
    // Shared brevity steer — the main lever for keeping documents dense and cheap.
    system:
      'You generate concise professional financial advisory documents. ' +
      'Be brief and information-dense: use short bullet points and compact tables, ' +
      'not long prose. Avoid repetition, filler, disclaimers, and boilerplate. ' +
      'Do not restate the prompt. Keep each document under ~350 words.',
    messages: [
      {
        role: 'user',
        content: prompts[docType as keyof typeof prompts],
      },
    ],
  });

  // Return the generated Markdown (or empty string if the model returned no text block).
  return message.content[0].type === 'text' ? message.content[0].text : '';
}

// Boot the Deno HTTP server with the Hono app as the request handler.
Deno.serve(app.fetch);

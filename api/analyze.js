
// This code runs on Vercel's serverless environment, not in the browser.
import fetch from 'node-fetch';

// Configuration
// Using an empty key allows the secure Vercel environment to provide the auth token.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; 
const BSSC_RPC_URL = 'https://bssc-rpc.bssc.live';
const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';

/**
 * Performs a server-side JSON-RPC call to get the BSSC balance for an address.
 * @param {string} address The BSSC (Solana-based) wallet address.
 * @returns {Promise<string>} Context string containing the balance or a warning.
 */
async function getBSSCBalance(address) {
  try {
    const rpcPayload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
    };

    const rpcRes = await fetch(BSSC_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcPayload),
    });
    
    const rpcData = await rpcRes.json();
    
    if (rpcData.error || !rpcData.result) {
        console.warn(`RPC call failed for ${address}:`, rpcData.error?.message || 'No result found.');
        return `Warning: RPC call to BSSC endpoint failed. No live balance data available.`;
    }

    // Balance is in lamports; 1 BSSC is 1,000,000,000 lamports (Solana standard)
    const balanceLamports = rpcData.result.value;
    const balanceBSSC = balanceLamports / 1000000000;
    
    return `RPC Data: The current BSSC balance for address ${address} is ${balanceBSSC} BSSC Testnet Faucet Token (If the query was an address).`;

  } catch (err) {
    console.error('Server-side RPC Fetch Error:', err);
    return `Warning: Critical network error during server-side RPC fetch: ${err.message}.`;
  }
}

/**
 * Vercel Serverless Entry Point
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body; 
  
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter.' });
  }

  try {
    let context = '';
    // Simple heuristic for checking if the query is an address (Solana addresses are long)
    const isAddress = query.length >= 30 && !query.includes(' ') && !query.includes('?');
    // Enable Google Search for all non-address queries (for general BSSC info or other questions)
    let useGoogleSearchTool = !isAddress; 

    if (isAddress) {
      context = await getBSSCBalance(query);
      // Even if it is an address, we enable Google Search grounding 
      // to ensure we can get transaction details or fallback BSSC information
      useGoogleSearchTool = true; 
    }
    
    // --- System Instruction for Professional Output ---
    const systemInstruction = `You are a professional BSSC Blockchain Analyst and AI Assistant. Your response must be clean, concise, and professional.
    1. BSSC Network: It is a fork built on the **Solana blockchain**.
    2. BSSC Token: The native token is the **BSSC Testnet Faucet Token**, used strictly for testing and has **no real-world monetary value**.
    3. Query Handling:
        - If the query is an address, prioritize the "Internal Context" (RPC Data) to report the balance first.
        - If the query is a transaction hash, use the available Google Search grounding (explorer data) for analysis.
        - If the query is general (e.g., "what is BSSC?"), use Google Search grounding (website/GitHub info) to provide the most accurate, up-to-date answer.
        - If the query is unrelated to BSSC, answer it professionally using the Gemini's general knowledge and grounding tools.
    4. Formatting: **NEVER use triple asterisks (***), bullet points, or markdown headings in your final answer.** Use clear paragraphs and bolding for emphasis.`;

    const payload = {
      contents: [
        {
          parts: [
            { text: `User Query: ${query}\n\nInternal Context: ${context}` },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      // Google Search is now always enabled for rich context and general questions
      ...(useGoogleSearchTool && { tools: [{ "google_search": {} }] })
    };

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = await aiRes.json();
    
    if (data.error) {
        console.error('Gemini API Error:', data.error);
        return res.status(500).json({ error: `Gemini API Error: ${data.error.message}` });
    }
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: No response from the AI model.';
    res.json({ answer: text });

  } catch (err) {
    console.error('Serverless route general error:', err);
    res.status(500).json({ error: 'AI request failed due to a severe server issue.' });
  }
}

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { type NextApiRequest, type NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';

interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  arxivId: string;
  title: string;
  abstract: string;
}

async function fetchPdfContent(arxivId: string): Promise<string> {
  try {
    // Construct arXiv PDF URL
    const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;

    // Fetch the PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    // Extract text from the PDF
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const data = await pdfParse(Buffer.from(pdfBuffer));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return data.text;
  } catch (error) {
    console.error('Error fetching PDF content:', error);
    throw new Error('Failed to fetch paper content from arXiv');
  }
}

function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, arxivId, title, abstract } = req.body as ChatRequestBody;

    if (!messages || !arxivId || !title || !abstract) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch the full paper content
    console.log(`Fetching PDF content for arXiv ID: ${arxivId}`);
    const paperContent = await fetchPdfContent(arxivId);

    // Estimate token count for the full prompt
    const systemPrompt = `You are an AI assistant helping users understand and analyze the research paper: "${title}".

Abstract: ${abstract}

Full Paper Content:
${paperContent}

Please answer questions about this paper based on the content provided above. Be precise, cite specific sections when relevant, and acknowledge if something is unclear or not covered in the paper.`;

    const estimatedTokens = estimateTokenCount(
      systemPrompt + messages.map((m) => m.content).join(' '),
    );

    console.log(`Estimated tokens: ${estimatedTokens}`);

    // Check if the prompt is too large (900k tokens limit)
    if (estimatedTokens >= 900000) {
      return res.status(413).json({
        error: 'Paper is too large to process',
        message:
          'This paper exceeds the maximum token limit of 900,000 tokens. Please try with a shorter paper or contact support.',
        estimatedTokens,
      });
    }

    // Stream the response using Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
    });

    // Use pipeDataStreamToResponse for Pages Router
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error('Chat API error:', error);

    if (!res.headersSent) {
      if (
        error instanceof Error &&
        error.message.includes('Failed to fetch paper content')
      ) {
        return res.status(404).json({
          error: 'Paper not found',
          message:
            'Could not fetch the paper from arXiv. Please check the arXiv ID and try again.',
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message:
          'An error occurred while processing your request. Please try again.',
      });
    }
  }
}

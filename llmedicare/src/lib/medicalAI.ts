interface Symptom {
  name: string;
  possibleConditions: string[];
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
}

interface ChatResponse {
  response: string;
}

export async function getMedicalResponse(input: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:8000/api/medical-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from medical AI');
    }

    const data: ChatResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting medical response:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again later or contact support if the issue persists.';
  }
}
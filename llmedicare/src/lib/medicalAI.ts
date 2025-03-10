interface Symptom {
  name: string;
  possibleConditions: string[];
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
}

const commonSymptoms: Record<string, Symptom> = {
  fever: {
    name: 'Fever',
    possibleConditions: [
      'Common cold',
      'Flu',
      'COVID-19',
      'Bacterial infection'
    ],
    severity: 'moderate',
    recommendations: [
      'Rest and stay hydrated',
      'Take over-the-counter fever reducers',
      'Monitor temperature',
      'Seek medical attention if fever persists over 3 days or exceeds 103°F (39.4°C)'
    ]
  },
  headache: {
    name: 'Headache',
    possibleConditions: [
      'Tension headache',
      'Migraine',
      'Dehydration',
      'Eye strain'
    ],
    severity: 'mild',
    recommendations: [
      'Rest in a quiet, dark room',
      'Stay hydrated',
      'Practice stress-relief techniques',
      'Consider over-the-counter pain relievers'
    ]
  },
  cough: {
    name: 'Cough',
    possibleConditions: [
      'Common cold',
      'Bronchitis',
      'Allergies',
      'COVID-19'
    ],
    severity: 'moderate',
    recommendations: [
      'Stay hydrated',
      'Use honey for soothing (if over 1 year old)',
      'Consider over-the-counter cough medicine',
      'Seek medical attention if cough persists over 2 weeks'
    ]
  },
  // Add more symptoms as needed
};

function findSymptoms(input: string): Symptom[] {
  const lowercaseInput = input.toLowerCase();
  return Object.values(commonSymptoms).filter(symptom =>
    lowercaseInput.includes(symptom.name.toLowerCase())
  );
}

function generateResponse(symptoms: Symptom[]): string {
  if (symptoms.length === 0) {
    return `I understand you're concerned about your health. Could you please provide more specific information about your symptoms? For example:
    - When did they start?
    - How severe are they?
    - Are they constant or do they come and go?
    - Have you noticed any triggers?
    
This will help me provide more accurate information.`;
  }

  let response = `Based on your description, here's what I can tell you:\n\n`;

  symptoms.forEach(symptom => {
    response += `Regarding your ${symptom.name.toLowerCase()}:\n`;
    response += `• Possible causes include: ${symptom.possibleConditions.join(', ')}\n`;
    response += `• Recommendations:\n${symptom.recommendations.map(r => `  - ${r}`).join('\n')}\n`;
    
    if (symptom.severity === 'severe') {
      response += `\n⚠️ Important: These symptoms may require immediate medical attention. Please consult a healthcare provider.\n`;
    }
  });

  response += `\nPlease note: This information is for general guidance only and not a substitute for professional medical advice. If symptoms persist or worsen, please consult a healthcare provider.`;

  return response;
}

export async function getMedicalResponse(input: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const foundSymptoms = findSymptoms(input);
  return generateResponse(foundSymptoms);
}
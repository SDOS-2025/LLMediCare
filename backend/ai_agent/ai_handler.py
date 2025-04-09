from sentence_transformers import SentenceTransformer
import torch
import logging
from typing import Dict, List
import asyncio
import os
import pickle

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedAIAgent:
    def __init__(self):
        logger.info("Initializing EnhancedAIAgent with sentence-transformers")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Initialize the model for semantic search
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.model.to(self.device)
        
        # Initialize conversation memory
        self.conversation_history = []
        self.max_history = 5
        self.history_file = os.path.join(os.path.dirname(__file__), "agent_history.pkl")
        
        # Load any existing history
        self._load_history()
        
        # Initialize medical knowledge base
        self._initialize_medical_knowledge()

    def _load_history(self):
        """Load conversation history from file"""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'rb') as f:
                    self.conversation_history = pickle.load(f)
                    logger.info(f"Loaded {len(self.conversation_history)} agent history items")
        except Exception as e:
            logger.error(f"Error loading agent history: {e}")
            self.conversation_history = []

    def _save_history(self):
        """Save conversation history to file"""
        try:
            with open(self.history_file, 'wb') as f:
                pickle.dump(self.conversation_history, f)
                logger.info(f"Saved {len(self.conversation_history)} agent history items")
        except Exception as e:
            logger.error(f"Error saving agent history: {e}")

    def _initialize_medical_knowledge(self):
        """Initialize the medical knowledge base with structured medical information"""
        self.medical_knowledge = [
            {
                "query": "What are common symptoms of flu and cold?",
                "response": """**Information**
- Fever and chills
- Cough and sore throat
- Body aches and fatigue
- Nasal congestion

**Recommendations**
- Rest and stay hydrated
- Take over-the-counter medications for symptoms
- Monitor temperature
- Seek medical attention if symptoms worsen significantly

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Monitor your symptoms
- Stay home to prevent spreading
- Contact your doctor if symptoms worsen
- Follow proper hygiene practices"""
            },
            {
                "query": "How can I maintain a healthy heart?",
                "response": """**Information**
- Regular exercise is essential for heart health
- A balanced diet plays a crucial role
- Blood pressure monitoring is important
- Sleep and stress management are key factors

**Recommendations**
- Exercise regularly (150 minutes/week)
- Maintain a balanced diet
- Monitor blood pressure
- Get adequate sleep
- Manage stress levels

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Schedule regular check-ups
- Create a personalized exercise plan
- Monitor your blood pressure
- Discuss heart health with your doctor"""
            },
            {
                "query": "What is a balanced diet?",
                "response": """**Information**
- A balanced diet includes all essential nutrients
- Proper portion control is important
- Regular meal timing helps maintain health
- Hydration is a key component

**Recommendations**
- Eat plenty of fruits and vegetables (5+ servings daily)
- Choose whole grains (brown rice, whole wheat)
- Include lean proteins (fish, poultry, legumes)
- Consume healthy fats (avocados, nuts, olive oil)
- Stay hydrated with water

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Plan your meals in advance
- Keep a food diary
- Consult a nutritionist if needed
- Make gradual dietary changes"""
            },
            {
                "query": "How to manage stress and anxiety?",
                "response": """**Information**
- Stress and anxiety are common experiences
- Various techniques can help manage symptoms
- Lifestyle changes play an important role
- Professional support may be needed

**Recommendations**
- Practice deep breathing exercises
- Engage in regular physical activity
- Maintain a consistent sleep schedule
- Use mindfulness meditation
- Take regular breaks during work

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Start with basic stress management techniques
- Consider professional counseling if needed
- Join support groups
- Develop a daily relaxation routine"""
            },
            {
                "query": "I broke my arm at the gym. What should I do?",
                "response": """**Information**
- Broken arms typically cause severe pain, swelling, and visible deformity
- You may experience limited movement or a grating sensation
- The injured area may appear bruised or discolored
- Fractures require professional medical treatment

**Recommendations**
- Immobilize the injured arm using a sling or splint
- Apply ice wrapped in a cloth to reduce swelling (20 minutes at a time)
- Take over-the-counter pain medication like ibuprofen to manage pain
- Seek immediate medical attention at an emergency room or urgent care

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Go to an emergency room or urgent care immediately
- Ask for an X-ray to confirm the fracture
- Follow the treatment plan from your healthcare provider
- Consider physical therapy during recovery"""
            },
            {
                "query": "injured at gym broken bone",
                "response": """**Information**
- Gym injuries involving broken bones require immediate medical attention
- Common signs include severe pain, swelling, deformity, and limited mobility
- The severity and healing time depend on the location and type of fracture
- Proper treatment is essential for proper bone healing

**Recommendations**
- Stop exercising immediately and stabilize the injured area
- Apply ice wrapped in cloth (not directly on skin) to reduce swelling
- Elevate the injured area if possible to reduce blood flow and swelling
- Take acetaminophen or ibuprofen for pain management if not contraindicated

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Seek emergency medical care for proper diagnosis and treatment
- Follow all medical instructions for immobilization (cast, splint, etc.)
- Attend all follow-up appointments to monitor healing
- Consider physical therapy as recommended by your doctor"""
            }
        ]
        
        # Create embeddings for the medical knowledge queries
        self.query_embeddings = self.model.encode(
            [item["query"] for item in self.medical_knowledge],
            convert_to_tensor=True
        ).to(self.device)

    def _get_most_relevant_response(self, query: str) -> str:
        """Get the most relevant response based on semantic similarity"""
        # Get query embedding
        query_embedding = self.model.encode(
            query,
            convert_to_tensor=True
        ).to(self.device)
        
        # Calculate similarities
        similarities = torch.nn.functional.cosine_similarity(
            query_embedding.unsqueeze(0),
            self.query_embeddings,
            dim=1
        )
        
        # Get the most relevant response
        max_similarity_idx = torch.argmax(similarities).item()
        max_similarity = similarities[max_similarity_idx].item()
        
        logger.info(f"Query: {query}")
        logger.info(f"Most similar knowledge entry: {self.medical_knowledge[max_similarity_idx]['query']}")
        logger.info(f"Similarity score: {max_similarity}")
        
        # If similarity is too low, return a more dynamic response
        if max_similarity < 0.4:
            return f"""**Information**
- Your query about "{query}" requires medical assessment
- Without proper medical evaluation, I can only provide general guidance
- Based on your description, you should consider getting professional medical help

**Recommendations**
- Document your specific symptoms and their timeline
- If experiencing severe pain, swelling, or limited mobility, seek medical attention
- For mild symptoms, rest and monitor for changes
- Take appropriate over-the-counter medication as directed on the packaging

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Schedule an appointment with your doctor
- For urgent concerns, visit an emergency room or urgent care
- Prepare questions about your specific situation
- Follow professional medical advice"""
        
        # Get the response from the medical knowledge base
        response = self.medical_knowledge[max_similarity_idx]["response"]
        
        # Ensure the response has the correct format
        if "**Information**" not in response and "**Symptoms**" not in response:
            # Add Information section if missing
            response = "**Information**\n- Based on your query, here is what you should know\n\n" + response
        
        if "**Recommendations**" not in response:
            # Add Recommendations section if missing
            response += "\n\n**Recommendations**\n- Please consult with a healthcare professional\n- Keep track of your symptoms\n- Follow proper health guidelines"
        
        if "**Medical Disclaimer**" not in response:
            # Add Medical Disclaimer section if missing
            response += "\n\n**Medical Disclaimer**\n- This information is for general guidance only\n- Not a substitute for professional medical advice\n- Consult your healthcare provider for specific advice"
        
        if "**Next Steps**" not in response:
            # Add Next Steps section if missing
            response += "\n\n**Next Steps**\n- Consider scheduling an appointment with your doctor\n- Document any specific concerns\n- Follow up with a healthcare professional as needed"
        
        return response

    async def process_query(self, query: str, context: Dict = None) -> str:
        """Process user query with context awareness"""
        logger.info(f"Processing query: {query}")
        try:
            # Get the most relevant response
            response = await asyncio.to_thread(self._get_most_relevant_response, query)
            
            # Update conversation history
            self.conversation_history.append(f"Q: {query}\nA: {response}")
            if len(self.conversation_history) > self.max_history:
                self.conversation_history.pop(0)
            
            # Save history to disk
            self._save_history()
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return """**Error**
- I apologize for the inconvenience
- Please try rephrasing your question
- If the problem persists, try again later

**Next Steps**
- Try asking your question in a different way
- Make sure your question is clear and specific
- Try again in a few moments"""

    def clear_memory(self):
        """Clear conversation memory"""
        logger.info("Clearing AI agent memory")
        self.conversation_history = []
        # Clean up the history file
        if os.path.exists(self.history_file):
            try:
                os.remove(self.history_file)
                logger.info("Removed agent history file")
            except Exception as e:
                logger.error(f"Error removing agent history file: {e}")
        return True

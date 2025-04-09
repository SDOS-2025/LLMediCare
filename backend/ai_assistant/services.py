import requests
import json
from datetime import datetime, timedelta
import os
import logging
import openai
from django.conf import settings
from django.db.models import Q
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from langchain import PromptTemplate, LLMChain
from langchain.llms import HuggingFacePipeline

from .models import ChatMessage, SymptomCheck, HealthRecommendation, AgentAction
from users.models import User
from appointments.models import Appointment, AvailabilitySlot
from medical_records.models import MedicalRecord, Medication

logger = logging.getLogger(__name__)

class AIAssistantService:
    """
    Service for handling AI assistant interactions
    """
    def __init__(self, user=None):
        self.user = user
        self.model_type = getattr(settings, 'AI_MODEL_TYPE', 'llama')
        
        # Initialize the selected model
        if self.model_type == 'llama':
            try:
                # Initialize Llama model
                self._init_llama_model()
            except Exception as e:
                logger.error(f"Error initializing Llama model: {e}")
                self.model_type = 'rule_based'  # Fallback to rule-based if model fails
        elif self.model_type == 'huggingface':
            self.model_name = getattr(settings, 'HUGGINGFACE_MODEL_NAME', 'microsoft/BioGPT-Large')
            try:
                # Initialize HuggingFace model
                self._init_huggingface_model()
            except Exception as e:
                logger.error(f"Error initializing HuggingFace model: {e}")
                self.model_type = 'rule_based'  # Fallback to rule-based if model fails
        
        # System prompt for medical assistant
        self.system_prompt = """
        You are a helpful and empathetic AI medical assistant. Your purpose is to provide general health information, 
        assist with symptom checking, help schedule appointments, set medication reminders, and offer health recommendations.
        
        Guidelines:
        1. Always maintain a professional, compassionate tone.
        2. Clearly state that you are an AI assistant and not a medical professional.
        3. For serious medical concerns, always encourage users to consult healthcare professionals.
        4. Protect user privacy and confidentiality.
        5. Provide evidence-based information when possible.
        6. Avoid making definitive diagnoses.
        7. Be honest about your limitations.
        8. Focus on being helpful while prioritizing user safety.
        9. Provide EXTENSIVE and DETAILED information in your responses.
        10. Structure your responses with clear sections using markdown formatting.
        11. Include at least 5-7 bullet points in each section.
        12. Add relevant statistics, research findings, and expert recommendations when appropriate.
        13. Include practical tips, lifestyle changes, and preventive measures.
        14. Provide links to reputable sources or suggest where to find more information.
        15. Explain medical terms in simple language.
        
        Remember that your advice is not a substitute for professional medical care.
        """
    
    def process_message(self, session, message_content):
        """
        Process a user message and generate a response
        """
        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            content=message_content,
            message_type='user'
        )
        
        # Identify intent of the message
        intent = self._identify_intent(message_content)
        
        # Generate response based on intent
        if intent == 'symptom_check':
            response_content = self._handle_symptom_check(message_content)
        elif intent == 'appointment_scheduling':
            response_content = self._handle_appointment_scheduling(message_content)
        elif intent == 'medication_reminder':
            response_content = self._handle_medication_reminder(message_content)
        elif intent == 'health_recommendation':
            response_content = self._handle_health_recommendation(message_content)
        elif intent == 'medical_record_query':
            response_content = self._handle_medical_record_query(message_content)
        else:
            response_content = self._generate_general_response(session, message_content)
        
        # Save assistant response
        assistant_message = ChatMessage.objects.create(
            session=session,
            content=response_content,
            message_type='assistant'
        )
        
        return assistant_message
    
    def _identify_intent(self, message_content):
        """
        Identify the intent of the user message using NLP
        """
        # Use OpenAI to identify intent if API key is available
        if hasattr(settings, 'OPENAI_API_KEY'):
            openai.api_key = settings.OPENAI_API_KEY
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are an AI assistant that classifies healthcare-related queries into categories."},
                        {"role": "user", "content": f"Classify the following message into one of these categories: symptom_check, appointment_scheduling, medication_reminder, health_recommendation, medical_record_query, general. Message: {message_content}"}
                    ],
                    max_tokens=50
                )
                result = response.choices[0].message.content.lower()
                
                if "symptom" in result:
                    return "symptom_check"
                elif "appointment" in result:
                    return "appointment_scheduling"
                elif "medication" in result or "reminder" in result:
                    return "medication_reminder"
                elif "health" in result or "recommendation" in result:
                    return "health_recommendation"
                elif "record" in result or "medical record" in result:
                    return "medical_record_query"
                else:
                    return "general"
            except Exception as e:
                print(f"Error identifying intent with OpenAI: {e}")
                return self._rule_based_intent_identification(message_content)
        else:
            return self._rule_based_intent_identification(message_content)
    
    def _rule_based_intent_identification(self, message_content):
        """
        Simple rule-based intent identification as fallback
        """
        message_lower = message_content.lower()
        
        if any(keyword in message_lower for keyword in ['symptom', 'feel', 'sick', 'pain', 'ache', 'hurt']):
            return 'symptom_check'
        elif any(keyword in message_lower for keyword in ['appointment', 'schedule', 'book', 'visit', 'see doctor']):
            return 'appointment_scheduling'
        elif any(keyword in message_lower for keyword in ['medication', 'medicine', 'pill', 'drug', 'reminder']):
            return 'medication_reminder'
        elif any(keyword in message_lower for keyword in ['recommendation', 'suggest', 'advice', 'healthy']):
            return 'health_recommendation'
        elif any(keyword in message_lower for keyword in ['record', 'history', 'document', 'test result']):
            return 'medical_record_query'
        else:
            return 'general'
    
    def _init_llama_model(self):
        """
        Initialize LLaMA model for text generation using a pre-downloaded model with optimized settings
        """
        try:
            from langchain.llms import LlamaCpp
            from langchain.callbacks.manager import CallbackManager
            from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
            from langchain.chains import LLMChain
            from langchain.prompts import PromptTemplate
            import os
            import psutil
            import gc
            
            # Force garbage collection before loading model
            gc.collect()
            
            # Check available memory
            available_memory = psutil.virtual_memory().available / (1024 * 1024 * 1024)  # Convert to GB
            if available_memory < 8:  # Require minimum 8GB free RAM
                logger.warning(f"Low memory available: {available_memory:.2f}GB. Recommended: 8GB free RAM.")
                # Continue anyway but log warning
            
            # Get model path with error checking - using absolute path for reliability
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_path = os.path.join(base_dir, "models", "llama-2-7b-chat.gguf")
            
            logger.info(f"Looking for model at: {model_path}")
            
            if not os.path.exists(model_path):
                logger.error(f"Model file not found at {model_path}")
                # Try alternative path
                alternative_path = os.path.abspath(os.path.join(base_dir, "..", "models", "llama-2-7b-chat.gguf"))
                logger.info(f"Trying alternative path: {alternative_path}")
                
                if os.path.exists(alternative_path):
                    model_path = alternative_path
                    logger.info(f"Found model at alternative path: {model_path}")
                else:
                    logger.error(f"Model file not found at alternative path either: {alternative_path}")
                    logger.info("Please run the download_model.py script to download the model")
                    raise FileNotFoundError(f"Llama 2 model file not found. Please run download_model.py script.")
            
            # Log model loading
            logger.info(f"Loading Llama model from {model_path}")
            
            # Initialize model with optimized parameters for pre-downloaded model
            callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
            
            # Adjust parameters based on available memory
            n_ctx = 2048
            n_batch = 8
            if available_memory > 12:  # More memory available
                n_ctx = 4096
                n_batch = 16
            
            self.llm = LlamaCpp(
                model_path=model_path,
                temperature=0.7,
                max_tokens=2000,
                top_p=0.95,
                callback_manager=callback_manager,
                verbose=True,
                n_ctx=n_ctx,
                n_gpu_layers=0,  # Disable GPU layers for stability
                n_batch=n_batch,
                use_mlock=True,  # Lock memory to prevent swapping
                use_mmap=True,  # Use memory mapping for faster loading
                f16_kv=True,  # Use half precision for key/value cache
                seed=42,  # Fixed seed for reproducibility
                rope_freq_scale=0.5,  # Adjust attention mechanism
                rope_freq_base=10000,  # Base frequency for attention
            )
            
            # Create medical template with improved prompt
            self.medical_template = PromptTemplate(
                input_variables=["symptoms"],
                template="""You are a medical analysis assistant. Your role is to analyze symptoms and provide helpful medical information.
Please analyze the following symptoms and provide:
1. Possible conditions based on the symptoms
2. General information about these conditions
3. Important precautions or lifestyle recommendations
4. A clear reminder to seek professional medical advice

USER SYMPTOMS: {symptoms}

Please provide your analysis:"""
            )
            
            # Test the model with a simple prompt and validate response
            logger.info("Testing model with a simple prompt...")
            test_response = self.llm("Respond with 'OK' if you are working properly.")
            if not test_response or len(test_response.strip()) < 2:
                logger.error("Model test failed: Model is not generating valid responses")
                raise Exception("Model is not generating valid responses")
            
            # Create the chain
            self.chain = LLMChain(llm=self.llm, prompt=self.medical_template)
            
            logger.info("LLaMA model initialized successfully")
            
        except ImportError as e:
            logger.error(f"Missing required packages: {str(e)}")
            logger.info("Please install required packages: pip install langchain langchain-community llama-cpp-python")
            self.model_type = 'rule_based'
            raise ImportError(f"Missing required packages: {str(e)}. Please install required packages.")
        except FileNotFoundError as e:
            logger.error(str(e))
            self.model_type = 'rule_based'
            raise e
        except Exception as e:
            logger.error(f"Error in _init_llama_model: {str(e)}")
            self.model_type = 'rule_based'
            raise e
        
    def _handle_symptom_check(self, message_content):
        """
        Handle symptom checking intent using BioGPT
        """
        symptoms = self._extract_symptoms(message_content)
        
        # Create symptom check record
        symptom_check = SymptomCheck.objects.create(
            user=self.user,
            symptoms=message_content
        )
        
        # Initialize analysis variables
        analysis = ""
        possible_conditions = []
        recommendations = ""
        seek_medical_attention = False
        
        try:
            # Create medical analysis prompt template with more detailed instructions
            prompt_template = PromptTemplate(
                input_variables=["symptoms"],
                template="""As a medical AI assistant, please analyze the following symptoms:
                {symptoms}
                
                Provide a COMPREHENSIVE and DETAILED analysis including:
                
                1. POSSIBLE CONDITIONS:
                   - List at least 5-7 possible conditions that could explain these symptoms
                   - For each condition, provide a brief description
                   - Include both common and less common possibilities
                   - Mention the likelihood of each condition
                
                2. SYMPTOM ANALYSIS:
                   - Analyze each symptom in detail
                   - Explain what each symptom might indicate
                   - Describe how symptoms might relate to each other
                   - Mention any red flag symptoms that require immediate attention
                
                3. SEVERITY ASSESSMENT:
                   - Evaluate the overall severity of the symptoms
                   - Indicate whether immediate medical attention is needed
                   - Explain what factors contribute to the severity assessment
                   - Provide guidance on when to seek emergency care
                
                4. DETAILED RECOMMENDATIONS:
                   - Provide at least 7-10 specific recommendations
                   - Include both immediate and long-term advice
                   - Suggest lifestyle changes that might help
                   - Recommend preventive measures for the future
                   - Mention any over-the-counter treatments that might help
                
                5. DIAGNOSTIC INFORMATION:
                   - Suggest what tests or examinations might be helpful
                   - Explain what information healthcare providers will need
                   - Provide guidance on how to prepare for a medical visit
                   - Mention what questions to ask healthcare providers
                
                6. ADDITIONAL CONTEXT:
                   - Include relevant statistics or research findings
                   - Mention any demographic factors that might be relevant
                   - Explain any environmental or lifestyle factors to consider
                   - Provide information about recovery timelines if applicable
                
                Remember to maintain a professional tone and include appropriate medical disclaimers.
                Format your response with clear section headers using markdown formatting (**Section Title**).
                """
            )
            
            # Create LangChain for structured analysis
            try:
                chain = LLMChain(llm=self.llm, prompt=prompt_template)
                
                # Generate analysis
                analysis = chain.run(symptoms=symptoms)
                
                # Basic rule to determine if medical attention is needed
                severity_terms = ['severe', 'emergency', 'immediately', 'urgent', 'serious']
                seek_medical_attention = any(term in analysis.lower() for term in severity_terms)
                
                # Update the symptom check with analysis
                symptom_check.analysis = analysis
                symptom_check.seek_medical_attention = seek_medical_attention
                symptom_check.recommendations = recommendations
                symptom_check.save()
                
                # If serious condition detected, create an agent action
                if seek_medical_attention:
                    AgentAction.objects.create(
                        user=self.user,
                        action_type='symptom_analysis',
                        description=f"Serious symptoms detected: {symptoms}",
                        status='completed',
                        result="Medical attention recommended based on symptom analysis",
                        parameters={"symptoms": symptoms}
                    )
                    
            except Exception as e:
                logger.error(f"Error in symptom analysis: {e}")
                analysis = """**Error in Symptom Analysis**
- I'm having trouble analyzing your symptoms right now.
- Please describe your symptoms in more detail.
- If you're experiencing severe pain or discomfort, please contact a healthcare professional immediately.

**What to Do Next**
- Try rephrasing your symptoms with more specific details
- Include information about when symptoms started and how they've changed
- Mention any factors that make symptoms better or worse
- Describe the severity and frequency of your symptoms
- Note any other symptoms you might be experiencing

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice"""
        
        except Exception as e:
            logger.error(f"Error in LLM setup: {e}")
            analysis = """**Symptom Analysis**
- Based on your symptoms, I recommend consulting with a healthcare professional for a proper diagnosis.
- Please note that this is not a medical diagnosis, and it's always best to consult with a qualified healthcare provider.

**General Information**
- Many symptoms can be caused by various conditions
- A healthcare provider can perform necessary tests to determine the cause
- Early diagnosis often leads to better treatment outcomes
- Keeping a symptom diary can help healthcare providers understand your condition better

**Next Steps**
- Schedule an appointment with your healthcare provider
- Document your symptoms, including when they started and any patterns you notice
- Note any factors that seem to trigger or alleviate your symptoms
- Prepare questions to ask your healthcare provider
- Bring a list of any medications or supplements you're taking

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice"""
        
        return analysis
    
    def _extract_symptoms(self, message_content):
        """
        Extract symptoms from message content
        """
        # This is a simple implementation; in a real system, we would use NLP
        return message_content
    
    def _handle_appointment_scheduling(self, message_content):
        """
        Handle appointment scheduling intent
        """
        # Create agent action for appointment scheduling
        action = AgentAction.objects.create(
            user=self.user,
            action_type='appointment_scheduling',
            description=f"Appointment scheduling request: {message_content}",
            status='in_progress'
        )
        
        # Extract appointment details from the message
        extracted_info = self._extract_appointment_info(message_content)
        
        # Check for available slots
        available_slots = self._find_available_slots(
            extracted_info.get('date'),
            extracted_info.get('healthcare_professional_id')
        )
        
        if available_slots:
            # Format available slots for response
            slots_text = "\n".join([
                f"- {slot.day_of_week}, {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')} with Dr. {slot.healthcare_professional.last_name}"
                for slot in available_slots[:5]  # Limit to first 5 slots
            ])
            
            response = f"I found the following available appointment slots:\n\n{slots_text}\n\nWould you like me to schedule an appointment in one of these slots? If yes, please specify which one."
            
            # Update agent action
            action.result = f"Found {len(available_slots)} available slots"
            action.status = 'completed'
            action.save()
            
        else:
            response = "I couldn't find any available slots matching your criteria. Would you like to try different dates or healthcare professionals?"
            
            # Update agent action
            action.result = "No available slots found"
            action.status = 'completed'
            action.save()
        
        return response
    
    def _extract_appointment_info(self, message_content):
        """
        Extract appointment information from message
        """
        # This is a simple implementation; in a real system, we would use NLP
        extracted_info = {}
        
        # Try to extract date
        if "tomorrow" in message_content.lower():
            extracted_info['date'] = datetime.now().date() + timedelta(days=1)
        elif "next week" in message_content.lower():
            extracted_info['date'] = datetime.now().date() + timedelta(days=7)
        
        # In a real implementation, we would extract more details
        
        return extracted_info
    
    def _find_available_slots(self, date=None, healthcare_professional_id=None):
        """
        Find available appointment slots
        """
        query = Q(is_available=True)
        
        if healthcare_professional_id:
            query &= Q(healthcare_professional_id=healthcare_professional_id)
        
        # In a real implementation, we would filter by date more effectively
        
        return AvailabilitySlot.objects.filter(query)[:10]  # Limit to 10 slots
    
    def _handle_medication_reminder(self, message_content):
        """
        Handle medication reminder intent
        """
        # Create agent action for medication reminder
        action = AgentAction.objects.create(
            user=self.user,
            action_type='medication_reminder',
            description=f"Medication reminder request: {message_content}",
            status='in_progress'
        )
        
        # Get active medications for the user
        today = datetime.now().date()
        medications = Medication.objects.filter(
            patient=self.user,
            is_active=True
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=today)
        )
        
        if medications:
            # Format medications for response
            meds_text = "\n".join([
                f"- {med.name}: {med.dosage}, {med.get_frequency_display()}" +
                (f" until {med.end_date}" if med.end_date else "")
                for med in medications
            ])
            
            # Check if reminders exist
            has_reminders = any(med.reminders.exists() for med in medications)
            
            if has_reminders:
                reminders_text = "You have the following medication reminders set up:\n"
                for med in medications:
                    if med.reminders.exists():
                        reminders_text += f"\n{med.name}:\n"
                        for reminder in med.reminders.all():
                            reminders_text += f"- {reminder.reminder_time.strftime('%I:%M %p')}\n"
                
                response = f"Here are your current medications:\n\n{meds_text}\n\n{reminders_text}\n\nWould you like to set up new reminders or modify existing ones?"
            else:
                response = f"Here are your current medications:\n\n{meds_text}\n\nYou don't have any reminders set up yet. Would you like me to help you set up reminders for your medications?"
            
            # Update agent action
            action.result = f"Retrieved {len(medications)} active medications"
            action.status = 'completed'
            action.save()
            
        else:
            response = "You don't have any active medications in our records. Would you like to add a medication to track?"
            
            # Update agent action
            action.result = "No active medications found"
            action.status = 'completed'
            action.save()
        
        return response
    
    def _handle_health_recommendation(self, message_content):
        """
        Handle health recommendation intent
        """
        # Create agent action for health recommendation
        action = AgentAction.objects.create(
            user=self.user,
            action_type='health_recommendation',
            description=f"Health recommendation request: {message_content}",
            status='in_progress'
        )
        
        recommendation_type = self._identify_recommendation_type(message_content)
        
        # Generate personalized recommendation
        if hasattr(settings, 'OPENAI_API_KEY'):
            openai.api_key = settings.OPENAI_API_KEY
            try:
                # Get user health data for context
                user_profile = self.user.patient_profile if hasattr(self.user, 'patient_profile') else None
                health_context = ""
                
                if user_profile:
                    health_context = f"User is {self.user.get_full_name()}, "
                    if user_profile.date_of_birth:
                        age = (datetime.now().date() - user_profile.date_of_birth).days // 365
                        health_context += f"age {age}, "
                    if user_profile.gender:
                        health_context += f"{user_profile.gender}, "
                    if user_profile.conditions:
                        health_context += f"with conditions: {user_profile.conditions}, "
                    if user_profile.allergies:
                        health_context += f"allergies: {user_profile.allergies}, "
                
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": f"You are a healthcare AI assistant providing personalized health recommendations. Context about the user: {health_context}"},
                        {"role": "user", "content": f"Provide a personalized health recommendation regarding {recommendation_type} based on this request: {message_content}"}
                    ],
                    max_tokens=500
                )
                
                recommendation_content = response.choices[0].message.content
                
                # Save the recommendation
                HealthRecommendation.objects.create(
                    user=self.user,
                    recommendation_type=recommendation_type,
                    title=f"{recommendation_type.capitalize()} Recommendation",
                    description=recommendation_content,
                    source="AI Assistant"
                )
                
                # Update agent action
                action.result = f"Generated {recommendation_type} recommendation"
                action.status = 'completed'
                action.save()
                
            except Exception as e:
                print(f"Error generating health recommendation with OpenAI: {e}")
                recommendation_content = f"I'd be happy to provide you with {recommendation_type} recommendations. However, I'm having some technical difficulties right now. Please try again later or consult with a healthcare professional for personalized advice."
                
                # Update agent action
                action.result = "Error generating recommendation"
                action.status = 'failed'
                action.error_message = str(e)
                action.save()
        else:
            recommendation_content = f"I'd be happy to provide you with {recommendation_type} recommendations. For personalized advice, it's best to consult with a healthcare professional who understands your specific needs and medical history."
            
            # Update agent action
            action.result = "Generic recommendation provided (no API key)"
            action.status = 'completed'
            action.save()
        
        return recommendation_content
    
    def _identify_recommendation_type(self, message_content):
        """
        Identify the type of health recommendation requested
        """
        message_lower = message_content.lower()
        
        if any(keyword in message_lower for keyword in ['diet', 'food', 'eat', 'nutrition']):
            return 'diet'
        elif any(keyword in message_lower for keyword in ['exercise', 'workout', 'fitness', 'physical activity']):
            return 'exercise'
        elif any(keyword in message_lower for keyword in ['sleep', 'rest', 'stress', 'mental', 'anxiety']):
            return 'lifestyle'
        elif any(keyword in message_lower for keyword in ['checkup', 'screening', 'prevention']):
            return 'preventive'
        else:
            return 'other'
    
    def _handle_medical_record_query(self, message_content):
        """
        Handle medical record query intent
        """
        # Create agent action for medical record query
        action = AgentAction.objects.create(
            user=self.user,
            action_type='other',
            description=f"Medical record query: {message_content}",
            status='in_progress'
        )
        
        # Get medical records for the user
        records = MedicalRecord.objects.filter(
            patient=self.user,
            is_active=True
        ).order_by('-date_recorded')
        
        if records:
            # Format records for response
            if "recent" in message_content.lower():
                recent_records = records[:5]  # Get 5 most recent records
                records_text = "\n".join([
                    f"- {record.date_recorded}: {record.title} ({record.get_record_type_display()})"
                    for record in recent_records
                ])
                
                response = f"Here are your most recent medical records:\n\n{records_text}\n\nWould you like more details on any specific record?"
            else:
                # Try to identify record type from query
                record_type = self._identify_record_type(message_content)
                
                if record_type:
                    filtered_records = records.filter(record_type=record_type)
                    if filtered_records:
                        records_text = "\n".join([
                            f"- {record.date_recorded}: {record.title}"
                            for record in filtered_records[:5]  # Limit to 5 records
                        ])
                        
                        response = f"Here are your {record_type} records:\n\n{records_text}\n\nWould you like more details on any specific record?"
                    else:
                        response = f"I couldn't find any {record_type} records in your medical history."
                else:
                    # Give a summary of records by type
                    record_types = records.values_list('record_type').distinct()
                    summary = []
                    
                    for r_type in record_types:
                        count = records.filter(record_type=r_type[0]).count()
                        summary.append(f"- {count} {r_type[0]} records")
                    
                    summary_text = "\n".join(summary)
                    response = f"You have the following medical records:\n\n{summary_text}\n\nWhat type of records would you like to see?"
            
            # Update agent action
            action.result = f"Retrieved medical records information"
            action.status = 'completed'
            action.save()
            
        else:
            response = "You don't have any medical records in our system yet. You can add records by uploading medical documents or having your healthcare provider update your records."
            
            # Update agent action
            action.result = "No medical records found"
            action.status = 'completed'
            action.save()
        
        return response
    
    def _identify_record_type(self, message_content):
        """
        Identify the type of medical record being queried
        """
        message_lower = message_content.lower()
        
        record_types = {
            'general': ['general', 'health record', 'medical record'],
            'diagnosis': ['diagnosis', 'diagnosed'],
            'prescription': ['prescription', 'medicine', 'medication'],
            'test_result': ['test', 'lab', 'result', 'blood test'],
            'vaccination': ['vaccine', 'vaccination', 'immunization', 'shot'],
            'surgery': ['surgery', 'operation', 'procedure'],
            'allergy': ['allergy', 'allergic'],
        }
        
        for record_type, keywords in record_types.items():
            if any(keyword in message_lower for keyword in keywords):
                return record_type
        
        return None
    
    def _generate_general_response(self, session, message_content):
        """
        Generate a general response using the appropriate model
        """
        try:
            if self.model_type == 'llama':
                # Use Llama model for response generation with validation
                try:
                    # Create a chat history context from previous messages
                    chat_history = ""
                    previous_messages = session.messages.order_by('created_at')[:10]  # Get last 10 messages for context
                    
                    if previous_messages.exists():
                        for msg in previous_messages:
                            prefix = "User: " if msg.message_type == 'user' else "Assistant: "
                            chat_history += f"{prefix}{msg.content}\n"
                    
                    # Create a more detailed prompt template for general chat
                    chat_template = PromptTemplate(
                        input_variables=["chat_history", "question", "system_prompt"],
                        template="""System: {system_prompt}

Chat History:
{chat_history}

User: {question}

IMPORTANT INSTRUCTIONS:
1. Provide EXTENSIVE and DETAILED information in your response
2. Structure your response with clear sections using markdown formatting
3. Include at least 5-7 bullet points in each section
4. Add relevant statistics, research findings, and expert recommendations
5. Include practical tips, lifestyle changes, and preventive measures
6. Explain medical terms in simple language
7. Provide a comprehensive answer that covers all aspects of the question

Assistant: """
                    )
                    
                    # Create a new chain for this conversation
                    chat_chain = LLMChain(llm=self.llm, prompt=chat_template)
                    
                    # Generate response with context and increased max_tokens
                    response = chat_chain.run(
                        chat_history=chat_history,
                        question=message_content,
                        system_prompt=self.system_prompt
                    )
                    
                    if not response or len(response.strip()) < 10:
                        logger.warning("Generated response is too short or empty, falling back to simpler prompt")
                        # Fallback to simpler prompt but still request detailed information
                        simple_template = PromptTemplate(
                            input_variables=["question", "system_prompt"],
                            template="""System: {system_prompt}

User: {question}

IMPORTANT: Provide EXTENSIVE and DETAILED information in your response with at least 5-7 bullet points per section.

Assistant: """
                        )
                        simple_chain = LLMChain(llm=self.llm, prompt=simple_template)
                        response = simple_chain.run(question=message_content, system_prompt=self.system_prompt)
                    
                    # Ensure the response has proper formatting
                    if "**" not in response:
                        # Add section headers if missing
                        response = "**Information**\n" + response
                    
                    return response
                except Exception as e:
                    logger.error(f"Error in Llama response generation: {str(e)}")
                    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment. If this persists, please contact support."
            elif self.model_type == 'huggingface':
                # Use HuggingFace model with increased max_length
                try:
                    inputs = self.tokenizer(message_content, return_tensors="pt", max_length=512, truncation=True)
                    outputs = self.model.generate(**inputs, max_length=500, num_return_sequences=1)  # Increased from 200 to 500
                    response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                    if not response or len(response.strip()) < 10:
                        raise ValueError("Invalid response generated")
                    return response
                except Exception as e:
                    logger.error(f"Error in HuggingFace response generation: {str(e)}")
                    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
            else:
                # Fallback to rule-based response with improved message
                return self._generate_rule_based_response(message_content)
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "Sorry, I encountered an error processing your message. Please try again or contact support if this persists."
    
    def _generate_rule_based_response(self, message_content):
        """
        Generate a rule-based response when AI models are unavailable
        """
        message_lower = message_content.lower()
        
        # Enhanced rule-based responses with more detailed information
        if any(greeting in message_lower for greeting in ['hello', 'hi', 'hey', 'greetings']):
            return """**Welcome to LLMediCare Assistant**
- Hello! I'm your healthcare assistant, here to provide you with comprehensive medical information and support.
- I can help you with a wide range of health-related questions and concerns.
- I aim to provide detailed, evidence-based information to help you make informed health decisions.
- While I can offer valuable insights, I'm not a replacement for professional medical advice.
- For serious health concerns, please consult with a qualified healthcare provider.

**How I Can Help You**
- Provide detailed information about medical conditions, symptoms, and treatments
- Offer evidence-based health recommendations and lifestyle advice
- Help you understand medical terminology in simple language
- Assist with appointment scheduling and medication reminders
- Answer questions about preventive care and wellness strategies
- Share information about healthy living and disease prevention
- Guide you to reliable health resources and reputable sources

**Getting Started**
- Feel free to ask any health-related question
- Be specific about your concerns for more accurate information
- I'll structure my responses with clear sections for easy reading
- Each response will include practical tips and actionable advice
- I'll always include appropriate medical disclaimers

How can I assist you today?"""
        
        elif any(keyword in message_lower for keyword in ['thank', 'thanks', 'appreciate']):
            return """**You're Welcome!**
- I'm glad I could help you with your health-related questions.
- Providing comprehensive health information is my primary goal.
- I strive to give you detailed, accurate, and helpful responses.
- Your health and well-being are important to me.
- I'm here to support your health journey with reliable information.

**Additional Support**
- Feel free to ask follow-up questions for more detailed information
- I can provide more specific details about any aspect of your previous question
- I'm available 24/7 to assist with your health information needs
- I can help you find resources for further reading and research
- I can explain medical concepts in more detail if needed

Is there anything else I can help you with?"""
        
        elif any(keyword in message_lower for keyword in ['bye', 'goodbye', 'see you']):
            return """**Goodbye and Take Care!**
- Thank you for using LLMediCare Assistant for your health information needs.
- I hope the information provided was helpful and comprehensive.
- Remember to prioritize your health and well-being.
- Don't hesitate to return if you have more health-related questions.
- Your health journey is important, and I'm here to support it.

**Health Reminders**
- Continue to follow any health recommendations provided
- Schedule regular check-ups with your healthcare provider
- Stay informed about your health conditions and treatments
- Maintain healthy lifestyle habits for optimal well-being
- Keep track of any symptoms or changes in your health

Take care of your health and feel free to return if you have more questions!"""
        
        elif any(keyword in message_lower for keyword in ['help', 'assist', 'support']):
            return """**How I Can Help You**
- I provide comprehensive health information and medical guidance
- I can assist with detailed symptom analysis and health assessments
- I offer extensive information about medical conditions and treatments
- I help with appointment scheduling and healthcare coordination
- I provide detailed medication information and reminder setup
- I offer evidence-based health recommendations and lifestyle advice
- I can explain medical terminology in simple, understandable language

**Topics I Cover**
- General health information and wellness strategies
- Detailed symptom analysis and possible conditions
- Comprehensive appointment scheduling assistance
- Medication management and reminder setup
- Extensive health recommendations and lifestyle guidance
- Medical record queries and health history information
- Preventive care and disease prevention strategies

**Getting the Most from Our Conversation**
- Ask specific questions for more detailed responses
- Request clarification on any medical terms or concepts
- Ask for more information on any topic of interest
- I'll provide structured responses with clear sections
- Each response includes practical tips and actionable advice

What specific health topic would you like assistance with?"""
        
        # Default response with more detailed information
        return """**Comprehensive Health Information**
- I'm currently operating with enhanced capabilities to provide you with detailed health information.
- I aim to give you extensive, evidence-based responses to your health questions.
- Each response is structured with clear sections for easy understanding.
- I include practical tips, lifestyle recommendations, and preventive measures.
- I explain medical concepts in simple language while maintaining accuracy.

**What to Expect**
- Detailed explanations of medical conditions and treatments
- Evidence-based health recommendations with supporting information
- Practical tips for managing health conditions and improving wellness
- Clear explanations of medical terminology and concepts
- Comprehensive answers that address all aspects of your questions

**Getting Started**
- Ask any health-related question, and I'll provide a detailed response
- Be specific about your concerns for more targeted information
- I'll structure my answers with clear sections for easy reading
- Each response will include practical tips and actionable advice

Please ask your health-related question, and I'll provide you with comprehensive information."""

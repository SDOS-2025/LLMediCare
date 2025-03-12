import requests
import json
from datetime import datetime, timedelta
import os
# import openai
from django.conf import settings
from django.db.models import Q

from .models import ChatMessage, SymptomCheck, HealthRecommendation, AgentAction
from users.models import User
from appointments.models import Appointment, AvailabilitySlot
from medical_records.models import MedicalRecord, Medication

# Configure OpenAI API
if hasattr(settings, 'OPENAI_API_KEY'):
    openai.api_key = settings.OPENAI_API_KEY

class AIAssistantService:
    """
    Service for handling AI assistant interactions
    """
    def __init__(self, user=None):
        self.user = user
    
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
    
    def _handle_symptom_check(self, message_content):
        """
        Handle symptom checking intent
        """
        symptoms = self._extract_symptoms(message_content)
        
        # Create symptom check record
        symptom_check = SymptomCheck.objects.create(
            user=self.user,
            symptoms=message_content
        )
        
        # Use OpenAI for symptom analysis if available
        analysis = ""
        possible_conditions = []
        recommendations = ""
        seek_medical_attention = False
        
        if hasattr(settings, 'OPENAI_API_KEY'):
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a healthcare AI assistant providing preliminary symptom analysis. Always include disclaimers about seeking professional medical help."},
                        {"role": "user", "content": f"Analyze these symptoms and provide possible causes, severity, and recommendations: {symptoms}"}
                    ],
                    max_tokens=500
                )
                
                analysis = response.choices[0].message.content
                
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
                print(f"Error analyzing symptoms with OpenAI: {e}")
                analysis = "I'm having trouble analyzing your symptoms right now. Please describe your symptoms in detail, and if you're experiencing severe pain or discomfort, please contact a healthcare professional immediately."
        else:
            analysis = "Based on your symptoms, I recommend consulting with a healthcare professional for a proper diagnosis. Please note that this is not a medical diagnosis, and it's always best to consult with a qualified healthcare provider."
        
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
        Generate a general response for the user message
        """
        # Use OpenAI to generate response if available
        if hasattr(settings, 'OPENAI_API_KEY'):
            try:
                # Get conversation history for context (limit to last 10 messages)
                conversation_history = list(session.messages.order_by('created_at')[:10])
                messages = [
                    {"role": "system", "content": "You are an AI healthcare assistant named LLMediCare Assistant. You provide helpful, accurate, and ethical health information. Always clarify that you're not a replacement for professional medical advice. Be empathetic, clear, and concise in your responses."}
                ]
                
                for msg in conversation_history:
                    role = "user" if msg.message_type == "user" else "assistant"
                    messages.append({"role": role, "content": msg.content})
                
                # Add the current message
                messages.append({"role": "user", "content": message_content})
                
                # Generate response
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=500
                )
                
                return response.choices[0].message.content
                
            except Exception as e:
                print(f"Error generating response with OpenAI: {e}")
                return "I'm having some trouble processing your request right now. Could you please try again or rephrase your question?"
        else:
            # Fallback response
            return "I understand you have a question. For personalized health advice, please consult with a healthcare professional. Is there something specific about our services that I can help you with?"

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from transformers import AutoModelForCausalLM, AutoTokenizer
import os
import torch
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class ChatView(APIView):
    def __init__(self):
        model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'mellama')
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(model_path)

    def post(self, request):
        try:
            input_text = request.data.get('message')
            logger.info(f'Received input: {input_text}')
            if not input_text:
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

            inputs = self.tokenizer(input_text, return_tensors='pt')
            outputs = self.model.generate(
                inputs['input_ids'],
                max_length=512,
                temperature=0.7,
                top_p=0.9
            )
            response_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            logger.info(f'Generated response: {response_text}')

            return Response({'response': response_text}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f'Error generating response: {str(e)}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

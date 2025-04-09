from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from llama_cpp import Llama
import os
import logging

logger = logging.getLogger(__name__)

class ChatView(APIView):
    def __init__(self):
        # Define model path
        model_path = os.path.abspath(os.path.join(
            os.path.dirname(__file__), '..', '..', 'models', 'llama-2-7b-chat.gguf'
        ))

        # Check if model exists
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"GGUF model not found: {model_path}")

        # Load Llama model
        self.llm = Llama(
            model_path=model_path,
            n_ctx=4096,  # Context window size
            n_threads=8,  # Adjust based on CPU cores
            verbose=False  # Set to True for debugging
        )

    def post(self, request):
        try:
            input_text = request.data.get('message')
            print(f'Received input: {input_text}')

            if not input_text:
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Generate response from Llama
            output = self.llm(
                input_text,
                max_tokens=1024,  # Adjust as needed
                temperature=0.7,
                top_p=0.9
            )

            print(output)

            response_text = output["choices"][0]["text"]
            print(f'Generated response: {response_text}')

            return Response({'response': response_text}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f'Error generating response: {str(e)}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
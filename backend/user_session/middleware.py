class CorsHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add CORS headers
        netlify_origin = 'https://splendorous-melba-fc5384.netlify.app'
        local_origin = 'http://localhost:3000'
        
        # Get the Origin header from the request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Set the proper CORS headers based on the origin
        if origin in [netlify_origin, local_origin]:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            
            # Only set Allow-Credentials if we're setting a specific origin (not wildcard)
            response['Access-Control-Allow-Credentials'] = 'true'
            
        return response 
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """Keep API errors predictable without hiding validation details."""
    response = exception_handler(exc, context)
    if response is None:
        return response

    if isinstance(response.data, dict) and 'detail' in response.data:
        response.data = {'detail': response.data['detail'], 'status_code': response.status_code}
    else:
        response.data = {'detail': 'Validation failed.', 'errors': response.data, 'status_code': response.status_code}
    return response

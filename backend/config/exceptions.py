import logging

from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import exceptions as drf_exceptions
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handler to always return a consistent
    error envelope:

        {"error": {"detail": <message or dict>, "status_code": <int>}}

    Unhandled (non-APIException) errors are converted to a 500 response
    instead of propagating a raw traceback.
    """
    if isinstance(exc, Http404):
        exc = drf_exceptions.NotFound()
    elif isinstance(exc, PermissionDenied):
        exc = drf_exceptions.PermissionDenied()

    response = drf_exception_handler(exc, context)

    if response is None:
        logger.exception('Unhandled exception in %s', context.get('view'))
        return Response(
            {'error': {'detail': 'Internal server error.', 'status_code': 500}},
            status=500,
        )

    response.data = {
        'error': {
            'detail': response.data,
            'status_code': response.status_code,
        }
    }
    return response

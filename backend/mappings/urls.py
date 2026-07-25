from django.urls import path

from .views import MappingDetailView, MappingListCreateView

app_name = 'mappings'

urlpatterns = [
    path('', MappingListCreateView.as_view(), name='mapping-list-create'),
    # Per spec this same path segment serves two purposes depending on
    # method: GET treats <id> as a patient id, DELETE treats it as a
    # mapping id. See MappingDetailView docstring.
    path('<int:id>/', MappingDetailView.as_view(), name='mapping-detail'),
]

from django.test import TestCase

# Create your tests here.
def test_service_list(client):
    response = client.get('/api/services/')
    assert response.status_code == 200
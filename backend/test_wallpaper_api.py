#!/usr/bin/env python3
import requests
import json

def test_wallpaper_generation():
    """Test the wallpaper generation API endpoint"""

    # API endpoint
    url = "http://localhost:8001/api/wallpaper/generate"

    # Test data
    test_data = {
        "prompt": "Beautiful sunset over mountains with purple sky",
        "aspect_ratio": "9:16",
        "style": "nature"
    }

    print("Testing wallpaper generation API...")
    print(f"Endpoint: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")

    try:
        # Make request
        response = requests.post(url, json=test_data, timeout=30)
        print(f"\nResponse Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("Response Data:")
            print(json.dumps(result, indent=2))

            if result.get("success"):
                print("\n✅ Success! Wallpaper generated successfully.")
                if result.get("image_url"):
                    print(f"Image URL: {result['image_url']}")
                else:
                    print("⚠️ Warning: No image URL in response")
            else:
                print(f"\n❌ API returned success=false: {result.get('error', 'Unknown error')}")
        else:
            print(f"\n❌ HTTP Error {response.status_code}")
            try:
                error_data = response.json()
                print("Error details:")
                print(json.dumps(error_data, indent=2))
            except:
                print(f"Raw response: {response.text}")

    except requests.exceptions.ConnectionError:
        print(f"\n❌ Connection Error: Cannot connect to {url}")
        print("Make sure the backend server is running on port 8001")
    except requests.exceptions.Timeout:
        print(f"\n❌ Timeout: Request took longer than 30 seconds")
    except Exception as e:
        print(f"\n❌ Error: {e}")

def test_basic_api():
    """Test the basic API endpoint"""

    url = "http://localhost:8001/api/"
    print("Testing basic API endpoint...")
    print(f"Endpoint: {url}")

    try:
        response = requests.get(url, timeout=10)
        print(f"\nResponse Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("Response Data:")
            print(json.dumps(result, indent=2))
            print("✅ Basic API is working!")
        else:
            print(f"❌ HTTP Error {response.status_code}")

    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Cannot connect to {url}")
        print("Backend server is not running or not accessible")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("API Testing Script")
    print("=" * 50)

    # Test basic API first
    test_basic_api()

    print("\n" + "=" * 50)

    # Test wallpaper generation
    test_wallpaper_generation()

    print("\n" + "=" * 50)
    print("Testing completed!")
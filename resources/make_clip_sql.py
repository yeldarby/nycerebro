import json
import requests
import time
from typing import List
import os
from inference_sdk import InferenceHTTPClient


def load_camera_ids(json_file: str) -> List[str]:
    """Extract camera IDs from the JSON file."""
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)

        # Validate and extract IDs
        if not isinstance(data, list):
            raise ValueError("JSON data must be a list of camera objects.")
        return [camera['id'] for camera in data if 'id' in camera]

    except (json.JSONDecodeError, FileNotFoundError, ValueError) as e:
        print(f"Error loading camera IDs: {str(e)}")
        return []


def process_camera(camera_id: str):
    """
    Fetch the image from the given camera ID and process it using InferenceHTTPClient.
    """
    base_url = "https://webcams.nyctmc.org/api/cameras/{}/image"
    url = base_url.format(camera_id)

    try:
        # Fetch the image
        response = requests.get(url)
        if response.status_code == 200:
            # Save image to a temporary file
            image_path = f"{camera_id}_image.jpg"
            with open(image_path, 'wb') as f:
                f.write(response.content)

            # Initialize InferenceHTTPClient
            client = InferenceHTTPClient(
                api_url=os.getenv("INFERENCE_API_URL", "http://localhost:9001"),
                api_key=os.getenv("ROBOFLOW_API_KEY")
            )

            # Run the workflow
            result = client.run_workflow(
                workspace_name="shortest-hackathon",
                workflow_id="indexwebcam",
                images={
                    "image": image_path
                },
                parameters={
                    "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
                    "SUPABASE_URL": os.getenv("SUPABASE_URL"),
                    "camera_id": camera_id
                }
            )[0]["result"]

            print(f"Processed camera {camera_id}, the result is: {result}")
            # Remove the temporary image file after processing
            os.remove(image_path)

        else:
            print(f"Failed to fetch image from camera {camera_id}: Status {response.status_code}")
    except Exception as e:
        print(f"Error processing camera {camera_id}: {str(e)}")


def fetch_camera_images(camera_ids: List[str], interval: float = 2.0):
    """
    Fetch images from cameras in a loop, processing one camera every interval seconds.
    
    Args:
        camera_ids: List of camera IDs
        interval: Time in seconds to wait between processing each camera
    """
    if not camera_ids:
        print("No camera IDs available to process. Exiting.")
        return
    
    most_recent_index = 0
    camera_count = len(camera_ids)

    while True:
        # Get the next camera ID to process
        camera_id = camera_ids[most_recent_index]
        print(f"Processing camera {camera_id}...")

        # Process the camera
        process_camera(camera_id)

        # Update the most recent index
        most_recent_index = (most_recent_index + 1) % camera_count

        # Wait for the specified interval before processing the next camera
        time.sleep(interval)


def main():
    # Assuming the JSON file is named 'cameras.json'
    camera_ids = load_camera_ids('cameras.json')
    print(f"Loaded {len(camera_ids)} camera IDs")

    # Start the loop to fetch and process camera images
    fetch_camera_images(camera_ids)


if __name__ == "__main__":
    main()
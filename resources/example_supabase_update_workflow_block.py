# THIS IS THE CONTENT OF THE ROBOFLOW WORKFLOW "Supabase Update" CUSTOM PYTHON BLOCK
# This code is here to be used as a reference for the Roboflow Workflow
# It is not used in the server code
import requests
import datetime
     
def run(self, clip_embedding, camera_id, SUPABASE_URL, SUPABASE_KEY) -> dict:
    # Current UTC time (assuming 'last_updated' column is TIMESTAMP or TIMESTAMPTZ)
    last_updated = datetime.datetime.utcnow().isoformat()

    # Data to be inserted or updated
    data_payload = {
        "camera_id": camera_id,
        "embedding": clip_embedding,
        "last_updated": last_updated
    }

    endpoint = f"{SUPABASE_URL}/rest/v1/cameras?on_conflict=camera_id"

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }

    # PostgREST expects an array of rows for insert/upsert calls
    response = requests.post(endpoint, headers=headers, json=[data_payload])
    status = "Successfully updated the database!"
    if response.status_code >= 300:
        print()
        status = "Error upserting data:" + str(response.status_code) + str(response.text)

    return {"status" : status}

import os
import shutil

# Map image filenames (from generation) to gesture IDs (folder names)
# NOTE: Using full paths for source images as returned by the tool
image_map = {
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_walking_legs_color_1771231546942.png": "walking-the-legs",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_iguana_tail_color_1771231561930.png": "iguana-tail",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_angel_wings_color_1771231575132.png": "angel-wings",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_cranial_hold_color_1771231588622.png": "cranial-sacral-hold",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_hip_circles_color_1771231602641.png": "hip-circles",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_blood_stop_color_1771231616029.png": "blood-stop",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_harmonic_rocking_final_1771231505391.png": "harmonic-rocking",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_dragon_tail_final_1771231518636.png": "dragon-tail",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_compress_back_color_1771231660884.png": "compress-the-back",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_stack_hips_color_1771231758140.png": "stack-the-hips",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_shoulder_circles_color_1771231771464.png": "shoulder-circles-side",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_belly_feet_color_1771231786919.png": "belly-to-feet",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_double_hammock_color_1771231801814.png": "double-leg-hammock",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_rock_hips_color_1771231815097.png": "rock-the-hips",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_diagonal_pull_color_1771231828968.png": "diagonal-fascial-pull",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_lung_lines_color_1771231676664.png": "walk-the-lung-lines",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_hand_chest_color_1771231718469.png": "hand-on-the-chest",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_turtle_shell_color_1771231691345.png": "turtle-shell",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_eyebrow_points_color_1771231705487.png": "eyebrow-bladder-points",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_rainbows_color_1771231864186.png": "rainbows",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_cheek_points_color_1771231882587.png": "cheek-points",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_hands_ears_color_1771231900919.png": "hands-over-the-ears",
    "/Users/flo/.gemini/antigravity/brain/017068d9-b095-4c02-94b7-6a2802600472/zen_thai_final_touch_color_1771231914309.png": "final-touch"
}

base_dir = "/Users/flo/work/code/co-flow/src/content/gestures"

for src_path, gesture_id in image_map.items():
    dest_dir = os.path.join(base_dir, gesture_id)
    if os.path.isdir(dest_dir):
        dest_path = os.path.join(dest_dir, "poster.png")
        print(f"Copying to {dest_path}")
        try:
            shutil.copy(src_path, dest_path)
        except FileNotFoundError:
             print(f"Error: Source file not found: {src_path}")
    else:
        print(f"Warning: Directory not found: {dest_dir}")

print("Done updating posters.")

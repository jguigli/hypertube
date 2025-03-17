import ffmpeg
import os

HLS_MOVIES_FOLDER = "hls_movies"


async def convert_to_hls(input_file, movie_id, quality: str):

    hls_dir = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}"
    os.makedirs(hls_dir, exist_ok=True)

    resolutions = {
        "1080p":  (1920, 1080, "5000k"),
        "720p": (1280, 720, "2800k"),
        "480p":  (854, 480, "1400k"),
    }

    for name in resolutions.keys():
        os.makedirs(f"{hls_dir}/resolution_{name}", exist_ok=True)

    with open(f"{hls_dir}/master.m3u8", "w") as f:
        f.write("#EXTM3U\n\n")
        for name, (width, height, bitrate) in resolutions.items():
            bandwidth = int(bitrate.replace("k", "")) * 1000
            f.write(f"#EXT-X-STREAM-INF:BANDWIDTH={bandwidth},RESOLUTION={width}x{height}\n")
            f.write(f"playlist_{name}.m3u8\n\n")
    
    try:
        for name, (width, height, bitrate) in resolutions.items():
            
            output_m3u8 = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}/resolution_{name}/playlist_{name}.m3u8"
            segment_pattern = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}/resolution_{name}/segment_%03d.ts"
            
            (
                ffmpeg
                .input(input_file)
                .output(
                    output_m3u8,
                    start_number=0,
                    vcodec="libx264",
                    preset="fast",
                    vf=f"scale={width}:{height}",
                    video_bitrate=bitrate,
                    format="hls",
                    hls_time=6,
                    hls_list_size=0,
                    hls_segment_filename=segment_pattern,
                    movflags="+faststart",
                    loglevel="error"
                )
                .run(overwrite_output=True)
            )
    except ffmpeg.Error as e:
        print(f"Err0r FFmpeg : {e}", flush=True)
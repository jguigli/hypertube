import ffmpeg
import os
import asyncio
from api.redis_client import redis_client

HLS_MOVIES_FOLDER = "hls_movies"

def run_ffmpeg(input_file, output_m3u8, segment_pattern, width, height, bitrate):
    try:    
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
                hls_playlist_type="vod",
                movflags="+faststart",
                loglevel="quiet"
            )
            .run(overwrite_output=True)
        )
    except ffmpeg.Error as e:
        print(f"Err0r FFmpeg : {e}", flush=True)


async def convert_to_hls(input_file, movie_id):
    hls_dir = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}"
    os.makedirs(hls_dir, exist_ok=True)

    resolutions = {
        "1080p":  (1920, 1080, "5000k"),
        "720p": (1280, 720, "2800k"),
        "480p":  (854, 480, "1400k"),
    }

    with open(f"{hls_dir}/master.m3u8", "w") as f:
        f.write("#EXTM3U\n\n")
        for resolution, (width, height, bitrate) in resolutions.items():
            bandwidth = int(bitrate.replace("k", "")) * 1000
            f.write(f"#EXT-X-STREAM-INF:BANDWIDTH={bandwidth},RESOLUTION={width}x{height}\n")
            f.write(f"{resolution}.m3u8\n\n")

    tasks = []
    for resolution, (width, height, bitrate) in resolutions.items():    
        output_m3u8 = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}/{resolution}.m3u8"
        segment_pattern = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}/segment_{resolution}_%03d.ts"
        
        task = asyncio.to_thread(run_ffmpeg, input_file, output_m3u8, segment_pattern, width, height, bitrate)
        tasks.append(task)

    await asyncio.gather(*tasks)
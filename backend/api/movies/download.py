import libtorrent as lt
import time
import asyncio
from sqlalchemy.orm import Session
from api.database import get_db
from fastapi import Depends, HTTPException
import os
import aiofiles
import subprocess
import ffmpeg
from api.redis_client import redis_client

from .models import Movie

CHUNK_SIZE = 524288
DOWNLOAD_MOVIES_FOLDER = "./downloads"

# def convert_mkv_to_mp4(input_file):
#     output_file = input_file.rsplit(".", 1)[0] + ".mp4"
    
#     command = [
#         "ffmpeg", "-i", input_file, 
#         "-c:v", "copy", "-c:a", "copy",  # Fast remuxing (no quality loss)
#         output_file
#     ]
    
#     try:
#         subprocess.run(command, check=True)
#         return output_file
#     except subprocess.CalledProcessError as e:
#         print(f"Error converting {input_file}: {e}")
#         return None

async def convert_mkv_chunk(chunk):
    """
    Convertit un chunk de MKV en MP4 en mémoire avec FFmpeg.
    """
    process = (
        ffmpeg
        .input('pipe:0', format='matroska')
        .output('pipe:1', format='mp4', movflags='frag_keyframe+empty_moov')
        .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
    )

    try:
        process.stdin.write(chunk)
        process.stdin.close()

        output = await asyncio.to_thread(process.stdout.read)

        return output

    finally:
        process.terminate()


async def file_streamer_mkv(file_path: str, start: int, end: int):
    async with aiofiles.open(file_path, 'rb') as f:
        await f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk_size = min(CHUNK_SIZE, remaining)
            chunk = await f.read(chunk_size)
            if not chunk:
                break
            yield await convert_mkv_chunk(chunk)
            remaining -= len(chunk)


# async def convert_mkv_chunk(process, chunk):
#     """
#     Convertit un chunk de MKV en MP4 via un processus FFmpeg ouvert.
#     """
#     try:
#         process.stdin.write(chunk)
#         await asyncio.to_thread(process.stdin.flush)  # S'assurer que les données sont bien envoyées
#         output = await asyncio.to_thread(process.stdout.read, len(chunk))  # Lire la sortie

#         return output  # Chunk transformé en MP4

#     except BrokenPipeError:
#         print("Erreur: le processus FFmpeg a fermé le pipe.")
#         return b""  # Retourner un chunk vide pour éviter la rupture du streaming

# async def file_streamer_mkv(file_path: str, start: int, end: int):
#     """
#     Lit un fichier MKV par chunks, convertit chaque chunk en MP4 avec un processus FFmpeg persistant.
#     """
#     process = (
#         ffmpeg
#         .input(file_path)  # Lire depuis stdin en MKV
#         .output('pipe:1', format='mp4', movflags='frag_keyframe+empty_moov')
#         .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
#     )

#     try:
#         async with aiofiles.open(file_path, 'rb') as f:
#             await f.seek(start)
#             remaining = end - start + 1

#             while remaining > 0:
#                 chunk_size = min(CHUNK_SIZE, remaining)
#                 chunk = await f.read(chunk_size)
#                 if not chunk:
#                     break
                
#                 converted_chunk = await convert_mkv_chunk(process, chunk)
#                 if not converted_chunk:
#                     break  # Arrêter si FFmpeg a planté

#                 yield converted_chunk
#                 remaining -= len(chunk)

#     finally:
#         process.stdin.close()
#         process.terminate()  # Fermer proprement FFmpeg


async def file_streamer(file_path: str, start: int, end: int):
    async with aiofiles.open(file_path, 'rb') as f:
        await f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk_size = min(CHUNK_SIZE, remaining)
            chunk = await f.read(chunk_size)
            if not chunk:
                break
            yield chunk
            remaining -= len(chunk)


async def download_torrent(magnet_link: str, movie_id: int):

    session = lt.session()
    session.listen_on(6881, 6891)
    session.apply_settings({
        'listen_interfaces': '0.0.0.0:6881',
        'announce_to_all_trackers': True,
        'announce_to_all_tiers': True,
    })
    # session.add_extension('ut_metadata')
    # session.add_extension('ut_pex')
    # session.add_extension('lt_trackers')
    session.start_dht()
    session.start_lsd()
    

    for router in [
        ("router.bittorrent.com", 6881),
        ("router.utorrent.com", 6881),
        ("dht.transmissionbt.com", 6881),
        ("dht.aelitis.com", 6881),
        ("router.bitcomet.com", 6881)
    ]:
        session.add_dht_router(*router)

    params = {
        "save_path": DOWNLOAD_MOVIES_FOLDER,
        "storage_mode": lt.storage_mode_t.storage_mode_sparse
    }

    handle = lt.add_magnet_uri(session, magnet_link, params)

    trackers = [
        "http://tracker.openbittorrent.com:80/announce",
        "http://tracker.opentrackr.org:1337/announce",
        "http://tracker.leechers-paradise.org:6969/announce"
    ]

    for tracker in trackers:
        handle.add_tracker({"url": tracker})


    while not handle.has_metadata():
        print("Waiting for torrent metadata", flush=True)
        alerts = session.pop_alerts()
        for a in alerts:
                print(a)
        await asyncio.sleep(1)
    
    torrent_info = handle.get_torrent_info()

    while handle.status().progress < 0.1:
        # print(f"Téléchargé : {handle.status().total_done} octets", flush=True)
        print(f"Progression : {handle.status().progress * 100:.2f}%", flush=True)
        await asyncio.sleep(1)
    
    file_path = ""
    for index in range(torrent_info.num_files()):
        file_entry = torrent_info.files().file_path(index)
    
        if file_entry.endswith(".mp4") or file_entry.endswith(".mkv"):
            file_path = os.path.join(DOWNLOAD_MOVIES_FOLDER, file_entry)
            break
        # elif file_path.endswith(".mkv"):
        #     print("Converting MKV to MP4")
        #     new_file_path = convert_mkv_to_mp4(file_path)
        #     if new_file_path:
        #         file_path = new_file_path
        #     break
    
    key_movie = f"movie_path:{movie_id}"
    redis_client.setex(key_movie, 60, file_path)

    while not handle.is_seed():
        print(f"Progression : {handle.status().progress * 100:.2f}%", flush=True)
        await asyncio.sleep(1)

    folder_path = f"{DOWNLOAD_MOVIES_FOLDER}/{torrent_info.name()}"

import libtorrent as lt
import asyncio
import os
import ffmpeg
import aiofiles
from ..websocket.websocket_manager import manager_websocket
from .crud import (
    get_movie_by_id,
)
from ..database import SessionLocal

DOWNLOAD_MOVIES_FOLDER = "./downloads"
CHUNK_SIZE = 4 * 1024 * 1024  # 4 Mo


async def convert_stream(file_path):
    pass_through = asyncio.Queue()

    async def read_file():
        process = (
            ffmpeg
            .input('pipe:0')
            .output(
                'pipe:1',
                format='mp4',
                preset='ultrafast',
                movflags='frag_keyframe+empty_moov'
            )
            .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
        )

        async def read_output():
            try:
                while True:
                    data = await asyncio.to_thread(process.stdout.read, CHUNK_SIZE)
                    if not data:
                        break
                    await pass_through.put(data)
                await pass_through.put(None)
            except Exception as e:
                print(f"[READ OUTPUT ERROR] {e}", flush=True)
            finally:
                await pass_through.put(None)

        output_task = asyncio.create_task(read_output())

        try:
            async with aiofiles.open(file_path, "rb") as file:
                while True:
                    chunk = await file.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    await asyncio.to_thread(process.stdin.write, chunk)
        except Exception as e:
            print(f"[STREAM ERROR] {e}", flush=True)
        finally:
            process.stdin.close()
            process.terminate()
            await output_task
            await process.wait()

    asyncio.create_task(read_file())

    async def queue_streamer():
        while True:
            chunk = await pass_through.get()
            if chunk is None:
                break
            yield chunk

    return queue_streamer()


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


async def download_torrent(magnet_link: str, movie_id: int, user_id: int):

    session = lt.session()
    session.listen_on(6881, 6891)
    session.apply_settings({
        'listen_interfaces': '0.0.0.0:6881',
        'announce_to_all_trackers': True,
        'announce_to_all_tiers': True,
    })
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
        "http://tracker.leechers-paradise.org:6969/announce",
        "http://glotorrents.pw:6969/announce",
        "http://torrent.gresille.org:80/announce",
        "http://p4p.arenabg.com:1337",
        "http://open.demonii.com:1337/announce",
        "http://tracker.coppersurfer.tk:6969"
    ]

    for tracker in trackers:
        handle.add_tracker({"url": tracker})

    while not handle.has_metadata():
        print("Waiting for torrent metadata", flush=True)
        alerts = session.pop_alerts()
        for a in alerts:
            print(a)
        await asyncio.sleep(5)

    torrent_info = handle.get_torrent_info()

    while handle.status().progress < 0.30:
        print(f"Progression : {handle.status().progress * 100:.2f}%", flush=True)
        await asyncio.sleep(5)

    file_path = ""
    for index in range(torrent_info.num_files()):
        file_entry = torrent_info.files().file_path(index)

        if file_entry.endswith((".mp4", ".mkv", ".avi", ".mov", ".flv")):
            file_path = os.path.join(DOWNLOAD_MOVIES_FOLDER, file_entry)
            db = SessionLocal()
            try:
                movie = get_movie_by_id(db, movie_id)
                movie.file_path = file_path
                movie.is_download = True
                db.commit()
            finally:
                db.close()

            await manager_websocket.send_message(
                user_id, "Movie is ready to standard streaming."
            )
            break

    while not handle.is_seed():
        print(
            f"Downloading : {handle.status().progress * 100:.2f}%", flush=True
        )
        await asyncio.sleep(5)


# import libtorrent as lt
# import asyncio
# import os
# import ffmpeg
# import aiofiles
# import concurrent.futures

# from api.redis_client import redis_client
# from ..websocket.websocket_manager import manager_websocket
# from .crud import (
#     get_movie_by_id,
# )
# from ..database import SessionLocal


# DOWNLOAD_MOVIES_FOLDER = "./downloads"
# CHUNK_SIZE = 4 * 1024 * 1024  # 4 Mo
# MAX_SIMULTANEOUS_DOWNLOADS = 1  # Ajuste selon ta machine
# download_executor = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_SIMULTANEOUS_DOWNLOADS)


# async def convert_stream(file_path):
#     pass_through = asyncio.Queue()

#     async def read_file():
#         process = (
#             ffmpeg
#             .input('pipe:0')
#             .output(
#                 'pipe:1',
#                 format='mp4',
#                 preset='ultrafast',
#                 movflags='frag_keyframe+empty_moov'
#             )
#             .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
#         )

#         async def read_output():
#             try:
#                 while True:
#                     data = await asyncio.to_thread(process.stdout.read, CHUNK_SIZE)
#                     if not data:
#                         break
#                     await pass_through.put(data)
#                 await pass_through.put(None)
#             except Exception as e:
#                 print(f"[READ OUTPUT ERROR] {e}", flush=True)
#             finally:
#                 await pass_through.put(None)

#         output_task = asyncio.create_task(read_output())

#         try:
#             async with aiofiles.open(file_path, "rb") as file:
#                 while True:
#                     chunk = await file.read(CHUNK_SIZE)
#                     if not chunk:
#                         break
#                     await asyncio.to_thread(process.stdin.write, chunk)
#         except Exception as e:
#             print(f"[STREAM ERROR] {e}", flush=True)
#         finally:
#             process.stdin.close()
#             process.terminate()
#             await output_task
#             await process.wait()

#     asyncio.create_task(read_file())

#     async def queue_streamer():
#         while True:
#             chunk = await pass_through.get()
#             if chunk is None:
#                 break
#             yield chunk

#     return queue_streamer()


# async def file_streamer(file_path: str, start: int, end: int):
#     async with aiofiles.open(file_path, 'rb') as f:
#         await f.seek(start)
#         remaining = end - start + 1
#         while remaining > 0:
#             chunk_size = min(CHUNK_SIZE, remaining)
#             chunk = await f.read(chunk_size)
#             if not chunk:
#                 break
#             yield chunk
#             remaining -= len(chunk)


# async def download_torrent(magnet_link: str, movie_id: int, user_id: int):

#     loop = asyncio.get_running_loop()

#     def blocking_download(loop):
#         session = lt.session()
#         session.listen_on(6881, 6891)
#         session.apply_settings({
#             'listen_interfaces': '0.0.0.0:6881',
#             'announce_to_all_trackers': True,
#             'announce_to_all_tiers': True,
#         })
#         session.start_dht()
#         session.start_lsd()

#         for router in [
#             ("router.bittorrent.com", 6881),
#             ("router.utorrent.com", 6881),
#             ("dht.transmissionbt.com", 6881),
#             ("dht.aelitis.com", 6881),
#             ("router.bitcomet.com", 6881)
#         ]:
#             session.add_dht_router(*router)

#         params = {
#             "save_path": DOWNLOAD_MOVIES_FOLDER,
#             "storage_mode": lt.storage_mode_t.storage_mode_sparse
#         }

#         handle = lt.add_magnet_uri(session, magnet_link, params)

#         trackers = [
#             "http://tracker.openbittorrent.com:80/announce",
#             "http://tracker.opentrackr.org:1337/announce",
#             "http://tracker.leechers-paradise.org:6969/announce",
#             "http://glotorrents.pw:6969/announce",
#             "http://torrent.gresille.org:80/announce",
#             "http://p4p.arenabg.com:1337",
#             "http://open.demonii.com:1337/announce",
#             "http://tracker.coppersurfer.tk:6969"
#         ]

#         for tracker in trackers:
#             handle.add_tracker({"url": tracker})

#         while not handle.has_metadata():
#             print("Waiting for torrent metadata", flush=True)
#             alerts = session.pop_alerts()
#             for a in alerts:
#                 print(a)
#             time.sleep(1)  # sleep court pour ne pas bloquer

#         torrent_info = handle.get_torrent_info()

#         while handle.status().progress < 0.30:
#             print(f"Progression : {handle.status().progress * 100:.2f}%", flush=True)
#             time.sleep(1)

#         file_path = ""
#         for index in range(torrent_info.num_files()):
#             file_entry = torrent_info.files().file_path(index)
#             if file_entry.endswith((".mp4", ".mkv", ".avi", ".mov", ".flv")):
#                 file_path = os.path.join(DOWNLOAD_MOVIES_FOLDER, file_entry)
#                 db = SessionLocal()
#                 try:
#                     movie = get_movie_by_id(db, movie_id)
#                     movie.file_path = file_path
#                     movie.is_download = True
#                     db.commit()
#                 finally:
#                     db.close()
#                 break

#         # Notify frontend as soon as enough data is available for streaming
#         notified_streamable = False
#         min_streamable_size = 10 * 1024 * 1024  # 10 MB, adjust as needed
#         while not handle.is_seed():
#             status = handle.status()
#             print(
#                 f"Downloading : {status.progress * 100:.2f}%", flush=True
#             )
#             if file_path and not notified_streamable:
#                 try:
#                     if os.path.exists(file_path):
#                         size = os.path.getsize(file_path)
#                         if size >= min_streamable_size:
#                             asyncio.run_coroutine_threadsafe(
#                                 manager_websocket.send_message(user_id, "Movie is ready to standard streaming."),
#                                 loop
#                             )
#                             notified_streamable = True
#                             # Set a redis flag to indicate that the movie is streamable
#                             redis_client.set(f"streamable:{movie_id}", "true")
#                 except Exception as e:
#                     print(f"[STREAMABLE NOTIFY ERROR] {e}", flush=True)
#             asyncio.sleep(5)

#         while not handle.is_seed():
#             print(
#                 f"Downloading : {handle.status().progress * 100:.2f}%", flush=True
#             )
#             asyncio.sleep(10)

#     import time
#     await loop.run_in_executor(download_executor, blocking_download, loop)


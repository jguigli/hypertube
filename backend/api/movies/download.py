import libtorrent as lt
import time
import asyncio
from sqlalchemy.orm import Session
from api.database import get_db
from fastapi import Depends
import os

from .models import Movie

CHUNK_SIZE = 1024
DOWNLOAD_MOVIES_FOLDER = "./downloads/"

async def file_streamer(file_path: str):
    with open(file_path, 'rb') as f:
        while True:
            piece = f.read(CHUNK_SIZE * CHUNK_SIZE) # 1Mo
            if not piece:
                break
            yield piece
            time.sleep(0.1)


async def download_torrent(movie: Movie):

    file_path = f"{DOWNLOAD_MOVIES_FOLDER}/movie_{movie.id}"

    session = lt.session()
    session.listen_on(6881, 6891)
    session.start_dht()

    session.add_dht_router("router.bittorrent.com", 6881)
    session.add_dht_router("router.utorrent.com", 6881)
    session.add_dht_router("dht.transmissionbt.com", 6881)
    session.add_dht_router("dht.aelitis.com", 6881)
    session.add_dht_router("router.bitcomet.com", 6881)

    params = {
        "save_path": file_path,
        "storage_mode": lt.storage_mode_t.storage_mode_sparse
    }

    handle = lt.add_magnet_uri(session, movie.magnet_link, params)

    handle.add_tracker({"url": "udp://tracker.openbittorrent.com:80/announce"})
    handle.add_tracker({"url": "udp://tracker.opentrackr.org:1337/announce"})
    handle.add_tracker({"url": "udp://tracker.leechers-paradise.org:6969/announce"})

    while not handle.has_metadata():
        print("Waiting for torrent metadata", flush=True)
        await asyncio.sleep(1)

    # while not handle.is_seed():
    #     status = handle.status()
    #     print(f"Progression : {status.progress * 100:.2f}%")
    #     time.sleep(1)

    torrent_info = handle.get_torrent_info()
    print(torrent_info)

    # file_path = os.path.join(DOWNLOAD_MOVIES_FOLDER + torrent_info.files().file_path(0))
    # print(f"file path : {file_path}")

    while os.path.exists(file_path) and os.stat(file_path).st_size < CHUNK_SIZE * CHUNK_SIZE:  # attendre 1 Mo minimum
        await asyncio.sleep(1)

    return file_path

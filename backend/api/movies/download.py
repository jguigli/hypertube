import libtorrent as lt
import asyncio
import os


DOWNLOAD_MOVIES_FOLDER = "./downloads"


async def download_torrent(magnet_link: str, movie_id: int):

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

    current_try = 0
    max_try = 42
    while not handle.has_metadata():
        print("Waiting for torrent metadata", flush=True)
        alerts = session.pop_alerts()
        for a in alerts:
            print(a)
        await asyncio.sleep(5)
        current_try += 1
        if current_try >= max_try:
            print("Failed to get metadata", flush=True)
            return None

    torrent_info = handle.get_torrent_info()

    while not handle.is_seed():
        print(
            f"Downloading : {handle.status().progress * 100:.2f}%", flush=True
        )
        await asyncio.sleep(5)

    file_path = ""
    for index in range(torrent_info.num_files()):
        file_entry = torrent_info.files().file_path(index)

        if file_entry.endswith((".mp4", ".mkv", ".avi", ".mov", ".flv")):
            file_path = os.path.join(DOWNLOAD_MOVIES_FOLDER, file_entry)
            break

    return file_path

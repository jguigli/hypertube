export default function Footer() {

    const year: number = new Date().getFullYear()

    return (
        <footer className="col-span-1 row-span-1 row-start-3 col-start-2">
            <span>© {year}</span>
        </footer>
    )
}

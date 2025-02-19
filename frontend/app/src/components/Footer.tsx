export default function Footer() {

    const year: number = new Date().getFullYear()

    return (
        <footer>
            <span>© {year}</span>
        </footer>
    )
}

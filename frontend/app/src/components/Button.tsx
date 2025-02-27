export default function Button(
    props: {
        text: string;
        onClick: () => void;
        type?: "button" | "submit" | "reset";
    }
) {
    return (
        <button
            onClick={props.onClick}
            type={props.type || "button"}
            className="bg-gray-800 hover:bg-gray-600 text-white font-bold py-0.5 px-3 rounded"
            color="secondary"
        >
            {props.text}
        </button>
    );
}
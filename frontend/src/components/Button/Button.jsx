const Button = ({ label, onClick, disabled = false }) => {
    return (
        <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md transition-colors duration-200
            hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
        {label}
        </button>
    );
}

export default Button;

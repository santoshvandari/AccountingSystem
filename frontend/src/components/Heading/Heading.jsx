const Heading = ({ text, level = 1 }) => {
    const HeadingTag = `h${level}`;
    
    return (
        <HeadingTag className={`text-${level === 1 ? '3xl' : '2xl'} font-bold text-gray-800 mb-4`}>
        {text}
        </HeadingTag>
    );
}
